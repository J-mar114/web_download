import { supabase } from '../lib/supabase'

export async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase is not configured. Add the environment variables from .env.example.')
  const { data, error } = await supabase.functions.invoke('game-api', { body })
  if (error) {
    if (error.context instanceof Response) {
      const payload = await error.context.clone().json() as { error?: unknown }
      if (typeof payload.error === 'string') throw new Error(payload.error)
    }
    throw new Error(error.message)
  }
  if (data?.error) throw new Error(data.error)
  return data as T
}
