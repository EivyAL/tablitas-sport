import { useEffect } from 'react'
import {
  crearCatalogo,
  obtenerCatalogosConFotos,
  subirFotoACatalogo,
  subirPortadaCatalogo,
  actualizarCatalogo,
  eliminarCatalogo,
  eliminarFotoCatalogo,
} from '../services/catalogosService'

export default function Admin() {
  useEffect(() => {
    if (!document.getElementById('fa-css')) {
      const l = document.createElement('link')
      l.id = 'fa-css'; l.rel = 'stylesheet'
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
      document.head.appendChild(l)
    }
    if (!document.getElementById('poppins-css')) {
      const l = document.createElement('link')
      l.id = 'poppins-css'; l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'
      document.head.appendChild(l)
    }
    if (!document.getElementById('tailwind-css')) {
      const s = document.createElement('script')
      s.id = 'tailwind-css'
      s.src = 'https://cdn.tailwindcss.com'
      document.head.appendChild(s)
    }

    // Integrar aquí la lógica del antiguo admin.js (bundle-friendly)
    const catalogs = []
    let currentCatalogId = null
    let selectedCoverFile = null
    let isSavingCatalog = false

    async function loadCatalogs() {
      const data = await obtenerCatalogosConFotos()
      catalogs.splice(0, catalogs.length, ...(Array.isArray(data) ? data : []))
      renderCatalogGrid()
    }

    async function showDashboard() {
      document.getElementById('loginScreen')?.classList.add('hidden')
      document.getElementById('dashboardScreen')?.classList.remove('hidden')
      await loadCatalogs()
    }

    function showLogin() {
      document.getElementById('dashboardScreen')?.classList.add('hidden')
      document.getElementById('loginScreen')?.classList.remove('hidden')
    }

    function openNewCatalogModal() {
      const modal = document.getElementById('modalNewCatalog')
      if (!modal) return
      modal.querySelector('input[type="text"]').value = ''
      modal.querySelector('textarea').value = ''
      resetCoverPreview()
      delete modal.dataset.editId
      selectedCoverFile = null
      modal.classList.remove('hidden')
    }

    async function editCatalog(btn) {
      const card = btn.closest('.catalogCard')
      if (!card) return
      const id = card.dataset.id
      const catalog = catalogs.find(c => String(c.id) === String(id))
      if (!catalog) return

      const modal = document.getElementById('modalNewCatalog')
      modal.querySelector('input[type="text"]').value = catalog.titulo || ''
      modal.querySelector('textarea').value = catalog.leyenda || ''
      selectedCoverFile = null
      resetCoverPreview()
      modal.dataset.editId = id
      modal.classList.remove('hidden')
    }

    async function saveCatalog() {
      if (isSavingCatalog) return
      isSavingCatalog = true

      const saveButton = document.getElementById('saveCatalogButton')
      if (saveButton) {
        saveButton.disabled = true
        saveButton.classList.add('opacity-50', 'cursor-not-allowed')
      }

      const modal = document.getElementById('modalNewCatalog')
      const title = modal.querySelector('input[type="text"]').value.trim()
      const description = modal.querySelector('textarea').value.trim()

      if (!title) {
        alert('El título es requerido.')
        isSavingCatalog = false
        if (saveButton) {
          saveButton.disabled = false
          saveButton.classList.remove('opacity-50', 'cursor-not-allowed')
        }
        return
      }

      const editId = modal.dataset.editId
      let catalogId = editId

      try {
        if (editId) {
          const updated = await actualizarCatalogo(editId, title, description)
          if (!updated) throw new Error('No se pudo actualizar el catálogo.')
        } else {
          const nuevo = await crearCatalogo(title, description)
          if (!nuevo?.id) throw new Error('No se pudo crear el catálogo.')
          catalogId = nuevo.id
        }

        if (selectedCoverFile && catalogId) {
          try {
            await subirPortadaCatalogo(selectedCoverFile, catalogId)
          } catch (err) {
            console.error('Error subiendo portada:', err)
            alert('Catálogo guardado, pero la portada no se pudo subir. Revisa la consola.')
          }
        }

        await loadCatalogs()
        modal.classList.add('hidden')
        modal.querySelector('input[type="text"]').value = ''
        modal.querySelector('textarea').value = ''
        delete modal.dataset.editId
        resetCoverPreview()
        selectedCoverFile = null

      } catch (error) {
        console.error(error)
        alert(`Error al guardar el catálogo: ${error.message || error}`)
      } finally {
        isSavingCatalog = false
        if (saveButton) {
          saveButton.disabled = false
          saveButton.classList.remove('opacity-50', 'cursor-not-allowed')
        }
      }
    }

    async function deleteCatalog(btn) {
      const card = btn.closest('.catalogCard')
      if (!card) return
      const id = card.dataset.id
      const catalog = catalogs.find(c => String(c.id) === String(id))
      if (!confirm(`¿Deseas eliminar "${catalog?.titulo || 'este catálogo'}"?`)) return

      const deleted = await eliminarCatalogo(id)
      if (deleted) {
        await loadCatalogs()
        closeModals()
      } else {
        alert('Error al eliminar catálogo.')
      }
    }

    function renderCatalogGrid() {
      const grid = document.getElementById('catalogGrid')
      if (!grid) return
      grid.innerHTML = ''

      if (!catalogs.length) {
        grid.innerHTML = `<p class="text-gray-400 col-span-full text-center py-16">\n            No hay catálogos aún. Crea el primero con el botón de arriba.\n        </p>`
        return
      }

      catalogs.forEach(catalog => {
        const coverUrl = catalog.cover_url || ''
        const photoCount = catalog.fotos_catalogo?.length || 0
        const title = catalog.titulo || 'Sin título'
        const description = catalog.leyenda || ''

        const card = document.createElement('div')
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden catalogCard'
        card.dataset.id = catalog.id

        card.innerHTML = `
            <div class="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                ${coverUrl
                    ? `<img src="${coverUrl}" class="w-full h-full object-cover">`
                    : `<div class="flex flex-col items-center gap-1">\n                         <i class="fa-regular fa-image text-3xl text-gray-300"></i>\n                         <span class="text-gray-400 text-xs font-medium">Sin portada</span>\n                       </div>`
                }
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span class="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">
                        <i class="fa-solid fa-images mr-1"></i> ${photoCount} foto${photoCount !== 1 ? 's' : ''} en el álbum
                    </span>
                </div>
            </div>
            <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold text-gray-900 leading-tight">${title}</h3>
                    <div class="flex gap-1 flex-shrink-0 ml-2">
                        <button onclick="editCatalog(this)" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Editar">
                            <i class="fa-solid fa-pen text-sm"></i>
                        </button>
                        <button onclick="deleteCatalog(this)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-500 text-sm mb-4 line-clamp-2">${description || 'Sin descripción.'}</p>
                <button onclick="openGalleryModal(this)"
                    class="w-full bg-gray-100 hover:bg-[#0b131f] hover:text-white text-gray-800 font-semibold py-2.5 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-folder-open text-sm"></i> Gestionar Fotos del Álbum
                </button>
            </div>
        `
        grid.appendChild(card)
      })
    }

    async function openGalleryModal(btn) {
      const card = btn.closest('.catalogCard')
      if (!card) return
      currentCatalogId = card.dataset.id
      const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId))
      const modal = document.getElementById('modalGallery')
      if (!modal) return
      modal.querySelector('h3').innerText = `Álbum: ${catalog?.titulo || 'Sin título'}`
      renderGallery()
      modal.classList.remove('hidden')
    }

    function renderGallery() {
      const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId))
      const galleryGrid = document.getElementById('galleryGrid')
      if (!galleryGrid) return
      galleryGrid.innerHTML = ''
      if (!catalog) return

      const photos = catalog.fotos_catalogo || []

      if (!photos.length) {
        galleryGrid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-400">
                <i class="fa-regular fa-images text-4xl mb-3 block"></i>
                <p class="font-medium">Este álbum está vacío.</p>
                <p class="text-sm mt-1">Usa el botón "Añadir Fotos" para subir imágenes.</p>
            </div>`
        return
      }

      photos.forEach(photo => {
        const card = document.createElement('div')
        card.className = 'relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200'
        card.innerHTML = `
            <img src="${photo.url_imagen}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button class="bg-white text-gray-900 w-10 h-10 rounded-full hover:bg-[#00c896] hover:text-white transition-colors view-btn" title="Ver completa">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 transition-colors delete-btn" title="Eliminar foto">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `
        card.querySelector('.view-btn').addEventListener('click', () => window.open(photo.url_imagen, '_blank'))
        card.querySelector('.delete-btn').addEventListener('click', () => deletePhoto(photo.id))
        galleryGrid.appendChild(card)
      })
    }

    async function deletePhoto(photoId) {
      if (!confirm('¿Deseas eliminar esta foto del álbum?')) return
      const deleted = await eliminarFotoCatalogo(photoId)
      if (deleted) {
        await loadCatalogs()
        renderGallery()
      } else {
        alert('Error al eliminar la foto.')
      }
    }

    function setCatalogCover(file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen.')
        return
      }
      selectedCoverFile = file
      updateCoverPreview(URL.createObjectURL(file), file.name)
    }

    function resetCoverPreview() {
      const area = document.getElementById('coverUploadArea')
      if (!area) return
      area.innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-500">Haz clic para subir imagen o arrastra el archivo aquí</p>
    `
    }

    function updateCoverPreview(url, name) {
      const area = document.getElementById('coverUploadArea')
      if (!area) return
      area.innerHTML = `
        <img src="${url}" alt="Vista previa" class="mx-auto mb-3 w-full max-w-xs rounded-lg border border-gray-200 object-contain max-h-48">
        <p class="text-sm text-gray-700 font-semibold">${name}</p>
        <p class="text-xs text-gray-400 mt-1">Imagen lista para cargar como portada</p>
    `
    }

    function handleDragEnter(event) {
      event.preventDefault(); event.stopPropagation();
      document.getElementById('coverUploadArea')?.classList.add('border-[#00c896]', 'bg-green-50')
    }
    function handleDragOver(event) { event.preventDefault(); event.stopPropagation(); }
    function handleDragLeave(event) { event.preventDefault(); event.stopPropagation(); document.getElementById('coverUploadArea')?.classList.remove('border-[#00c896]', 'bg-green-50') }
    function handleCoverDrop(event) { event.preventDefault(); event.stopPropagation(); document.getElementById('coverUploadArea')?.classList.remove('border-[#00c896]', 'bg-green-50'); const file = event.dataTransfer.files[0]; if (file) setCatalogCover(file) }

    function closeModals() {
      document.getElementById('modalNewCatalog')?.classList.add('hidden')
      document.getElementById('modalGallery')?.classList.add('hidden')
    }

    document.getElementById('catalogCoverUpload')?.addEventListener('change', function(e) { const file = e.target.files[0]; if (file) setCatalogCover(file) })

    document.getElementById('fileUpload')?.addEventListener('change', async function(e) {
      const files = Array.from(e.target.files)
      const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId))
      if (!files.length || !catalog) return

      let uploadedAny = false
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        try {
          await subirFotoACatalogo(file, catalog.id)
          uploadedAny = true
        } catch (err) {
          console.error('Error subiendo foto al álbum:', err)
          alert(`No se pudo subir "${file.name}". Revisa la consola.`)
        }
      }

      if (uploadedAny) {
        await loadCatalogs()
        renderGallery()
      }
      e.target.value = ''
    })

    // Exponer las funciones al scope global para los onclick del HTML
    window.showDashboard = showDashboard
    window.showLogin = showLogin
    window.openNewCatalogModal = openNewCatalogModal
    window.editCatalog = editCatalog
    window.deleteCatalog = deleteCatalog
    window.saveCatalog = saveCatalog
    window.openGalleryModal = openGalleryModal
    window.closeModals = closeModals
    window.handleCoverDrop = handleCoverDrop
    window.handleDragEnter = handleDragEnter
    window.handleDragOver = handleDragOver
    window.handleDragLeave = handleDragLeave

    // Arranque
    loadCatalogs()

    return () => {
      // limpiar handlers expuestos
      delete window.showDashboard
      delete window.showLogin
      delete window.openNewCatalogModal
      delete window.editCatalog
      delete window.deleteCatalog
      delete window.saveCatalog
      delete window.openGalleryModal
      delete window.closeModals
      delete window.handleCoverDrop
      delete window.handleDragEnter
      delete window.handleDragOver
      delete window.handleDragLeave
    }
  }, [])

  return (
    <div
      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}
      dangerouslySetInnerHTML={{ __html: adminHtml }}
    />
  )
}

const adminHtml = `
<style>
  .hidden { display: none !important; }
  body { font-family: 'Poppins', sans-serif; background-color: #f3f4f6; }
</style>

<div id="loginScreen" class="min-h-screen flex items-center justify-center bg-[#0b131f]">
  <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
    <div class="text-center mb-8">
      <div class="bg-[#0b131f] text-[#00c896] w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
        <i class="fa-solid fa-lock"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Panel de Administración</h2>
      <p class="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
    </div>
    <form id="loginForm" onsubmit="event.preventDefault(); window.showDashboard();">
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
        <input type="text" placeholder="Ingresa tu usuario" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#00c896]" required>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
        <input type="password" placeholder="••••••••" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#00c896]" required>
      </div>
      <button type="submit" class="w-full bg-[#00c896] hover:bg-[#00a67d] text-white font-bold py-3 px-4 rounded-lg transition-colors">
        Entrar al Sistema
      </button>
    </form>
  </div>
</div>

<div id="dashboardScreen" class="hidden min-h-screen flex flex-col md:flex-row">
  <aside class="w-full md:w-64 bg-[#0b131f] text-white flex flex-col">
    <div class="p-6 flex items-center gap-3 border-b border-gray-800">
      <i class="fa-solid fa-futbol text-[#00c896] text-2xl"></i>
      <span class="font-bold text-xl">Tablitas <span class="text-[#00c896]">Admin</span></span>
    </div>
    <nav class="flex-1 p-4">
      <a href="#" class="flex items-center gap-3 bg-[#00c896]/20 text-[#00c896] px-4 py-3 rounded-lg font-semibold mb-2">
        <i class="fa-solid fa-images"></i> Mis Catálogos
      </a>
      <a href="/" class="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-semibold mb-2 transition-colors">
        <i class="fa-solid fa-store"></i> Ver Tienda
      </a>
    </nav>
    <div class="p-4 border-t border-gray-800">
      <button onclick="window.showLogin()" type="button" class="w-full flex justify-center gap-2 items-center bg-[#00c896] hover:bg-[#00a67d] text-white font-bold py-3 px-4 rounded-lg transition-colors">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
      </button>
    </div>
  </aside>

  <main class="flex-1 p-6 lg:p-10 bg-gray-50 overflow-y-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Catálogos</h1>
        <p class="text-gray-500 mt-1">Crea, edita y organiza los uniformes que se muestran al público.</p>
      </div>
      <div class="flex gap-3">
        <button onclick="window.openNewSeccionModal()" class="bg-[#00c896] hover:bg-[#00a67d] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
          <i class="fa-solid fa-layer-group"></i> Nueva Sección
        </button>
        <button onclick="window.openNewCatalogModal()" class="bg-[#0b131f] hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
          <i class="fa-solid fa-plus text-[#00c896]"></i> Nuevo Catálogo
        </button>
      </div>
    </div>
    <div id="catalogGrid" class="space-y-2"></div>
  </main>
</div>

<!-- Modal: Nuevo/Editar Catálogo -->
<div id="modalNewCatalog" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
    <div class="bg-[#0b131f] text-white px-6 py-4 flex justify-between items-center">
      <h3 class="font-bold text-lg">Crear Nuevo Catálogo</h3>
      <button onclick="window.closeModals()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
    </div>
    <div class="p-6">
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Título del Catálogo</label>
        <input type="text" placeholder="Ej: Uniformes Oferta" class="w-full px-4 py-2 rounded border focus:border-[#00c896] outline-none">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Leyenda / Descripción</label>
        <textarea rows="3" placeholder="Ej: Uniformes de temporadas pasadas..." class="w-full px-4 py-2 rounded border focus:border-[#00c896] outline-none"></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Sección</label>
        <select id="catalogSeccionSelect" class="w-full px-4 py-2 rounded border focus:border-[#00c896] outline-none bg-white text-gray-800">
          <option value="">— Sin sección —</option>
        </select>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Imagen de Portada</label>
        <input type="file" id="catalogCoverUpload" accept="image/*" class="hidden">
        <div id="coverUploadArea" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
          onclick="document.getElementById('catalogCoverUpload').click()"
          ondragenter="window.handleDragEnter(event)"
          ondragover="window.handleDragOver(event)"
          ondragleave="window.handleDragLeave(event)"
          ondrop="window.handleCoverDrop(event)">
          <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
          <p class="text-sm text-gray-500">Haz clic para subir imagen o arrastra aquí</p>
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" onclick="window.closeModals()" class="px-5 py-2 rounded-lg text-gray-600 font-semibold hover:bg-gray-100">Cancelar</button>
        <button id="saveCatalogButton" type="button" onclick="window.saveCatalog()" class="px-5 py-2 rounded-lg bg-[#00c896] text-white font-semibold hover:bg-[#00a67d]">Guardar Catálogo</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Nueva/Editar Sección -->
<div id="modalSeccion" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
    <div class="bg-[#0b131f] text-white px-6 py-4 flex justify-between items-center">
      <h3 class="font-bold text-lg">Nueva Sección</h3>
      <button onclick="window.closeModals()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
    </div>
    <div class="p-6">
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de la sección</label>
        <input type="text" id="seccionNombre" placeholder="Ej: Accesorios, Balones..." class="w-full px-4 py-2 rounded border focus:border-[#00c896] outline-none">
      </div>
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</label>
        <input type="text" id="seccionDescripcion" placeholder="Descripción breve..." class="w-full px-4 py-2 rounded border focus:border-[#00c896] outline-none">
      </div>
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Ícono (clase Font Awesome)</label>
        <div class="flex gap-3 items-center">
          <div class="w-10 h-10 rounded-lg bg-[#0b131f] flex items-center justify-center text-[#00c896] flex-shrink-0">
            <i id="iconPreview" class="fa-solid fa-box"></i>
          </div>
          <input type="text" id="seccionIcono" placeholder="fa-solid fa-box" oninput="window.updateIconPreview()" class="flex-1 px-4 py-2 rounded border focus:border-[#00c896] outline-none text-sm font-mono">
        </div>
        <p class="text-xs text-gray-400 mt-2">
          Sugeridos: <code class="bg-gray-100 px-1 rounded">fa-solid fa-shirt</code>
          <code class="bg-gray-100 px-1 rounded">fa-solid fa-futbol</code>
          <code class="bg-gray-100 px-1 rounded">fa-solid fa-socks</code>
        </p>
      </div>
      <div class="flex justify-end gap-3">
        <button onclick="window.closeModals()" class="px-5 py-2 rounded-lg text-gray-600 font-semibold hover:bg-gray-100">Cancelar</button>
        <button onclick="window.saveSeccion()" class="px-5 py-2 rounded-lg bg-[#00c896] text-white font-semibold hover:bg-[#00a67d]">Guardar Sección</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Galería -->
<div id="modalGallery" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
    <div class="bg-[#0b131f] text-white px-6 py-4 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg">Álbum</h3>
        <p class="text-[#00c896] text-sm">Agrega o elimina fotos</p>
      </div>
      <button onclick="window.closeModals()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
    </div>
    <div class="p-6 bg-gray-50 border-b flex justify-between items-center">
      <input type="file" id="fileUpload" multiple class="hidden">
      <button onclick="document.getElementById('fileUpload').click()" class="bg-[#00c896] text-white px-4 py-2 rounded font-semibold flex items-center gap-2 hover:bg-[#00a67d]">
        <i class="fa-solid fa-plus"></i> Añadir Fotos
      </button>
      <span class="text-gray-500 text-sm">Fotos del álbum</span>
    </div>
    <div class="p-6 overflow-y-auto flex-1">
      <div id="galleryGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
    </div>
  </div>
</div>
`