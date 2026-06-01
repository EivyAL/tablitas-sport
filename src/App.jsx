import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  crearCatalogo,
  obtenerCatalogosConFotos,
  subirFotoACatalogo,
  actualizarCatalogo,
  eliminarCatalogo,
} from './services/catalogosService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [catalogos, setCatalogos] = useState([]);
  const [catalogoActual, setCatalogoActual] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCatalogoId, setEditCatalogoId] = useState(null);

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [leyenda, setLeyenda] = useState('');

  // 1. Cargar catálogos al iniciar
  useEffect(() => {
    if (isLoggedIn) cargarCatalogos();
  }, [isLoggedIn]);

  const cargarCatalogos = async () => {
    const data = await obtenerCatalogosConFotos();
    if (data) setCatalogos(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // 2. Crear nuevo catálogo
  const handleGuardarCatalogo = async () => {
    if (!titulo) {
      alert('Ingresa un título.');
      return;
    }
    let success = false;
    if (isEditMode && editCatalogoId) {
      const actualizado = await actualizarCatalogo(editCatalogoId, titulo, leyenda);
      success = !!actualizado;
    } else {
      const nuevo = await crearCatalogo(titulo, leyenda);
      success = !!nuevo;
    }

    if (success) {
      alert(isEditMode ? 'Catálogo actualizado.' : 'Catálogo guardado.');
      setTitulo('');
      setLeyenda('');
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditCatalogoId(null);
      cargarCatalogos();
    }
  };

  const handleEditarCatalogo = (catalogo) => {
    setTitulo(catalogo.titulo || '');
    setLeyenda(catalogo.leyenda || '');
    setIsEditMode(true);
    setEditCatalogoId(catalogo.id);
    setIsModalOpen(true);
  };

  const handleAbrirNuevoCatalogo = () => {
    setTitulo('');
    setLeyenda('');
    setIsEditMode(false);
    setEditCatalogoId(null);
    setIsModalOpen(true);
  };

  // 3. Abrir la galería de un catálogo específico
  const abrirGaleria = (catalogo) => {
    setCatalogoActual(catalogo);
    setIsGalleryOpen(true);
  };

  // 4. Subir fotos al catálogo actual
  const handleSubirFotos = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !catalogoActual) return;

    for (const file of files) {
      await subirFotoACatalogo(file, catalogoActual.id);
    }
    
    alert('Fotos subidas con éxito.');
    cargarCatalogos(); 
    
    // Actualizar la vista de la galería actual
    const datosActualizados = await obtenerCatalogosConFotos();
    const catalogoRefrescado = datosActualizados.find(c => c.id === catalogoActual.id);
    setCatalogoActual(catalogoRefrescado);
  };

  // 5. Eliminar una foto de la base de datos
  const handleEliminarFoto = async (foto) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta foto?");
    if (!confirmar) return;

    // Eliminar de la tabla
    const { error } = await supabase
      .from('fotos_catalogo')
      .delete()
      .eq('id', foto.id);

    if (error) {
      console.error(error);
      alert('Error al eliminar.');
    } else {
      alert('Foto eliminada.');
      cargarCatalogos();
      
      const datosActualizados = await obtenerCatalogosConFotos();
      const catalogoRefrescado = datosActualizados.find(c => c.id === catalogoActual.id);
      setCatalogoActual(catalogoRefrescado);
    }
  };

  const handleEliminarCatalogo = async (catalogo) => {
    const confirmar = window.confirm('¿Deseas eliminar este catálogo?');
    if (!confirmar) return;

    const borrado = await eliminarCatalogo(catalogo.id);
    if (borrado) {
      alert('Catálogo eliminado.');
      cargarCatalogos();
      if (catalogoActual?.id === catalogo.id) {
        setCatalogoActual(null);
        setIsGalleryOpen(false);
      }
    } else {
      alert('Error al eliminar catálogo.');
    }
  };

  // PANTALLA LOGIN
  if (!isLoggedIn) {
    return (
        // ... (Tu código de login original que ya funciona se mantiene aquí) ...
        <div className="min-h-screen flex items-center justify-center bg-[#0b131f]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Tablitas Admin</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" defaultValue="admin" className="w-full mb-4 px-4 py-3 border rounded-lg" required />
                    <input type="password" defaultValue="12345" className="w-full mb-6 px-4 py-3 border rounded-lg" required />
                    <button type="submit" className="w-full bg-[#00c896] text-white font-bold py-3 rounded-lg">Entrar</button>
                </form>
            </div>
        </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0b131f] text-white flex flex-col">
          <div className="p-6 border-b border-gray-800"><span className="font-bold text-xl">Tablitas <span className="text-[#00c896]">Admin</span></span></div>
          <nav className="flex-1 p-4"><button className="w-full bg-[#00c896]/20 text-[#00c896] px-4 py-3 rounded-lg font-semibold">Mis Catálogos</button></nav>
          <div className="p-4 border-t border-gray-800"><button onClick={() => setIsLoggedIn(false)} className="text-red-400 w-full text-left">Cerrar Sesión</button></div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Catálogos</h1>
          <button onClick={handleAbrirNuevoCatalogo} className="bg-[#0b131f] text-white px-5 py-2.5 rounded-lg font-semibold">
            + Nuevo Catálogo
          </button>
        </div>

        {/* LISTA DE CATÁLOGOS DINÁMICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogos.map((catalogo) => (
            <div key={catalogo.id} className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {/* Muestra la primera foto del catálogo si existe */}
                {catalogo.fotos_catalogo?.length > 0 ? (
                  <img src={catalogo.fotos_catalogo[0].url_imagen} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin fotos</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">
                        {catalogo.fotos_catalogo?.length || 0} Fotos
                    </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{catalogo.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4">{catalogo.leyenda}</p>
                <div className="flex gap-2">
                  <button onClick={() => abrirGaleria(catalogo)} className="flex-1 bg-gray-100 hover:bg-gray-200 font-semibold py-2 rounded-lg border border-gray-300">
                    Gestionar Fotos
                  </button>
                  <button onClick={() => handleEditarCatalogo(catalogo)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    ✎
                  </button>
                  <button onClick={() => handleEliminarCatalogo(catalogo)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL CREAR CATÁLOGO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">{isEditMode ? 'Editar Catálogo' : 'Nuevo Catálogo'}</h3>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="w-full mb-4 px-4 py-2 border rounded" />
            <textarea value={leyenda} onChange={(e) => setLeyenda(e.target.value)} placeholder="Leyenda" className="w-full mb-4 px-4 py-2 border rounded"></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded text-gray-600">Cancelar</button>
              <button onClick={handleGuardarCatalogo} className="px-5 py-2 rounded bg-[#00c896] text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GALERÍA DE FOTOS */}
      {isGalleryOpen && catalogoActual && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="bg-[#0b131f] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold">{catalogoActual.titulo}</h3>
              <button onClick={() => setIsGalleryOpen(false)}>X</button>
            </div>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <input type="file" multiple id="subirGaleria" className="hidden" onChange={handleSubirFotos} />
              <button onClick={() => document.getElementById('subirGaleria').click()} className="bg-[#00c896] text-white px-4 py-2 rounded font-semibold">
                + Añadir Fotos
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {catalogoActual.fotos_catalogo?.map((foto) => (
                <div key={foto.id} className="relative group aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden border">
                  <img src={foto.url_imagen} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <a href={foto.url_imagen} target="_blank" rel="noreferrer" className="bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white">O</a>
                    <button onClick={() => handleEliminarFoto(foto)} className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600">X</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}