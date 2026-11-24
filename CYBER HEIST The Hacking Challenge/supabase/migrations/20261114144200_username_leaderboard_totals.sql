create or replace function public.leaderboard_by_player(
  p_filter text default 'all',
  p_player_name text default null,
  p_limit integer default 100
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with params as (
    select
      case when p_filter in ('today', 'fastest') then p_filter else 'all' end as selected_filter,
      date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila' as today_start
  ),
  filtered_entries as (
    select e.session_id, e.player_name, e.total_score, e.correct_answers,
      e.total_questions, e.completion_time, e.finished_at
    from public.leaderboard_entries e
    cross join params p
    where p.selected_filter <> 'today' or e.finished_at >= p.today_start
  ),
  aggregated_players as (
    select
      lower(e.player_name) as player_key,
      (array_agg(e.player_name order by e.finished_at desc, e.session_id desc))[1] as player_name,
      sum(e.total_score)::bigint as total_score,
      sum(e.correct_answers)::bigint as correct_answers,
      sum(e.total_questions)::bigint as total_questions,
      sum(e.completion_time)::bigint as completion_time,
      max(e.finished_at) as finished_at,
      count(*)::bigint as run_count
    from filtered_entries e
    group by lower(e.player_name)
  ),
  fastest_candidates as (
    select
      lower(e.player_name) as player_key,
      e.player_name,
      e.total_score::bigint as total_score,
      e.correct_answers::bigint as correct_answers,
      e.total_questions::bigint as total_questions,
      e.completion_time::bigint as completion_time,
      e.finished_at,
      count(*) over (partition by lower(e.player_name))::bigint as run_count,
      row_number() over (
        partition by lower(e.player_name)
        order by e.completion_time asc, e.total_score desc, e.correct_answers desc,
          e.finished_at asc, e.session_id asc
      ) as player_run_rank
    from filtered_entries e
  ),
  players as (
    select a.player_key, a.player_name, a.total_score, a.correct_answers,
      a.total_questions, a.completion_time, a.finished_at, a.run_count
    from aggregated_players a
    cross join params p
    where p.selected_filter <> 'fastest'

    union all

    select f.player_key, f.player_name, f.total_score, f.correct_answers,
      f.total_questions, f.completion_time, f.finished_at, f.run_count
    from fastest_candidates f
    cross join params p
    where p.selected_filter = 'fastest' and f.player_run_rank = 1
  ),
  ranked as (
    select
      row_number() over (
        order by
          case when p.selected_filter = 'fastest' then u.completion_time end asc nulls last,
          case when p.selected_filter <> 'fastest' then u.total_score end desc nulls last,
          u.correct_answers desc,
          case when p.selected_filter = 'fastest' then u.total_score end desc nulls last,
          u.completion_time asc,
          u.finished_at asc,
          u.player_key asc
      ) as rank,
      u.player_key, u.player_name, u.total_score, u.correct_answers,
      u.total_questions, u.completion_time, u.finished_at, u.run_count
    from players u
    cross join params p
  ),
  top_players as (
    select r.*
    from ranked r
    order by r.rank
    limit greatest(0, least(coalesce(p_limit, 100), 100000))
  )
  select jsonb_build_object(
    'participant_count', (select count(*) from players),
    'entries', coalesce(
      (select jsonb_agg(to_jsonb(t) - 'player_key' order by t.rank) from top_players t),
      '[]'::jsonb
    ),
    'player_rank', (select r.rank from ranked r where r.player_key = lower(p_player_name)),
    'player_total_score', (select r.total_score from ranked r where r.player_key = lower(p_player_name))
  );
$$;

revoke all on function public.leaderboard_by_player(text, text, integer) from public, anon, authenticated;
grant execute on function public.leaderboard_by_player(text, text, integer) to service_role;
