create extension if not exists pgcrypto;

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 80),
  challenge_type text not null check (challenge_type in ('password', 'code', 'log_analysis', 'security_breach', 'digital_forensics')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  description text not null,
  question text not null,
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  correct_answer text not null,
  hint text not null,
  explanation text not null,
  points integer not null check (points between 1 and 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 3 and 16),
  total_score integer not null default 0 check (total_score >= 0),
  correct_answers integer not null default 0 check (correct_answers between 0 and 5),
  incorrect_answers integer not null default 0 check (incorrect_answers >= 0),
  total_questions integer not null default 5 check (total_questions = 5),
  completion_time integer not null default 0 check (completion_time >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  challenge_ids uuid[] not null,
  resolved_challenge_ids uuid[] not null default '{}',
  hinted_challenge_ids uuid[] not null default '{}',
  token_hash text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create unique index game_sessions_one_active_name
  on public.game_sessions (lower(player_name)) where status = 'active';
create index game_sessions_finished_rank
  on public.game_sessions (total_score desc, correct_answers desc, completion_time asc)
  where status = 'completed';
create index game_sessions_started_at on public.game_sessions (started_at desc);

create table public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  request_id uuid not null unique,
  submitted_answer text not null check (char_length(submitted_answer) between 1 and 500),
  is_correct boolean not null,
  points_earned integer not null default 0 check (points_earned >= 0),
  attempt_number integer not null check (attempt_number between 1 and 3),
  answered_at timestamptz not null default now()
);
create index session_answers_session_challenge on public.session_answers(session_id, challenge_id);

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table public.leaderboard_entries (
  session_id uuid primary key references public.game_sessions(id) on delete cascade,
  player_name text not null,
  total_score integer not null,
  correct_answers integer not null,
  total_questions integer not null,
  completion_time integer not null,
  finished_at timestamptz not null
);
create index leaderboard_entries_rank on public.leaderboard_entries
  (total_score desc, correct_answers desc, completion_time asc);

create table public.rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null
);

alter table public.challenges enable row level security;
alter table public.game_sessions enable row level security;
alter table public.session_answers enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.rate_limits enable row level security;

create policy "Public can read safe leaderboard fields"
  on public.leaderboard_entries for select to anon, authenticated using (true);
create policy "Admins can read their own profile"
  on public.admin_profiles for select to authenticated using (user_id = auth.uid());
create policy "Admins can manage challenges"
  on public.challenges for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));
create policy "Admins can view game sessions"
  on public.game_sessions for select to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid()));
create policy "Admins can view session answers"
  on public.session_answers for select to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid()));
grant select on public.leaderboard_entries to anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant select on public.game_sessions, public.session_answers to authenticated;
grant select, insert, update, delete on public.challenges to authenticated;

