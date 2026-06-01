import { useState } from 'react';
import { crearCatalogo } from './services/catalogosService';

export default function PanelAdmin() {
  // Variables para guardar lo que el usuario escribe
  const [titulo, setTitulo] = useState('');
  const [leyenda, setLeyenda] = useState('');

  const manejarGuardado = async (e) => {
    e.preventDefault(); // Evita que la página se recargue de golpe

    // 1. Llamamos a la función que conecta con Supabase
    const nuevoCatalogo = await crearCatalogo(titulo, leyenda);

    // 2. Comprobamos si se guardó correctamente
    if (nuevoCatalogo) {
      alert('¡Catálogo guardado en la base de datos!');
      setTitulo(''); // Limpiamos el texto
      setLeyenda('');
    } else {
      alert('Hubo un error al intentar guardar.');
    }
  };

  // ... (Aquí iría el diseño visual del panel) ...
}