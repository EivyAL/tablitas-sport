import {
    crearCatalogo,
    obtenerCatalogosConFotos,
    subirFotoACatalogo,
    subirPortadaCatalogo,
    actualizarCatalogo,
    eliminarCatalogo,
    eliminarFotoCatalogo,
} from './src/services/catalogosService.js';

// ── Estado global ─────────────────────────────────────────────────────────────
const catalogs = [];
let currentCatalogId = null;
let selectedCoverFile = null;
let isSavingCatalog = false;

// ── Carga de catálogos ────────────────────────────────────────────────────────
async function loadCatalogs() {
    const data = await obtenerCatalogosConFotos();
    catalogs.splice(0, catalogs.length, ...(Array.isArray(data) ? data : []));
    renderCatalogGrid();
}

// ── Pantallas login / dashboard ───────────────────────────────────────────────
async function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    await loadCatalogs();
}

function showLogin() {
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

// ── Modal: nuevo / editar catálogo ────────────────────────────────────────────
function openNewCatalogModal() {
    const modal = document.getElementById('modalNewCatalog');
    modal.querySelector('input[type="text"]').value = '';
    modal.querySelector('textarea').value = '';
    resetCoverPreview();
    delete modal.dataset.editId;
    selectedCoverFile = null;
    modal.classList.remove('hidden');
}

async function editCatalog(btn) {
    const card = btn.closest('.catalogCard');
    if (!card) return;
    const id = card.dataset.id;
    const catalog = catalogs.find(c => String(c.id) === String(id));
    if (!catalog) return;

    const modal = document.getElementById('modalNewCatalog');
    modal.querySelector('input[type="text"]').value = catalog.titulo || '';
    modal.querySelector('textarea').value = catalog.leyenda || '';
    selectedCoverFile = null;
    resetCoverPreview();
    modal.dataset.editId = id;
    modal.classList.remove('hidden');
}

// ── Guardar catálogo (crear o editar) ─────────────────────────────────────────
async function saveCatalog() {
    if (isSavingCatalog) return;
    isSavingCatalog = true;

    const saveButton = document.getElementById('saveCatalogButton');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const modal = document.getElementById('modalNewCatalog');
    const title = modal.querySelector('input[type="text"]').value.trim();
    const description = modal.querySelector('textarea').value.trim();

    if (!title) {
        alert('El título es requerido.');
        isSavingCatalog = false;
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        return;
    }

    const editId = modal.dataset.editId;
    let catalogId = editId;

    try {
        // Paso 1: crear o actualizar el registro del catálogo
        if (editId) {
            const updated = await actualizarCatalogo(editId, title, description);
            if (!updated) throw new Error('No se pudo actualizar el catálogo.');
        } else {
            const nuevo = await crearCatalogo(title, description);
            if (!nuevo?.id) throw new Error('No se pudo crear el catálogo.');
            catalogId = nuevo.id;
        }

        // Paso 2: si hay portada seleccionada, subirla a cover_url (NO al álbum)
        if (selectedCoverFile && catalogId) {
            try {
                await subirPortadaCatalogo(selectedCoverFile, catalogId);
            } catch (err) {
                console.error('Error subiendo portada:', err);
                alert('Catálogo guardado, pero la portada no se pudo subir. Revisa la consola.');
            }
        }

        // Paso 3: limpiar y cerrar
        await loadCatalogs();
        modal.classList.add('hidden');
        modal.querySelector('input[type="text"]').value = '';
        modal.querySelector('textarea').value = '';
        delete modal.dataset.editId;
        resetCoverPreview();
        selectedCoverFile = null;

    } catch (error) {
        console.error(error);
        alert(`Error al guardar el catálogo: ${error.message || error}`);
    } finally {
        isSavingCatalog = false;
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

// ── Eliminar catálogo ─────────────────────────────────────────────────────────
async function deleteCatalog(btn) {
    const card = btn.closest('.catalogCard');
    if (!card) return;
    const id = card.dataset.id;
    const catalog = catalogs.find(c => String(c.id) === String(id));
    if (!confirm(`¿Deseas eliminar "${catalog?.titulo || 'este catálogo'}"?`)) return;

    const deleted = await eliminarCatalogo(id);
    if (deleted) {
        await loadCatalogs();
        closeModals();
    } else {
        alert('Error al eliminar catálogo.');
    }
}

// ── Render grid de catálogos ──────────────────────────────────────────────────
function renderCatalogGrid() {
    const grid = document.getElementById('catalogGrid');
    grid.innerHTML = '';

    if (!catalogs.length) {
        grid.innerHTML = `<p class="text-gray-400 col-span-full text-center py-16">
            No hay catálogos aún. Crea el primero con el botón de arriba.
        </p>`;
        return;
    }

    catalogs.forEach(catalog => {
        // La portada viene de cover_url, nunca de fotos_catalogo
        const coverUrl = catalog.cover_url || '';
        const photoCount = catalog.fotos_catalogo?.length || 0;
        const title = catalog.titulo || 'Sin título';
        const description = catalog.leyenda || '';

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden catalogCard';
        card.dataset.id = catalog.id;

        card.innerHTML = `
            <div class="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                ${coverUrl
                    ? `<img src="${coverUrl}" class="w-full h-full object-cover">`
                    : `<div class="flex flex-col items-center gap-1">
                         <i class="fa-regular fa-image text-3xl text-gray-300"></i>
                         <span class="text-gray-400 text-xs font-medium">Sin portada</span>
                       </div>`
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
        `;
        grid.appendChild(card);
    });
}

// ── Modal: galería de fotos del álbum ─────────────────────────────────────────
async function openGalleryModal(btn) {
    const card = btn.closest('.catalogCard');
    if (!card) return;
    currentCatalogId = card.dataset.id;
    const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId));
    const modal = document.getElementById('modalGallery');
    modal.querySelector('h3').innerText = `Álbum: ${catalog?.titulo || 'Sin título'}`;
    renderGallery();
    modal.classList.remove('hidden');
}

function renderGallery() {
    const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId));
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = '';
    if (!catalog) return;

    const photos = catalog.fotos_catalogo || [];

    if (!photos.length) {
        galleryGrid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-400">
                <i class="fa-regular fa-images text-4xl mb-3 block"></i>
                <p class="font-medium">Este álbum está vacío.</p>
                <p class="text-sm mt-1">Usa el botón "Añadir Fotos" para subir imágenes.</p>
            </div>`;
        return;
    }

    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200';
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
        `;
        card.querySelector('.view-btn').addEventListener('click', () => window.open(photo.url_imagen, '_blank'));
        card.querySelector('.delete-btn').addEventListener('click', () => deletePhoto(photo.id));
        galleryGrid.appendChild(card);
    });
}

