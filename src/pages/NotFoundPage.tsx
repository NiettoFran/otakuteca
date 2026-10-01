import { Compass } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components'

export const NotFoundPage = () => (
  <div className='py-24'>
    <title>Acá no hay nada · Otakuteca</title>
    <EmptyState icon={Compass} message='Acá no hay nada'>
      <Link to='/' className='font-medium text-sakura hover:text-sakura-claro'>
        Volver al inicio
      </Link>
    </EmptyState>
  </div>
)