create or replace function public.consume_rate_limit(p_key_hash text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  insert into public.rate_limits(key_hash, window_started_at, request_count)
  values (p_key_hash, now(), 1)
  on conflict (key_hash) do update
  set request_count = case
        when rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
        else rate_limits.request_count + 1
      end,
      window_started_at = case
        when rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
        else rate_limits.window_started_at
      end
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;

create or replace function public.game_use_hint(p_session_id uuid, p_token_hash text, p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  challenge_hint text;
begin
  select * into s from public.game_sessions where id = p_session_id for update;
  if not found or s.status <> 'active' or s.token_hash <> p_token_hash then
    raise exception 'Session is invalid or no longer active';
  end if;
  if s.started_at < now() - interval '10 minutes' then raise exception 'The session time limit has expired'; end if;
  if not (p_challenge_id = any(s.challenge_ids)) or p_challenge_id = any(s.resolved_challenge_ids) then
    raise exception 'Challenge is not available';
  end if;
  select hint into challenge_hint from public.challenges where id = p_challenge_id and is_active;
  if challenge_hint is null then raise exception 'Challenge is not available'; end if;
  if not (p_challenge_id = any(s.hinted_challenge_ids)) then
    update public.game_sessions
    set hinted_challenge_ids = array_append(hinted_challenge_ids, p_challenge_id)
    where id = p_session_id;
  end if;
  return jsonb_build_object('hint', challenge_hint);
end;
$$;

create or replace function public.game_submit_answer(
  p_session_id uuid, p_token_hash text, p_challenge_id uuid,
  p_submitted_answer text, p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  c public.challenges%rowtype;
  previous public.session_answers%rowtype;
  attempts integer;
  answer_is_correct boolean;
  earned integer;
begin
  select * into s from public.game_sessions where id = p_session_id for update;
  if not found or s.status <> 'active' or s.token_hash <> p_token_hash then
    raise exception 'Session is invalid or no longer active';
  end if;
  if s.started_at < now() - interval '10 minutes' then raise exception 'The session time limit has expired'; end if;
  select * into previous from public.session_answers where request_id = p_request_id;
  if found then
    if previous.session_id <> p_session_id then raise exception 'Request identifier has already been used'; end if;
    return jsonb_build_object('is_correct', previous.is_correct, 'points_earned', previous.points_earned,
      'attempts_left', greatest(0, 3 - previous.attempt_number), 'explanation',
      case when previous.is_correct or previous.attempt_number = 3
        then (select explanation from public.challenges where id = p_challenge_id)
        else 'Not quite. Review the clues and try again.' end);
  end if;
  if not (p_challenge_id = any(s.challenge_ids)) or p_challenge_id = any(s.resolved_challenge_ids) then
    raise exception 'Challenge is not available';
  end if;
  select count(*) into attempts from public.session_answers
    where session_id = p_session_id and challenge_id = p_challenge_id;
  if attempts >= 3 then raise exception 'No attempts remain for this challenge'; end if;
  select * into c from public.challenges where id = p_challenge_id and is_active;
  if not found then raise exception 'Challenge is not available'; end if;
  answer_is_correct := lower(btrim(p_submitted_answer)) = lower(btrim(c.correct_answer));
  earned := case when answer_is_correct then greatest(0, c.points -
    case when p_challenge_id = any(s.hinted_challenge_ids) then 25 else 0 end) else 0 end;
  insert into public.session_answers(session_id, challenge_id, request_id, submitted_answer,
    is_correct, points_earned, attempt_number)
  values (p_session_id, p_challenge_id, p_request_id, btrim(p_submitted_answer),
    answer_is_correct, earned, attempts + 1);
  update public.game_sessions set
    total_score = total_score + earned,
    correct_answers = correct_answers + case when answer_is_correct then 1 else 0 end,
    incorrect_answers = incorrect_answers + case when answer_is_correct then 0 else 1 end,
    resolved_challenge_ids = case when answer_is_correct or attempts + 1 = 3
      then array_append(resolved_challenge_ids, p_challenge_id) else resolved_challenge_ids end
  where id = p_session_id;
  return jsonb_build_object('is_correct', answer_is_correct, 'points_earned', earned,
    'attempts_left', greatest(0, 2 - attempts),
    'explanation', case when answer_is_correct or attempts + 1 = 3
      then c.explanation else 'Not quite. Review the clues and try again.' end);
end;
$$;

create or replace function public.game_finish(p_session_id uuid, p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.game_sessions%rowtype;
  final_score integer;
  elapsed integer;
  final_status text;
  final_rank integer;
  personal_best boolean;
begin
  select * into s from public.game_sessions where id = p_session_id for update;
  if not found or s.token_hash <> p_token_hash then raise exception 'Session is invalid'; end if;
  if s.status <> 'active' then
    if s.status = 'completed' then
      select count(*) + 1 into final_rank from public.leaderboard_entries e
      where e.session_id <> s.id and (e.total_score > s.total_score
        or (e.total_score = s.total_score and e.correct_answers > s.correct_answers)
        or (e.total_score = s.total_score and e.correct_answers = s.correct_answers and e.completion_time < s.completion_time)
        or (e.total_score = s.total_score and e.correct_answers = s.correct_answers
          and e.completion_time = s.completion_time and (e.finished_at < s.finished_at
            or (e.finished_at = s.finished_at and e.session_id < s.id))));
      select not exists (select 1 from public.leaderboard_entries e
        where e.session_id <> s.id and lower(e.player_name) = lower(s.player_name)
          and e.total_score >= s.total_score) into personal_best;
    end if;
    return jsonb_build_object('total_score', s.total_score, 'correct_answers', s.correct_answers,
      'incorrect_answers', s.total_questions - s.correct_answers, 'total_questions', s.total_questions,
      'completion_time', s.completion_time, 'accuracy', round(s.correct_answers::numeric * 100 / s.total_questions),
      'rank', final_rank, 'new_personal_best', coalesce(personal_best, false));
  end if;
  elapsed := greatest(0, floor(extract(epoch from now() - s.started_at))::integer);
  final_status := case when cardinality(s.resolved_challenge_ids) = s.total_questions then 'completed' else 'abandoned' end;
  final_score := s.total_score + case when final_status = 'completed' and s.correct_answers = s.total_questions then 100 else 0 end;
  update public.game_sessions set status = final_status, total_score = final_score,
    completion_time = elapsed, finished_at = now() where id = p_session_id;
  if final_status = 'completed' then
    insert into public.leaderboard_entries(session_id, player_name, total_score,
      correct_answers, total_questions, completion_time, finished_at)
    values (s.id, s.player_name, final_score, s.correct_answers, s.total_questions, elapsed, now())
    on conflict (session_id) do nothing;
    select count(*) + 1 into final_rank from public.leaderboard_entries e
    where e.session_id <> s.id and (
      e.total_score > final_score
      or (e.total_score = final_score and e.correct_answers > s.correct_answers)
      or (e.total_score = final_score and e.correct_answers = s.correct_answers and e.completion_time < elapsed)
      or (e.total_score = final_score and e.correct_answers = s.correct_answers
        and e.completion_time = elapsed and e.finished_at < now())
      or (e.total_score = final_score and e.correct_answers = s.correct_answers
        and e.completion_time = elapsed and e.finished_at = now() and e.session_id < s.id)
    );
    select not exists (select 1 from public.leaderboard_entries e
      where e.session_id <> s.id and lower(e.player_name) = lower(s.player_name)
        and e.total_score >= final_score) into personal_best;
  end if;
  return jsonb_build_object('total_score', final_score, 'correct_answers', s.correct_answers,
    'incorrect_answers', s.total_questions - s.correct_answers, 'total_questions', s.total_questions,
    'completion_time', elapsed, 'accuracy', round(s.correct_answers::numeric * 100 / s.total_questions),
    'rank', final_rank, 'new_personal_best', coalesce(personal_best, false));
end;
$$;

create or replace function public.admin_summary()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'total_players', (select count(distinct lower(player_name)) from public.game_sessions where status = 'completed'),
    'games_played', (select count(*) from public.game_sessions where status = 'completed'),
    'average_score', coalesce((select round(avg(total_score))::integer from public.game_sessions where status = 'completed'), 0),
    'highest_score', coalesce((select max(total_score) from public.game_sessions where status = 'completed'), 0)
  );
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.game_use_hint(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.game_submit_answer(uuid, text, uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.game_finish(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_summary() from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.game_use_hint(uuid, text, uuid) to service_role;
grant execute on function public.game_submit_answer(uuid, text, uuid, text, uuid) to service_role;
grant execute on function public.game_finish(uuid, text) to service_role;
grant execute on function public.admin_summary() to service_role;

insert into public.challenges
  (title, challenge_type, difficulty, description, question, options, correct_answer, hint, explanation, points)
values
('The Leaked Note', 'password', 'easy', 'A training account left a clue in its onboarding note.', 'The passphrase is a common four-letter color followed by 2024. Which candidate matches the clue?', '["blue2024","winter2024","bluebird","orange2023"]', 'blue2024', 'Think of a basic color name.', 'The clue explicitly pointed to a short color and the year. In real systems, never reuse predictable passwords.', 100),
('Pattern Break', 'password', 'medium', 'A simulated vault password follows a simple pattern.', 'Find the eight-character code: the standard two-letter abbreviation for northwest, then the number of sides on a hexagon padded to six digits.', '["NW000006","NE000006","SW000006","NW000005"]', 'NW000006', 'Use NW, then pad the number to six digits.', 'NW000006 combines NW with the six sides of a hexagon, padded to six digits.', 200),
('Phrase Recovery', 'password', 'hard', 'Recover a passphrase from a fictional security memo.', 'The memo says: "Use the word spelled H-A-R-B-O-R, then an exclamation mark, then 3 1 4." What exact candidate fits?', '["harbor!314","safeplace314","harbor314","harbour!314"]', 'harbor!314', 'Use the exact spelling written in the memo.', 'Harbor!314 follows the memo exactly. Multi-factor authentication is still needed for a real account.', 300),
('Shift Cipher', 'code', 'easy', 'A short message was shifted using a Caesar cipher.', 'Decode this message. Each letter was shifted forward by 1: USBJOJOH. What is the original word?', '["training","security","trailing","trainers"]', 'training', 'Shift each letter one place backward in the alphabet.', 'Shifting each letter back one yields TRAINING.', 100),
('Rotating Signal', 'code', 'medium', 'The sender used a classic letter-rotation cipher.', 'Decode: TUBDL. The cipher rotates letters forward by 1 when encrypting.', '["stack","attack","crack","trace"]', 'stack', 'Reverse the one-letter rotation.', 'Reversing the rotation gives STACK.', 200),
('Encoded Beacon', 'code', 'hard', 'A beacon was encoded as hexadecimal ASCII.', 'Decode hex 54 52 41 43 45 into the five-letter word.', '["TRACE","TRACK","TRAIL","TRUCE"]', 'TRACE', 'The bytes are ASCII character codes; 54 is the letter T.', 'The hex bytes decode to TRACE.', 300),
('Login Outlier', 'log_analysis', 'easy', 'Review the harmless training log and spot the unusual sign-in.', E'09:01 success user-ana 10.1.1.8\n09:03 success user-ben 10.1.1.9\n09:04 fail user-ana 10.1.1.8\n09:05 success user-ana 203.0.113.77\nWhich event is most suspicious?', '["user-ana from 203.0.113.77 at 09:05","user-ben from 10.1.1.9 at 09:03","user-ana failed at 09:04","user-ana succeeded at 09:01"]', 'user-ana from 203.0.113.77 at 09:05', 'Look for a successful login from outside the usual 10.1.1.x network.', 'The successful login from an unfamiliar network is the outlier and merits investigation.', 100),
('Burst of Failures', 'log_analysis', 'medium', 'An analyst noticed repeated authentication failures in a simulation.', E'Which account has the strongest sign of a password-guessing attempt?\n10:10 fail acct-k 198.51.100.8\n10:10 fail acct-k 198.51.100.8\n10:11 fail acct-k 198.51.100.8\n10:12 success acct-m 10.2.0.3', '["acct-k","acct-m","neither account","both equally"]', 'acct-k', 'Repeated failures from one source target the same account.', 'Three rapid failures against acct-k from the same address are suspicious and should trigger review.', 200),
('Unexpected Privilege', 'log_analysis', 'hard', 'Compare the normal activity with an unusual administrative event.', E'14:00 user lee login success\n14:02 user lee read report.pdf\n14:03 user lee role changed to admin\n14:04 user lee logout\nWhich event needs immediate investigation?', '["the role change to admin","the successful login","reading report.pdf","the logout"]', 'the role change to admin', 'A standard user should not gain administrator privileges without an approved change.', 'The role elevation is the critical event. Verify authorization and review the audit trail.', 300),
('Unknown USB', 'security_breach', 'easy', 'A colleague finds an unlabelled USB drive in a public area.', 'What is the safest next action?', '["Plug it into a work laptop to identify the owner","Give it to IT/security without connecting it","Take it home and inspect it","Copy its files to a shared drive"]', 'Give it to IT/security without connecting it', 'Removable media can carry malware even when it looks harmless.', 'Hand it to the security team. Do not connect unknown removable media to any device.', 100),
('Suspicious Link', 'security_breach', 'medium', 'An urgent email asks you to sign in through an unfamiliar link.', 'Which response best follows security practice?', '["Open the link on a phone instead","Report the email and verify with the sender through a known channel","Reply with your password to confirm","Forward it to the whole team"]', 'Report the email and verify with the sender through a known channel', 'Urgency and an unexpected sign-in request are phishing warning signs.', 'Report it and verify using a trusted contact method; never enter credentials through the suspicious link.', 200),
('Exposed Records', 'security_breach', 'hard', 'A public project folder accidentally contains customer records.', 'What should the first responder do?', '["Delete all files without telling anyone","Restrict access if authorized, preserve evidence, and notify incident response","Post a warning with the customer list","Wait to see whether anyone downloads it"]', 'Restrict access if authorized, preserve evidence, and notify incident response', 'Contain exposure while preserving evidence and following the incident process.', 'Restrict access within your authority, preserve evidence, and promptly alert the incident response team.', 300),
('File Integrity', 'digital_forensics', 'easy', 'An analyst compares known hashes against a supplied evidence manifest.', E'Which file should be prioritized for review?\nreadme.txt SHA256: matches baseline\nagent.bin SHA256: mismatch\nphoto.jpg SHA256: matches baseline\nWhich file changed?', '["readme.txt","agent.bin","photo.jpg","none"]', 'agent.bin', 'Only one hash does not match the baseline.', 'agent.bin has a hash mismatch, so its integrity should be investigated.', 100),
('Timeline Clue', 'digital_forensics', 'medium', 'Build a simple timeline from simulated endpoint events.', E'A user reports activity at 16:00. Which event happened first?\n15:42 file copied to USB\n15:51 browser opened\n16:02 account locked\n16:10 device disconnected', '["file copied to USB","browser opened","account locked","device disconnected"]', 'file copied to USB', 'Compare the timestamps in ascending order.', 'The USB file copy at 15:42 is the earliest listed event.', 200),
('Evidence Correlation', 'digital_forensics', 'hard', 'Correlate the simulated endpoint and network records.', 'Endpoint: backup.zip created at 02:14. Network: unusual outbound transfer begins at 02:16. Which lead is most relevant?', '["the close timing between archive creation and outbound transfer","the device wallpaper","a routine login at 08:00","a printer job from yesterday"]', 'the close timing between archive creation and outbound transfer', 'The two events occur only two minutes apart.', 'The close timing suggests the archive creation and outbound transfer may be related; preserve both records for analysis.', 300);

alter publication supabase_realtime add table public.leaderboard_entries;
