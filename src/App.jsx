import { Routes, Route } from 'react-router-dom'
import TiendaPublica from './pages/App.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TiendaPublica />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}