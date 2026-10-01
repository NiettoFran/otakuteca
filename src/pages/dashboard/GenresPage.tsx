import { Check, Pencil, Search, SearchX, Tags, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { ConfirmDialog, EmptyState, PanelEmptyState } from '@/components'
import { Button, Input } from '@/components/ui'
import { useGenres } from '@/hooks'
import { isSessionError, supabase, translateDbError, type Genre } from '@/lib'

const LOGIN_REDIRECT = '/login?next=/dashboard/generos&motivo=sesion'

// Compara sin tildes ni mayúsculas: «accion» encuentra «Acción».
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const GenresPage = () => {
  const { genres, loading, error, reload } = useGenres()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null)
  const [toDelete, setToDelete] = useState<{ genre: Genre; count: number } | null>(null)

  const term = normalize(search.trim())
  const visible = term ? genres.filter((g) => normalize(g.name).includes(term)) : genres

  const fail = (err: Parameters<typeof translateDbError>[0]) => {
    if (isSessionError(err)) return navigate(LOGIN_REDIRECT, { replace: true })
    setMessage(translateDbError(err).message)
  }

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setMessage(null)
    const { error } = await supabase.from('genres').insert({ name: name.trim() })
    if (error) return fail(error)
    setName('')
    reload()
  }

  const rename = async () => {
    if (!editing || !editing.name.trim()) return
    setMessage(null)
    const { data, error } = await supabase
      .from('genres')
      .update({ name: editing.name.trim() })
      .eq('id', editing.id)
      .select('id')
    if (error) return fail(error)
    if (data.length === 0) return navigate(LOGIN_REDIRECT, { replace: true })
    setEditing(null)
    reload()
  }

  const askDelete = async (genre: Genre) => {
    setMessage(null)
    const { count, error } = await supabase
      .from('work_genres')
      .select('*', { count: 'exact', head: true })
      .eq('genre_id', genre.id)
    if (error) return fail(error)
    setToDelete({ genre, count: count ?? 0 })
  }

  const remove = async (genre: Genre) => {
    const { data, error } = await supabase.from('genres').delete().eq('id', genre.id).select('id')
    if (error) return fail(error)
    if (data.length === 0) return navigate(LOGIN_REDIRECT, { replace: true })
    reload()
  }

  return (
    <section className='max-w-2xl'>
      <title>Géneros · Panel · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold'>Géneros</h1>
      <form onSubmit={create} className='mt-6 flex gap-2'>
        <Input
          aria-label='Nombre del género'
          placeholder='Nuevo género'
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type='submit'>Agregar</Button>
      </form>
      {message && (
        <p role='alert' className='mt-3 text-sm text-sakura'>
          {message}
        </p>
      )}
      <div className='relative mt-4'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-lavanda' />
        <Input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscá un género…'
          aria-label='Buscar géneros'
          className='h-9 pl-9'
        />
      </div>
      <div className='mt-4'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar los géneros. Probá recargar la página' />
        ) : genres.length === 0 ? (
          <PanelEmptyState icon={Tags} title='Todavía no hay géneros'>
            Creá el primero con el campo de arriba.
          </PanelEmptyState>
        ) : visible.length === 0 ? (
          <PanelEmptyState
            icon={SearchX}
            title='No encontramos nada'
            action={
              <Button onClick={() => setSearch('')} className='rounded-full'>
                Limpiar búsqueda
              </Button>
            }
          >
            No hay géneros que coincidan con «
            <span className='break-all text-niebla'>{search.trim()}</span>».
          </PanelEmptyState>
        ) : (
          <ul className='divide-y divide-ciruela rounded-2xl border border-ciruela bg-abismo'>
            {visible.map((genre) => (
              <li key={genre.id} className='flex items-center gap-2 p-3'>
                {editing?.id === genre.id ? (
                  <>
                    <Input
                      aria-label={`Renombrar ${genre.name}`}
                      maxLength={40}
                      value={editing.name}
                      onChange={(e) => setEditing({ id: genre.id, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && rename()}
                    />
                    <Button size='icon' aria-label='Guardar nombre' onClick={rename}>
                      <Check className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='outline'
                      aria-label='Cancelar'
                      onClick={() => setEditing(null)}
                    >
                      <X className='size-4' />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className='flex-1 truncate'>{genre.name}</span>
                    <Button
                      size='icon'
                      variant='outline'
                      aria-label={`Renombrar ${genre.name}`}
                      onClick={() => setEditing({ id: genre.id, name: genre.name })}
                    >
                      <Pencil className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='destructive'
                      aria-label={`Eliminar ${genre.name}`}
                      onClick={() => askDelete(genre)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`¿Eliminar el género «${toDelete?.genre.name ?? ''}»?`}
        description={`Lo tienen ${toDelete?.count ?? 0} obras. Se lo vamos a quitar a todas. No se puede deshacer.`}
        confirmLabel='Eliminar'
        onConfirm={() => toDelete && remove(toDelete.genre)}
      />
    </section>
  )
}
