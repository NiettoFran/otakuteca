import { Check, Eraser, Pencil, Plus, Search, SearchX, Tags, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { ConfirmDialog, EmptyState, PageHeader, PanelEmptyState, TooltipHint } from '@/components'
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
    <section className='mx-auto max-w-3xl'>
      <title>Géneros · Panel · Otakuteca</title>
      <PageHeader
        title='Géneros'
        description='Creá, renombrá y eliminá las etiquetas con las que clasificás tus obras. Al borrar un género se le quita a todas las obras que lo tengan.'
      />
      <div className='mt-8 space-y-3 rounded-2xl border border-ciruela bg-abismo p-4'>
        <form onSubmit={create} className='flex gap-2'>
          <Input
            aria-label='Nombre del género'
            placeholder='Nuevo género'
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='h-9'
          />
          <TooltipHint label='Crear el género con ese nombre'>
            <Button type='submit' className='h-9'>
              <Plus className='size-4' />
              Agregar
            </Button>
          </TooltipHint>
        </form>
        {message && (
          <p role='alert' className='text-sm text-sakura'>
            {message}
          </p>
        )}
        <div className='relative'>
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
              <TooltipHint label='Borrar el texto de la búsqueda'>
                <Button onClick={() => setSearch('')} className='rounded-full'>
                  <Eraser className='size-4' />
                  Limpiar búsqueda
                </Button>
              </TooltipHint>
            }
          >
            No hay géneros que coincidan con «
            <span className='break-all text-niebla'>{search.trim()}</span>».
          </PanelEmptyState>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-ciruela bg-abismo'>
            <p className='border-b border-uva bg-ciruela/60 px-4 py-3 text-xs font-semibold tracking-wider text-lavanda uppercase'>
              {visible.length === genres.length
                ? `${genres.length} ${genres.length === 1 ? 'género' : 'géneros'}`
                : `${visible.length} de ${genres.length} géneros`}
            </p>
            <ul className='divide-y divide-ciruela'>
              {visible.map((genre) => (
                <li
                  key={genre.id}
                  className='flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 hover:bg-ciruela/30'
                >
                  <span
                    aria-hidden
                    className='grid size-9 shrink-0 place-items-center rounded-full bg-uva/60 font-heading font-bold text-sakura'
                  >
                    {genre.name.charAt(0).toUpperCase()}
                  </span>
                  {editing?.id === genre.id ? (
                    <>
                      <Input
                        aria-label={`Renombrar ${genre.name}`}
                        maxLength={40}
                        value={editing.name}
                        onChange={(e) => setEditing({ id: genre.id, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && rename()}
                        className='min-w-0 flex-1 basis-40'
                      />
                      <TooltipHint label='Guardar el nuevo nombre'>
                        <Button onClick={rename}>
                          <Check className='size-4' />
                          Guardar
                        </Button>
                      </TooltipHint>
                      <TooltipHint label='Descartar los cambios'>
                        <Button variant='outline' onClick={() => setEditing(null)}>
                          <X className='size-4' />
                          Cancelar
                        </Button>
                      </TooltipHint>
                    </>
                  ) : (
                    <>
                      <span className='min-w-0 flex-1 truncate'>{genre.name}</span>
                      <TooltipHint label={`Cambiar el nombre de «${genre.name}»`}>
                        <Button
                          variant='outline'
                          onClick={() => setEditing({ id: genre.id, name: genre.name })}
                        >
                          <Pencil className='size-4' />
                          <span className='sr-only sm:not-sr-only'>Renombrar</span>
                        </Button>
                      </TooltipHint>
                      <TooltipHint label={`Eliminar «${genre.name}»`}>
                        <Button variant='destructive' onClick={() => askDelete(genre)}>
                          <Trash2 className='size-4' />
                          <span className='sr-only sm:not-sr-only'>Eliminar</span>
                        </Button>
                      </TooltipHint>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
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
