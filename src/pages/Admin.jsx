import { useEffect } from 'react'

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

    // Cargar admin.js como módulo dinámico
    const script = document.createElement('script')
    script.type = 'module'
    script.src = '/admin.js'
    script.id = 'admin-script'
    document.body.appendChild(script)

    return () => {
      document.getElementById('admin-script')?.remove()
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