import '../css/app.css'
import { createRoot } from 'react-dom/client'
import App from './shop/App.jsx'

const el = document.getElementById('shop-root')
if (el) createRoot(el).render(<App />)
