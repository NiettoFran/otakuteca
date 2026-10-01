import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { Button, buttonVariants, Input, Label } from '@/components/ui'
import { useMotionSet, useSession } from '@/hooks'
import { cn, safeNext, supabase } from '@/lib'

export const LoginPage = () => {
  const m = useMotionSet()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin, loading } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className='grid min-h-dvh place-items-center bg-noche px-4 py-10 text-niebla'>
      <title>Ingresar · Otakuteca</title>
      <motion.div variants={m.hero} initial='hidden' animate='visible' className='w-full max-w-sm'>
        <motion.div variants={m.fadeUpBlur} className='flex flex-col items-center text-center'>
          <img src='/otakuteca-icono.svg' alt='' className='size-16' />
          <h1 className='mt-4 font-heading text-3xl font-extrabold tracking-tight'>
            Otaku<span className='text-sakura'>teca</span>
          </h1>
          <p className='mt-1 text-lavanda'>Entrá a tu panel</p>
        </motion.div>

        <motion.form
          variants={m.fadeUpBlur}
          onSubmit={submit}
          className='mt-8 space-y-5 rounded-2xl border border-ciruela bg-abismo p-6'
        >
          {params.get('motivo') === 'sesion' && (
            <p role='status' className='text-sm text-dorado'>
              Tu sesión venció. Iniciá sesión de nuevo y recuperamos lo que estabas cargando.
            </p>
          )}
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail
                aria-hidden
                className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-lavanda'
              />
              <Input
                id='email'
                placeholder='tu@email.com'
                type='email'
                autoComplete='username'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='pl-9'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <div className='relative'>
              <Lock
                aria-hidden
                className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-lavanda'
              />
              <Input
                id='password'
                placeholder='Tu contraseña'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='px-9'
              />
              <button
                type='button'
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                className='absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-lavanda hover:text-sakura-claro focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none'
              >
                {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </button>
            </div>
          </div>
          {error && (
            <motion.p
              role='alert'
              animate={{ x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className='text-sm text-sakura'
            >
              El email o la contraseña no son correctos.
            </motion.p>
          )}
          <Button type='submit' disabled={submitting} className='w-full'>
            {submitting ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <LogIn className='size-4' />
            )}
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </motion.form>

        <motion.div variants={m.fadeUpBlur} className='mt-6 flex justify-center'>
          <Link
            to='/'
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full text-lavanda')}
          >
            <ArrowLeft className='size-4' />
            Volver al sitio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
