import { supabase } from '../supabase'

// 1. CREAR CATÁLOGO
export const crearCatalogo = async (titulo, leyenda) => {
  const { data, error } = await supabase
    .from('catalogos')
    .insert([{ titulo, leyenda }])
    .select()
  if (error) { console.error('Error al crear catálogo:', error); return null }
  return data[0]
}

// 2. SUBIR PORTADA → guarda en catalogos.cover_url, NO toca fotos_catalogo
export const subirPortadaCatalogo = async (archivo, catalogoId) => {
  const nombreArchivo = `portadas/${catalogoId}_${Date.now()}_${archivo.name}`

  const { error: uploadError } = await supabase.storage
    .from('uniformes')
    .upload(nombreArchivo, archivo)
  if (uploadError) throw new Error(`No se pudo subir la portada: ${uploadError.message}`)

  const { data: urlData } = supabase.storage
    .from('uniformes')
    .getPublicUrl(nombreArchivo)
  if (!urlData?.publicUrl) throw new Error('No se pudo obtener la URL pública de la portada')

  const { data, error: dbError } = await supabase
    .from('catalogos')
    .update({ cover_url: urlData.publicUrl })
    .eq('id', catalogoId)
    .select()
  if (dbError) throw dbError

  return data?.[0] || null
}

// 3. SUBIR FOTO AL ÁLBUM → guarda en fotos_catalogo, NO toca la portada
export const subirFotoACatalogo = async (archivo, catalogoId) => {
  const nombreArchivo = `catalogos/${Date.now()}_${archivo.name}`

  const { error: uploadError } = await supabase.storage
    .from('uniformes')
    .upload(nombreArchivo, archivo)
  if (uploadError) throw new Error(`No se pudo subir la imagen: ${uploadError.message}`)

  const { data: urlData } = supabase.storage
    .from('uniformes')
    .getPublicUrl(nombreArchivo)
  if (!urlData?.publicUrl) throw new Error('No se pudo obtener la URL pública de la imagen')

  const { data: dbData, error: dbError } = await supabase
    .from('fotos_catalogo')
    .insert([{ catalogo_id: catalogoId, url_imagen: urlData.publicUrl }])
    .select()
  if (dbError) throw dbError

  return dbData?.[0] || null
}

// 4. OBTENER CATÁLOGOS — trae cover_url separada de fotos_catalogo
export const obtenerCatalogosConFotos = async () => {
  const { data, error } = await supabase
    .from('catalogos')
    .select(`
      id,
      titulo,
      leyenda,
      cover_url,
      fotos_catalogo (
        id,
        url_imagen
      )
    `)
    .order('creado_en', { ascending: false })
  if (error) { console.error('Error obteniendo catálogos:', error); return [] }
  return data
}

// 5. ACTUALIZAR CATÁLOGO
export const actualizarCatalogo = async (id, titulo, leyenda) => {
  const { data, error } = await supabase
    .from('catalogos')
    .update({ titulo, leyenda })
    .eq('id', id)
    .select()
  if (error) { console.error('Error al actualizar catálogo:', error); return null }
  return data[0]
}

// 6. ELIMINAR CATÁLOGO
export const eliminarCatalogo = async (id) => {
  const { error } = await supabase
    .from('catalogos')
    .delete()
    .eq('id', id)
  if (error) { console.error('Error al eliminar catálogo:', error); return false }
  return true
}

// 7. ELIMINAR FOTO DEL ÁLBUM
export const eliminarFotoCatalogo = async (fotoId) => {
  const { error } = await supabase
    .from('fotos_catalogo')
    .delete()
    .eq('id', fotoId)
  if (error) { console.error('Error al eliminar foto:', error); return false }
  return true
}