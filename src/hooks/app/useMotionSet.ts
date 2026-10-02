import { useReducedMotion } from 'framer-motion'

import { MOTION } from '@/lib'

export const useMotionSet = () => MOTION[useReducedMotion() ? 'reduced' : 'full']
