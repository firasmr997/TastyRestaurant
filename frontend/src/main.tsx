import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/big-shoulders-display/wght'
import '@fontsource/big-shoulders-inline-display/900'
import '@fontsource/big-shoulders-stencil-display/700'
import '@fontsource/barlow/400'
import '@fontsource/barlow/500'
import '@fontsource/barlow/600'
import '@fontsource/barlow/700'
import './styles/index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
