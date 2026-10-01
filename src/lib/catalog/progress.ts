import type { Work } from '../types'
import { getUnitLabels } from './labels'

export const getProgress = (work: Work) => {
  const labels = getUnitLabels(work.type)
  if (work.total_units) {
    const percent = Math.min(100, Math.round((work.progress / work.total_units) * 100))
    return { percent, text: `${work.progress} / ${work.total_units}` }
  }
  return { percent: null, text: `${work.progress} ${labels.units} ${labels.done}` }
}
