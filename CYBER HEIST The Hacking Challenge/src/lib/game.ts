import {
  Command, Fingerprint, LockKeyhole, ShieldAlert, Terminal,
  type LucideIcon,
} from 'lucide-react'

export const challengeIcons: Record<string, LucideIcon> = {
  password: LockKeyhole,
  code: Command,
  log_analysis: Terminal,
  security_breach: ShieldAlert,
  digital_forensics: Fingerprint,
}

export function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0')
  const sec = Math.max(0, seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}
