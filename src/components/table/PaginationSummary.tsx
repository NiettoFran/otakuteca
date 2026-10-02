type Props = { page: number; pageSize: number; total: number }

export const PaginationSummary = ({ page, pageSize, total }: Props) => {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <p className='text-sm text-lavanda'>
      Mostrando {first}–{last} de {total}
    </p>
  )
}
