import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'

import { OtakutecaApp } from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OtakutecaApp />
  </StrictMode>
)
