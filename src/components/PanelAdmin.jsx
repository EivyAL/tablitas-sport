import { useState } from 'react'
import { crearCatalogo } from '../services/catalogosService'

export default function PanelAdmin() {
  const [titulo, setTitulo] = useState('')
  const [leyenda, setLeyenda] = useState('')
  const [loading, setLoading] = useState(false)

  const manejarGuardado = async (e) => {
    e.preventDefault()
    setLoading(true)
    const nuevo = await crearCatalogo(titulo, leyenda)
    setLoading(false)
    if (nuevo) {
      alert('¡Catálogo guardado!')
      setTitulo('')
      setLeyenda('')
    } else {
      alert('Error al guardar el catálogo')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Panel Admin - Crear Catálogo</h2>
      <form onSubmit={manejarGuardado} className="space-y-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full p-3 rounded bg-gray-800 text-white"
        />
        <textarea
          value={leyenda}
          onChange={(e) => setLeyenda(e.target.value)}
          placeholder="Leyenda"
          className="w-full p-3 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-400 text-black rounded font-bold"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
