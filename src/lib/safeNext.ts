export const safeNext = (next: string | null) =>
  next && next.startsWith('/dashboard') && !next.startsWith('//') ? next : '/dashboard'