async function deletePhoto(photoId) {
    if (!confirm('¿Deseas eliminar esta foto del álbum?')) return;
    const deleted = await eliminarFotoCatalogo(photoId);
    if (deleted) {
        await loadCatalogs();
        renderGallery();
    } else {
        alert('Error al eliminar la foto.');
    }
}

// ── Portada: preview y upload ─────────────────────────────────────────────────
function setCatalogCover(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen.');
        return;
    }
    selectedCoverFile = file;
    updateCoverPreview(URL.createObjectURL(file), file.name);
}

function resetCoverPreview() {
    document.getElementById('coverUploadArea').innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-500">Haz clic para subir imagen o arrastra el archivo aquí</p>
    `;
}

function updateCoverPreview(url, name) {
    document.getElementById('coverUploadArea').innerHTML = `
        <img src="${url}" alt="Vista previa" class="mx-auto mb-3 w-full max-w-xs rounded-lg border border-gray-200 object-contain max-h-48">
        <p class="text-sm text-gray-700 font-semibold">${name}</p>
        <p class="text-xs text-gray-400 mt-1">Imagen lista para cargar como portada</p>
    `;
}

// ── Drag & drop portada ───────────────────────────────────────────────────────
function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('coverUploadArea').classList.add('border-[#00c896]', 'bg-green-50');
}
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
}
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('coverUploadArea').classList.remove('border-[#00c896]', 'bg-green-50');
}
function handleCoverDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('coverUploadArea').classList.remove('border-[#00c896]', 'bg-green-50');
    const file = event.dataTransfer.files[0];
    if (file) setCatalogCover(file);
}

// ── Cerrar modales ────────────────────────────────────────────────────────────
function closeModals() {
    document.getElementById('modalNewCatalog').classList.add('hidden');
    document.getElementById('modalGallery').classList.add('hidden');
}

// ── Listeners de inputs de archivo ───────────────────────────────────────────
document.getElementById('catalogCoverUpload')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) setCatalogCover(file);
});

document.getElementById('fileUpload')?.addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    const catalog = catalogs.find(c => String(c.id) === String(currentCatalogId));
    if (!files.length || !catalog) return;

    let uploadedAny = false;
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
            await subirFotoACatalogo(file, catalog.id);
            uploadedAny = true;
        } catch (err) {
            console.error('Error subiendo foto al álbum:', err);
            alert(`No se pudo subir "${file.name}". Revisa la consola.`);
        }
    }

    if (uploadedAny) {
        await loadCatalogs();
        renderGallery();
    }
    e.target.value = '';
});

// ── Exponer al scope global (requerido por los onclick del HTML) ──────────────
window.showDashboard = showDashboard;
window.showLogin = showLogin;
window.openNewCatalogModal = openNewCatalogModal;
window.editCatalog = editCatalog;
window.deleteCatalog = deleteCatalog;
window.saveCatalog = saveCatalog;
window.openGalleryModal = openGalleryModal;
window.closeModals = closeModals;
window.handleCoverDrop = handleCoverDrop;
window.handleDragEnter = handleDragEnter;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;

// ── Arranque ──────────────────────────────────────────────────────────────────
loadCatalogs();