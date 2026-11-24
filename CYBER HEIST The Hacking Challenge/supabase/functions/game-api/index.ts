import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const validTypes = ['password', 'code', 'log_analysis', 'security_breach', 'digital_forensics']
const validDifficulties = ['easy', 'medium', 'hard']
const forbiddenNames = ['admin', 'administrator', 'support', 'moderator', 'fuck', 'shit', 'nigger', 'cunt']

class HttpError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function shuffle<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const bytes = crypto.getRandomValues(new Uint32Array(1))
    const swap = bytes[0] % (index + 1)
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return shuffled
}

async function rateLimit(client: SupabaseClient, request: Request, action: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')
    || 'unknown'
  const keyHash = await hash(`${action}:${forwarded}`)
  const { data, error } = await client.rpc('consume_rate_limit', {
    p_key_hash: keyHash,
    p_limit: action === 'start' ? 8 : 40,
    p_window_seconds: 60,
  })
  if (error) throw new HttpError('Rate limiting is temporarily unavailable.', 503)
  if (!data) throw new HttpError('Too many requests. Please wait a minute and try again.', 429)
}

async function requireAdmin(request: Request, url: string, anonKey: string, service: SupabaseClient) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError('Administrator sign-in is required.', 401)
  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  if (userError || !userData.user) throw new HttpError('Administrator session is invalid.', 401)
  const { data: profile, error } = await service.from('admin_profiles')
    .select('role').eq('user_id', userData.user.id).maybeSingle()
  if (error) throw new HttpError('Administrator permissions could not be verified.', 503)
  if (profile?.role !== 'admin') throw new HttpError('Administrator access is not authorized.', 403)
}

