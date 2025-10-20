import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Introscreen from './components/Introscreen'

function Root() {
  const [showApp, setShowApp] = useState(false)

  if (!showApp) {
    return <Introscreen onComplete={() => setShowApp(true)} />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
