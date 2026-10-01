import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { Button, Input, Label } from '@/components/ui'
import { useSession } from '@/hooks'
import { safeNext, supabase } from '@/lib'

export const LoginPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin, loading } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const next = safeNext(params.get('next'))

  useEffect(() => {
    if (!loading && isAdmin) navigate(next, { replace: true })
  }, [loading, isAdmin, next, navigate])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError(true)
  }

  return (
    <div className='grid min-h-dvh place-items-center bg-noche px-4 text-niebla'>
      <title>Ingresar · Otakuteca</title>
      <form
        onSubmit={submit}
        className='w-full max-w-sm space-y-5 rounded-2xl border border-ciruela bg-abismo p-6'
      >
        <h1 className='font-heading text-2xl font-extrabold'>Ingresar</h1>
        {params.get('motivo') === 'sesion' && (
          <p role='status' className='text-sm text-dorado'>
            Tu sesión venció. Iniciá sesión de nuevo y recuperamos lo que estabas cargando.
          </p>
        )}
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            autoComplete='username'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>Contraseña</Label>
          <Input
            id='password'
            type='password'
            autoComplete='current-password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p role='alert' className='text-sm text-sakura'>
            El email o la contraseña no son correctos.
          </p>
        )}
        <Button type='submit' disabled={submitting} className='w-full'>
          Entrar
        </Button>
      </form>
    </div>
  )
}