async function startGame(client: SupabaseClient, body: Record<string, unknown>) {
  const playerName = typeof body.player_name === 'string' ? body.player_name.trim() : ''
  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : ''
  if (!/^[a-zA-Z0-9_-]{3,16}$/.test(playerName)) throw new HttpError('Use 3–16 letters, numbers, underscores, or hyphens.')
  const normalizedName = playerName.toLowerCase()
  if (forbiddenNames.some((word) => normalizedName.includes(word))) throw new HttpError('Please choose a different nickname.')
  if (!validDifficulties.includes(difficulty)) throw new HttpError('Choose a valid difficulty.')
  const { error: expiredError } = await client.from('game_sessions').update({ status: 'abandoned', finished_at: new Date().toISOString() })
    .eq('status', 'active').lt('started_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
  if (expiredError) throw new HttpError('Could not clear expired game sessions.', 503)

  const { data: challenges, error } = await client.from('challenges')
    .select('id,title,challenge_type,difficulty,description,question,options,points')
    .eq('is_active', true).eq('difficulty', difficulty)
  if (error) throw new HttpError('Challenge set is unavailable.', 503)

  const selected = validTypes.map((type) => shuffle((challenges ?? []).filter((challenge) => challenge.challenge_type === type))[0])
    .filter((challenge) => challenge !== undefined)
  if (selected.length !== validTypes.length) throw new HttpError('This difficulty does not have five active challenge types yet.', 503)
  const randomized = shuffle(selected)
  const token = randomToken()
  const { data: session, error: insertError } = await client.from('game_sessions').insert({
    player_name: playerName,
    difficulty,
    challenge_ids: randomized.map((challenge) => challenge.id),
    token_hash: await hash(token),
  }).select('id,started_at').single()
  if (insertError?.code === '23505') throw new HttpError('That nickname already has an active run. Choose another or try again later.', 409)
  if (insertError) throw new HttpError('Could not reserve a game session.', 503)
  return {
    session_id: session.id,
    started_at: session.started_at,
    token,
    challenges: randomized,
  }
}

async function leaderboard(client: SupabaseClient, requestedFilter: unknown) {
  const filter = requestedFilter === 'today' || requestedFilter === 'fastest' ? requestedFilter : 'all'
  const { data, error } = await client.rpc('leaderboard_by_player', {
    p_filter: filter,
    p_player_name: null,
    p_limit: 100,
  })
  if (error) throw new HttpError('Leaderboard is temporarily unavailable.', 503)
  if (!data || typeof data !== 'object' || !Array.isArray(data.entries) || typeof data.participant_count !== 'number') {
    throw new HttpError('Leaderboard data is invalid.', 503)
  }
  return { participant_count: data.participant_count, entries: data.entries }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173')
    .split(',').map((item) => item.trim()).filter(Boolean)
  if (request.method === 'OPTIONS') {
    if (origin && !allowedOrigins.includes(origin)) return new Response(null, { status: 403 })
    return new Response('ok', { headers: corsHeaders(origin) })
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin)
  if (origin && !allowedOrigins.includes(origin)) return json({ error: 'Origin is not allowed.' }, 403, origin)

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anonKey || !serviceKey) return json({ error: 'Server configuration is incomplete.' }, 503, origin)
  const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  try {
    const body = await request.json() as Record<string, unknown>
    const action = typeof body.action === 'string' ? body.action : ''
    const adminActions = ['admin_summary', 'admin_challenges', 'admin_session_detail', 'admin_save_challenge', 'admin_toggle_challenge', 'admin_delete_challenge', 'admin_reset_leaderboard', 'admin_export_leaderboard']
    if (adminActions.includes(action)) await requireAdmin(request, url, anonKey, client)
    await rateLimit(client, request, adminActions.includes(action) ? 'admin' : action || 'unknown')

    switch (action) {
      case 'start':
        return json(await startGame(client, body), 200, origin)
      case 'nickname_available': {
        const playerName = typeof body.player_name === 'string' ? body.player_name.trim() : ''
        if (!/^[a-zA-Z0-9_-]{3,16}$/.test(playerName)) throw new HttpError('Use 3–16 letters, numbers, underscores, or hyphens.')
        if (forbiddenNames.some((word) => playerName.toLowerCase().includes(word))) return json({ available: false }, 200, origin)
        const { data, error } = await client.from('game_sessions').select('player_name')
          .eq('status', 'active')
        if (error) throw new HttpError('Nickname availability could not be checked.', 503)
        return json({ available: !(data ?? []).some((row) => row.player_name.toLowerCase() === playerName.toLowerCase()) }, 200, origin)
      }
      case 'hint': {
        const { data, error } = await client.rpc('game_use_hint', {
          p_session_id: body.session_id, p_token_hash: await hash(String(body.token ?? '')),
          p_challenge_id: body.challenge_id,
        })
        if (error) throw new HttpError(error.message)
        return json(data, 200, origin)
      }
      case 'submit': {
        if (typeof body.submitted_answer !== 'string' || body.submitted_answer.length < 1 || body.submitted_answer.length > 500) {
          throw new HttpError('Answer must be between 1 and 500 characters.')
        }
        if (typeof body.request_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.request_id)) throw new HttpError('Invalid request identifier.')
        const { data, error } = await client.rpc('game_submit_answer', {
          p_session_id: body.session_id, p_token_hash: await hash(String(body.token ?? '')),
          p_challenge_id: body.challenge_id, p_submitted_answer: body.submitted_answer,
          p_request_id: body.request_id,
        })
        if (error) throw new HttpError(error.message)
        return json(data, 200, origin)
      }
      case 'finish': {
        const { data, error } = await client.rpc('game_finish', {
          p_session_id: body.session_id, p_token_hash: await hash(String(body.token ?? '')),
        })
        if (error) throw new HttpError(error.message)
        if (typeof data?.rank !== 'number') return json(data, 200, origin)
        const { data: session, error: sessionError } = await client.from('game_sessions')
          .select('player_name').eq('id', body.session_id).maybeSingle()
        if (sessionError) throw new HttpError('Could not load the completed player score.', 503)
        if (!session) throw new HttpError('Completed game session was not found.', 404)
        const { data: totals, error: totalsError } = await client.rpc('leaderboard_by_player', {
          p_filter: 'all', p_player_name: session.player_name, p_limit: 1,
        })
        if (totalsError) throw new HttpError('Cumulative player score could not be calculated.', 503)
        if (typeof totals?.player_rank !== 'number' || typeof totals?.player_total_score !== 'number') {
          throw new HttpError('Cumulative player score is unavailable.', 503)
        }
        return json({
          ...data,
          rank: totals.player_rank,
          cumulative_score: totals.player_total_score,
        }, 200, origin)
      }
      case 'leaderboard':
        return json(await leaderboard(client, body.filter), 200, origin)
      case 'admin_summary': {
        const { data: metrics, error: metricsError } = await client.rpc('admin_summary')
        if (metricsError) throw new HttpError('Could not load session statistics.', 503)
        const { data: recentData, error: recentError } = await client.from('leaderboard_entries')
          .select('session_id,player_name,total_score,correct_answers,total_questions,completion_time,finished_at')
          .order('finished_at', { ascending: false }).limit(10)
        if (recentError) throw new HttpError('Could not load recent sessions.', 503)
        return json({
          ...metrics,
          recent_games: (recentData ?? []).map((row, index) => ({ ...row, rank: index + 1 })),
        }, 200, origin)
      }
      case 'admin_challenges': {
        const { data, error } = await client.from('challenges')
          .select('id,title,challenge_type,difficulty,description,question,options,correct_answer,hint,explanation,points,is_active,created_at')
          .order('created_at', { ascending: false })
        if (error) throw new HttpError('Could not load challenges.', 503)
        return json({ challenges: data }, 200, origin)
      }
      case 'admin_session_detail': {
        if (typeof body.session_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.session_id)) throw new HttpError('Invalid session identifier.')
        const { data: session, error: sessionError } = await client.from('game_sessions')
          .select('id,player_name,total_score,correct_answers,incorrect_answers,total_questions,completion_time,status,started_at,finished_at')
          .eq('id', body.session_id).maybeSingle()
        if (sessionError) throw new HttpError('Could not load session details.', 503)
        if (!session) throw new HttpError('Session was not found.', 404)
        const { data: answers, error: answersError } = await client.from('session_answers')
          .select('challenge_id,submitted_answer,is_correct,points_earned,attempt_number,answered_at')
          .eq('session_id', body.session_id).order('answered_at', { ascending: true })
        if (answersError) throw new HttpError('Could not load submitted answers.', 503)
        const challengeIds = [...new Set((answers ?? []).map((answer) => answer.challenge_id))]
        const { data: challenges, error: challengesError } = challengeIds.length
          ? await client.from('challenges').select('id,title,challenge_type').in('id', challengeIds)
          : { data: [], error: null }
        if (challengesError) throw new HttpError('Could not load challenge details.', 503)
        const titles = new Map((challenges ?? []).map((challenge) => [challenge.id, challenge]))
        return json({
          session,
          answers: (answers ?? []).map((answer) => ({
            ...answer,
            challenge_title: titles.get(answer.challenge_id)?.title ?? 'Removed challenge',
            challenge_type: titles.get(answer.challenge_id)?.challenge_type ?? 'unknown',
          })),
        }, 200, origin)
      }
      case 'admin_export_leaderboard': {
        const { data, error } = await client.rpc('leaderboard_by_player', {
          p_filter: 'all', p_player_name: null, p_limit: 100000,
        })
        if (error) throw new HttpError('Could not export leaderboard.', 503)
        if (!data || typeof data !== 'object' || !Array.isArray(data.entries) || typeof data.participant_count !== 'number') {
          throw new HttpError('Leaderboard export data is invalid.', 503)
        }
        if (data.participant_count > 100000) throw new HttpError('Export is limited to 100,000 players.', 413)
        return json({ entries: data.entries }, 200, origin)
      }
      case 'admin_save_challenge': {
        const draft = body.challenge as Record<string, unknown> | undefined
        if (!draft || typeof draft.title !== 'string' || draft.title.trim().length < 3 || draft.title.trim().length > 80) throw new HttpError('Challenge title must be between 3 and 80 characters.')
        if (typeof draft.challenge_type !== 'string' || !validTypes.includes(draft.challenge_type)) throw new HttpError('Choose a valid challenge type.')
        if (typeof draft.difficulty !== 'string' || !validDifficulties.includes(draft.difficulty)) throw new HttpError('Choose a valid difficulty.')
        if (typeof draft.description !== 'string' || !draft.description.trim() || draft.description.length > 500 || typeof draft.question !== 'string' || !draft.question.trim() || draft.question.length > 2000) throw new HttpError('Description and question are required and must be within their size limits.')
        if (typeof draft.correct_answer !== 'string' || !draft.correct_answer.trim() || draft.correct_answer.length > 500 || typeof draft.hint !== 'string' || !draft.hint.trim() || draft.hint.length > 500 || typeof draft.explanation !== 'string' || !draft.explanation.trim() || draft.explanation.length > 2000) throw new HttpError('Answer, hint, and explanation are required and must be within their size limits.')
        if (!Array.isArray(draft.options) || draft.options.length > 10 || draft.options.some((option) => typeof option !== 'string' || !option.trim() || option.length > 250) || typeof draft.points !== 'number' || !Number.isInteger(draft.points) || draft.points < 1 || draft.points > 1000) throw new HttpError('Options or points are invalid.')
        const expectedAnswer = draft.correct_answer.trim().toLowerCase()
        if (draft.options.length && !draft.options.some((option) => typeof option === 'string' && option.trim().toLowerCase() === expectedAnswer)) {
          throw new HttpError('The correct answer must match one of the listed options.')
        }
        if (typeof draft.id === 'string' && !/^[0-9a-f-]{36}$/i.test(draft.id)) throw new HttpError('Invalid challenge identifier.')
        const { data, error } = await client.from('challenges').upsert({
          ...(typeof draft.id === 'string' ? { id: draft.id } : {}),
          title: draft.title.trim(), challenge_type: draft.challenge_type, difficulty: draft.difficulty,
          description: draft.description.trim(), question: draft.question.trim(), options: draft.options,
          correct_answer: draft.correct_answer.trim(), hint: draft.hint.trim(), explanation: draft.explanation.trim(),
          points: draft.points, is_active: draft.is_active !== false,
        }).select('id').single()
        if (error) throw new HttpError('Could not save challenge.', 503)
        return json({ id: data.id }, 200, origin)
      }
      case 'admin_toggle_challenge': {
        if (typeof body.id !== 'string' || typeof body.is_active !== 'boolean') throw new HttpError('Invalid challenge update.')
        const { error } = await client.from('challenges').update({ is_active: body.is_active }).eq('id', body.id)
        if (error) throw new HttpError('Could not update challenge.', 503)
        return json({ ok: true }, 200, origin)
      }
      case 'admin_delete_challenge': {
        if (typeof body.id !== 'string') throw new HttpError('Invalid challenge identifier.')
        const { error } = await client.from('challenges').delete().eq('id', body.id)
        if (error) throw new HttpError(error.code === '23503' ? 'This challenge is already referenced by a game session and cannot be deleted.' : 'Could not delete challenge.', error.code === '23503' ? 409 : 503)
        return json({ ok: true }, 200, origin)
      }
      case 'admin_reset_leaderboard': {
        const { error } = await client.from('game_sessions').delete().eq('status', 'completed')
        if (error) throw new HttpError('Could not reset leaderboard.', 503)
        return json({ ok: true }, 200, origin)
      }
      default:
        throw new HttpError('Unknown game operation.')
    }
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Unexpected server error.'
    return json({ error: message }, status, origin)
  }
})
