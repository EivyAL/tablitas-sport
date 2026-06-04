import { useEffect } from 'react'
import { obtenerCatalogosPorSeccion } from '../services/catalogosService'

export default function TiendaPublica() {

  useEffect(() => {
    // ── Fuentes y FontAwesome ──────────────────────────────────────────────
    if (!document.getElementById('fa-css')) {
      const l = document.createElement('link')
      l.id = 'fa-css'; l.rel = 'stylesheet'
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
      document.head.appendChild(l)
    }
    if (!document.getElementById('barlow-css')) {
      const l = document.createElement('link')
      l.id = 'barlow-css'; l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap'
      document.head.appendChild(l)
    }

    // ── Nav scroll ────────────────────────────────────────────────────────
    const nav = document.getElementById('mainNav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Reveal on scroll ──────────────────────────────────────────────────
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target) }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el))

    // ── Modal galería pública ─────────────────────────────────────────────
    window.verGaleriaPublica = function(id) {
      if (!window.publicCatalogs) return
      renderPublicGallery(id)
      document.getElementById('publicModalGallery')?.classList.add('open')
    }
    window.closePublicGallery = function() {
      document.getElementById('publicModalGallery')?.classList.remove('open')
    }
    document.getElementById('publicModalGallery')?.addEventListener('click', function(e) {
      if (e.target === this) window.closePublicGallery()
    })

    function renderPublicGallery(id) {
      const catalogo = window.publicCatalogs?.find(c => String(c.id) === String(id))
      const grid = document.getElementById('publicGalleryGrid')
      const title = document.getElementById('publicGalleryTitle')
      if (!catalogo || !grid) return
      title.innerText = catalogo.titulo || 'Catálogo'
      grid.innerHTML = ''
      const fotos = catalogo.fotos_catalogo || []
      if (!fotos.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888">No hay imágenes en este catálogo.</div>'
        return
      }
      const urls = fotos.map(f => f.url_imagen)
      fotos.forEach((foto, index) => {
        const div = document.createElement('div')
        div.className = 'gallery-photo'
        div.innerHTML = `<img src="${foto.url_imagen}" alt="" loading="lazy">`
        div.addEventListener('click', () => openLightbox(urls, index))
        grid.appendChild(div)
      })
    }

    // ── Lightbox ──────────────────────────────────────────────────────────
    let lightboxUrls = [], lightboxIndex = 0

    function openLightbox(urls, index) {
      lightboxUrls = urls; lightboxIndex = index
      let lb = document.getElementById('lightbox')
      if (!lb) {
        lb = document.createElement('div')
        lb.id = 'lightbox'
        lb.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.96);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);opacity:0;transition:opacity 0.25s ease;'
        lb.innerHTML = `
          <button id="lb-close" style="position:absolute;top:20px;right:20px;width:44px;height:44px;border:1px solid #444;background:transparent;color:#aaa;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;"><i class="fa-solid fa-xmark"></i></button>
          <div id="lb-counter" style="position:absolute;top:24px;left:50%;transform:translateX(-50%);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.2em;color:#888;"></div>
          <button id="lb-prev" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);width:52px;height:52px;border:1px solid #333;background:rgba(0,0,0,0.6);color:white;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;"><i class="fa-solid fa-chevron-left"></i></button>
          <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;padding:80px 100px;">
            <img id="lb-img" src="" alt="" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;transition:opacity 0.2s ease,transform 0.2s ease;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
          </div>
          <button id="lb-next" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);width:52px;height:52px;border:1px solid #333;background:rgba(0,0,0,0.6);color:white;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;"><i class="fa-solid fa-chevron-right"></i></button>
          <div id="lb-thumbs" style="position:absolute;bottom:0;left:0;right:0;display:flex;gap:6px;justify-content:center;padding:14px 20px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);overflow-x:auto;"></div>
        `
        document.body.appendChild(lb)
        document.getElementById('lb-close').addEventListener('click', closeLightbox)
        document.getElementById('lb-prev').addEventListener('click', () => navigateLightbox(-1))
        document.getElementById('lb-next').addEventListener('click', () => navigateLightbox(1))
        lb.addEventListener('click', e => { if (e.target === lb) closeLightbox() })
        requestAnimationFrame(() => { lb.style.opacity = '1' })
      } else {
        lb.style.display = 'flex'
        requestAnimationFrame(() => { lb.style.opacity = '1' })
      }
      renderLightboxImage()
    }

    function renderLightboxImage() {
      const img = document.getElementById('lb-img')
      const counter = document.getElementById('lb-counter')
      const thumbs = document.getElementById('lb-thumbs')
      const prev = document.getElementById('lb-prev')
      const next = document.getElementById('lb-next')
      img.style.opacity = '0'; img.style.transform = 'scale(0.97)'
      setTimeout(() => { img.src = lightboxUrls[lightboxIndex]; img.style.opacity = '1'; img.style.transform = 'scale(1)' }, 150)
      counter.innerText = `${lightboxIndex + 1} / ${lightboxUrls.length}`
      prev.style.display = lightboxUrls.length <= 1 ? 'none' : 'flex'
      next.style.display = lightboxUrls.length <= 1 ? 'none' : 'flex'
      thumbs.innerHTML = ''
      lightboxUrls.forEach((url, i) => {
        const th = document.createElement('img')
        th.src = url
        th.style.cssText = `width:48px;height:48px;object-fit:cover;cursor:pointer;border-radius:3px;flex-shrink:0;border:2px solid ${i === lightboxIndex ? '#C5161D' : 'transparent'};opacity:${i === lightboxIndex ? '1' : '0.45'};transition:opacity 0.2s,border-color 0.2s;`
        th.addEventListener('click', e => { e.stopPropagation(); lightboxIndex = i; renderLightboxImage() })
        thumbs.appendChild(th)
      })
    }

    function navigateLightbox(dir) {
      lightboxIndex = (lightboxIndex + dir + lightboxUrls.length) % lightboxUrls.length
      renderLightboxImage()
    }

    function closeLightbox() {
      const lb = document.getElementById('lightbox')
      if (!lb) return
      lb.style.opacity = '0'
      setTimeout(() => { lb.style.display = 'none' }, 250)
    }

    document.addEventListener('keydown', function kbHandler(e) {
      const lb = document.getElementById('lightbox')
      const lbVisible = lb && lb.style.display !== 'none' && lb.style.opacity !== '0'
      if (lbVisible) {
        if (e.key === 'ArrowRight') navigateLightbox(1)
        if (e.key === 'ArrowLeft') navigateLightbox(-1)
        if (e.key === 'Escape') closeLightbox()
      } else {
        if (e.key === 'Escape') window.closePublicGallery()
      }
    })

    // ── Cargar secciones y catálogos ──────────────────────────────────────
    async function cargarSecciones() {
      const container = document.getElementById('seccionesContainer')
      if (!container) return
      try {
        const secciones = await obtenerCatalogosPorSeccion()
        const conCatalogos = secciones.filter(s => s.catalogos?.length > 0)
        window.publicCatalogs = conCatalogos.flatMap(s => s.catalogos)
        container.innerHTML = ''

        if (!conCatalogos.length) {
          container.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#888;font-family:Barlow Condensed,sans-serif;font-size:18px;">Pronto subiremos nuevas colecciones.</div>'
          return
        }

        conCatalogos.forEach(seccion => {
          // Encabezado de sección
          const header = document.createElement('div')
          header.className = 'section-header reveal'
          header.innerHTML = `
            <div>
              <div class="section-eyebrow">
                <i class="${seccion.icono || 'fa-solid fa-box'}" style="font-size:13px;"></i>
                ${seccion.nombre}
              </div>
              <h2 class="section-title">${seccion.nombre}<br>
                <span style="-webkit-text-stroke:2px #F5F5F3;color:transparent;">Colección</span>
              </h2>
            </div>
            <a href="https://wa.me/528334515715" target="_blank" class="btn-secondary" style="align-self:flex-end;">
              <i class="fa-brands fa-whatsapp"></i> COTIZAR EN WHATSAPP
            </a>
          `
          container.appendChild(header)

          // Grid de catálogos
          const grid = document.createElement('div')
          grid.style.cssText = 'padding:0 5%;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2px;margin-bottom:80px;'
          container.appendChild(grid)

          seccion.catalogos.forEach(catalogo => {
            const coverUrl = catalogo.cover_url || 'https://via.placeholder.com/500x500/161616/C5161D?text=Tablitas+Sport'
            const msg = encodeURIComponent(`Hola Tablitas Sport, me interesa cotizar: ${catalogo.titulo}`)
            const urlWA = `https://wa.me/528334515715?text=${msg}`

            const card = document.createElement('div')
            card.className = 'product-card reveal'
            card.innerHTML = `
              <div class="card-img-wrap">
                <img class="card-img" src="${coverUrl}" alt="${catalogo.titulo}" loading="lazy">
              </div>
              <div class="card-overlay"></div>
              <div class="card-tag">${seccion.nombre.toUpperCase()}</div>
              <div class="card-body">
                <div class="card-title">${catalogo.titulo}</div>
                <div class="card-desc">${catalogo.leyenda || 'Diseño premium para tu equipo.'}</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                  <button class="card-cta">VER ÁLBUM <i class="fa-solid fa-images"></i></button>
                  <a href="${urlWA}" target="_blank" class="card-cta" style="background:#080808;border:1px solid #444;">
                    COTIZAR <i class="fa-brands fa-whatsapp"></i>
                  </a>
                </div>
              </div>
            `
            card.addEventListener('click', e => {
              if (e.target.closest('a')) return
              window.verGaleriaPublica(catalogo.id)
            })
            grid.appendChild(card)

            const obs = new IntersectionObserver(entries => {
              entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
            }, { threshold: 0.08 })
            obs.observe(card)
          })
        })

        // Re-observar elementos reveal recién agregados
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObs.observe(el))

      } catch (err) {
        console.error(err)
        const container = document.getElementById('seccionesContainer')
        if (container) container.innerHTML = '<div style="text-align:center;padding:80px;color:#C5161D;">Error al cargar catálogos.</div>'
      }
    }

    cargarSecciones()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <style>{estilos}</style>

      {/* NAV */}
      <nav id="mainNav">
        <a href="/" className="nav-logo">
          <img src="/Tablitas.jpg" alt="Tablitas Sport" className="nav-logo-img" />
          <div className="nav-logo-text">TABLITAS <span>SPORT</span></div>
        </a>
        <ul className="nav-links">
          <li><a href="/">INICIO</a></li>
          <li><a href="#catalogo">CATÁLOGO</a></li>
          <li><a href="#contacto">CONTACTO</a></li>
          <li><a href="https://wa.me/528334515715" target="_blank" className="btn-nav-cta">WHATSAPP</a></li>
        </ul>
        <button className="hamburger" aria-label="Menú">
          <i className="fa-solid fa-bars"></i>
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-corner"></div>
        <div className="hero-content">
          <div className="hero-badge">UNIFORMES DE FÚTBOL PREMIUM</div>
          <h1 className="hero-title">
            <span>Que te busquen</span>
            <span className="accent">por bueno,</span>
            <span className="outline">no por barato.</span>
          </h1>
          <p className="hero-sub">
            Uniformes de fútbol de alta calidad, personalizados para tu equipo.
            Materiales premium, cortes profesionales y entrega rápida.
          </p>
          <div className="hero-ctas">
            <a href="#catalogo" className="btn-primary">VER CATÁLOGOS <i className="fa-solid fa-arrow-right"></i></a>
            <a href="https://wa.me/528334515715" target="_blank" className="btn-secondary">
              <i className="fa-brands fa-whatsapp"></i> COTIZAR AHORA
            </a>
          </div>
        </div>
        <div className="stats-bar">
          <div className="stats-inner">
            <div className="stat-item"><div className="stat-num">500<span>+</span></div><div className="stat-label">Equipos equipados</div></div>
            <div className="stat-item"><div className="stat-num">10<span>+</span></div><div className="stat-label">Años de experiencia</div></div>
            <div className="stat-item"><div className="stat-num">100<span>%</span></div><div className="stat-label">Satisfacción</div></div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {['Uniformes Premium','Diseño Personalizado','Entrega Rápida','Calidad Garantizada','Materiales de Alto Rendimiento','Tablitas Sport',
            'Uniformes Premium','Diseño Personalizado','Entrega Rápida','Calidad Garantizada','Materiales de Alto Rendimiento','Tablitas Sport'
          ].map((t, i) => <div key={i} className="marquee-item">{t}</div>)}
        </div>
      </div>

      {/* FEATURES */}
      <div className="features-bar reveal">
        <div className="features-grid">
          {[
            { icon: 'fa-solid fa-shirt',     title: 'Material Premium',        sub: 'Tela técnica de alto rendimiento' },
            { icon: 'fa-solid fa-pen-ruler',  title: '100% Personalizable',     sub: 'Tu diseño, tu identidad' },
            { icon: 'fa-solid fa-truck-fast', title: 'Entrega Rápida',          sub: 'Tiempos de producción cortos' },
            { icon: 'fa-solid fa-medal',      title: '+10 Años de Trayectoria', sub: 'Cientos de equipos satisfechos' },
          ].map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon"><i className={f.icon}></i></div>
              <div className="feature-text"><strong>{f.title}</strong><span>{f.sub}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIONES DINÁMICAS (Uniformes, Accesorios, etc.) */}
      <div id="catalogo" style={{ background: 'var(--black-2)' }}>
        <div id="seccionesContainer">
          <div className="catalog-loading">
            <div className="loading-icon"><i className="fa-solid fa-circle-notch fa-spin"></i></div>
            <div className="loading-text">Cargando colecciones...</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section id="contacto" className="cta-section">
        <div className="cta-bg-text">JUEGA</div>
        <div className="cta-inner reveal">
          <div className="section-eyebrow">¿Listo para el siguiente nivel?</div>
          <h2 className="cta-title">Viste a tu equipo<br /><span className="red">como campeones.</span></h2>
          <p className="cta-sub">Contáctanos y recibe una cotización sin compromiso.</p>
          <div className="cta-buttons">
            <a href="https://wa.me/528334515715" target="_blank" className="btn-primary">
              <i className="fa-brands fa-whatsapp"></i> ESCRÍBENOS POR WHATSAPP
            </a>
            <a href="https://www.facebook.com/tablitassportuniformes" target="_blank" className="btn-secondary">
              <i className="fa-brands fa-facebook-f"></i> FACEBOOK
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">
              <img src="/Tablitas.jpg" alt="Tablitas Sport" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',background:'white',border:'2px solid var(--red)'}} />
              TABLITAS <span>SPORT</span>
            </div>
            <p className="footer-desc">Uniformes de fútbol premium para equipos que quieren destacar dentro y fuera del campo.</p>
            <div className="social-links">
              <a href="https://wa.me/528334515715" target="_blank" className="social-link"><i className="fa-brands fa-whatsapp"></i></a>
              <a href="https://www.facebook.com/tablitassportuniformes" target="_blank" className="social-link"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/tablitassport/" target="_blank" className="social-link"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
          <div>
            <h4 className="footer-heading">Navegación</h4>
            <ul className="footer-links">
              <li><a href="/"><i className="fa-solid fa-chevron-right" style={{fontSize:'10px',color:'var(--red)'}}></i> Inicio</a></li>
              <li><a href="#catalogo"><i className="fa-solid fa-chevron-right" style={{fontSize:'10px',color:'var(--red)'}}></i> Catálogo</a></li>
              <li><a href="#contacto"><i className="fa-solid fa-chevron-right" style={{fontSize:'10px',color:'var(--red)'}}></i> Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Contacto</h4>
            <div className="footer-contact-item"><i className="fa-solid fa-location-dot"></i><span>Álvaro Obregón 225, Zona Centro, 89000 Tampico, Tamps.</span></div>
            <div className="footer-contact-item"><i className="fa-solid fa-phone"></i><span>833 451 5715</span></div>
            <div className="footer-contact-item"><i className="fa-brands fa-whatsapp"></i><span>WhatsApp: 833 451 5715</span></div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Tablitas Sport. Todos los derechos reservados.</p>
          <a href="/admin">Acceso Administrativo</a>
        </div>
      </footer>

      {/* MODAL GALERÍA PÚBLICA */}
      <div id="publicModalGallery">
        <div className="modal-box">
          <div className="modal-header">
            <div>
              <div className="modal-header-title" id="publicGalleryTitle">Catálogo</div>
              <div className="modal-header-sub">EXPLORA LA COLECCIÓN</div>
            </div>
            <button className="modal-close" onClick={() => window.closePublicGallery()}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="modal-body">
            <div id="publicGalleryGrid"></div>
          </div>
        </div>
      </div>
    </>
  )
}

const estilos = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --red: #C5161D; --red-dark: #9B1015;
    --black: #080808; --black-2: #0F0F0F; --black-3: #161616; --black-4: #1E1E1E;
    --gray-1: #2A2A2A; --gray-2: #444; --gray-3: #888; --gray-4: #BBBBB5;
    --white: #F5F5F3;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--black); color: var(--white); font-family: var(--font-body); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--black-2); }
  ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 2px; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 5%; height: 70px; display: flex; align-items: center; justify-content: space-between; transition: background 0.4s, border-color 0.4s; border-bottom: 1px solid transparent; }
  nav.scrolled { background: rgba(8,8,8,0.95); backdrop-filter: blur(12px); border-bottom-color: var(--gray-1); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; background: white; border: 2px solid var(--red); }
  .nav-logo-text { font-family: var(--font-display); font-weight: 800; font-size: 20px; letter-spacing: 0.12em; color: var(--white); }
  .nav-logo-text span { color: var(--gray-3); font-weight: 400; }
  .nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
  .nav-links a { font-family: var(--font-display); font-weight: 700; font-size: 13px; letter-spacing: 0.15em; color: var(--gray-3); text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--white); }
  .btn-nav-cta { font-family: var(--font-display) !important; font-weight: 800 !important; font-size: 12px !important; letter-spacing: 0.18em !important; color: var(--white) !important; background: var(--red) !important; padding: 10px 22px !important; border: none; clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); transition: background 0.2s, transform 0.15s !important; }
  .btn-nav-cta:hover { background: var(--red-dark) !important; transform: scale(1.03) !important; }
  .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; background-image: linear-gradient(to bottom,rgba(8,8,8,0.6) 0%,rgba(8,8,8,0.85) 60%,rgba(8,8,8,1) 100%), linear-gradient(to right,rgba(8,8,8,1) 0%,rgba(8,8,8,0) 15%,rgba(8,8,8,0) 85%,rgba(8,8,8,1) 100%), url('/cancha-fondo.jpg'); background-size: cover; background-position: center; }
  .hero-corner { position: absolute; bottom: 60px; right: 5%; width: 180px; height: 180px; border: 1px solid rgba(197,22,29,0.15); border-radius: 50%; animation: pulse-ring 4s ease-in-out infinite; }
  .hero-corner::after { content: ''; position: absolute; inset: 20px; border: 1px solid rgba(197,22,29,0.1); border-radius: 50%; animation: pulse-ring 4s ease-in-out infinite 0.5s; }
  @keyframes pulse-ring { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.08); opacity: 1; } }
  .hero-content { position: relative; z-index: 2; padding: 120px 5% 80px; max-width: 900px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 700; font-size: 11px; letter-spacing: 0.25em; color: var(--red); border: 1px solid rgba(197,22,29,0.35); padding: 6px 16px; clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%); background: rgba(197,22,29,0.06); margin-bottom: 28px; animation: fadeUp 0.6s ease both; }
  .hero-badge::before { content: ''; width: 6px; height: 6px; background: var(--red); border-radius: 50%; animation: blink 2s ease infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .hero-title { font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: clamp(58px,9vw,110px); line-height: 0.9; letter-spacing: -0.01em; text-transform: uppercase; margin-bottom: 24px; animation: fadeUp 0.6s ease 0.1s both; }
  .hero-title .accent { color: var(--red); display: block; }
  .hero-title .outline { -webkit-text-stroke: 2px var(--white); color: transparent; display: block; }
  .hero-sub { font-size: 15px; font-weight: 300; color: var(--gray-4); max-width: 460px; line-height: 1.7; margin-bottom: 40px; animation: fadeUp 0.6s ease 0.2s both; }
  .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; animation: fadeUp 0.6s ease 0.3s both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .btn-primary { font-family: var(--font-display); font-weight: 800; font-size: 13px; letter-spacing: 0.18em; text-decoration: none; color: var(--white); background: var(--red); padding: 14px 32px; display: inline-flex; align-items: center; gap: 10px; clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition: background 0.2s, transform 0.15s, box-shadow 0.2s; position: relative; overflow: hidden; }
  .btn-primary:hover { background: var(--red-dark); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(197,22,29,0.35); }
  .btn-secondary { font-family: var(--font-display); font-weight: 700; font-size: 13px; letter-spacing: 0.18em; text-decoration: none; color: var(--white); background: transparent; border: 1px solid var(--gray-2); padding: 14px 32px; display: inline-flex; align-items: center; gap: 10px; clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition: border-color 0.2s, background 0.2s, transform 0.15s; }
  .btn-secondary:hover { border-color: var(--white); background: rgba(255,255,255,0.05); transform: translateY(-2px); }
  .stats-bar { position: relative; z-index: 2; padding: 0 5% 60px; animation: fadeUp 0.6s ease 0.4s both; }
  .stats-inner { display: flex; border-top: 1px solid var(--gray-1); padding-top: 32px; max-width: 600px; }
  .stat-item { flex: 1; padding-right: 32px; }
  .stat-item + .stat-item { padding-left: 32px; border-left: 1px solid var(--gray-1); }
  .stat-num { font-family: var(--font-display); font-weight: 900; font-size: 48px; line-height: 1; color: var(--white); }
  .stat-num span { color: var(--red); }
  .stat-label { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; color: var(--gray-3); text-transform: uppercase; margin-top: 4px; }
  .marquee-wrap { background: var(--red); overflow: hidden; padding: 12px 0; }
  .marquee-track { display: flex; width: max-content; animation: marquee 20s linear infinite; }
  .marquee-track:hover { animation-play-state: paused; }
  .marquee-item { font-family: var(--font-display); font-weight: 800; font-style: italic; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; padding: 0 28px; display: flex; align-items: center; gap: 20px; white-space: nowrap; }
  .marquee-item::after { content: '◆'; font-size: 8px; opacity: 0.5; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  section { position: relative; z-index: 1; }
  .section-header { padding: 80px 5% 48px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; }
  .section-eyebrow { font-family: var(--font-display); font-weight: 700; font-size: 11px; letter-spacing: 0.3em; color: var(--red); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
  .section-eyebrow::before { content: ''; width: 24px; height: 2px; background: var(--red); }
  .section-title { font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: clamp(36px,5vw,64px); line-height: 0.95; text-transform: uppercase; }
  .features-bar { background: var(--black-3); border-top: 1px solid var(--gray-1); border-bottom: 1px solid var(--gray-1); padding: 40px 5%; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 32px; }
  .feature-item { display: flex; align-items: center; gap: 16px; }
  .feature-icon { width: 44px; height: 44px; background: rgba(197,22,29,0.1); border: 1px solid rgba(197,22,29,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; color: var(--red); clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); }
  .feature-text strong { display: block; font-family: var(--font-display); font-weight: 700; font-size: 15px; letter-spacing: 0.05em; margin-bottom: 2px; }
  .feature-text span { font-size: 12px; color: var(--gray-3); }
  .product-card { background: var(--black-3); position: relative; overflow: hidden; cursor: pointer; transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94); }
  .product-card:hover { transform: scale(1.015); z-index: 2; }
  .product-card:hover .card-overlay { opacity: 1; }
  .product-card:hover .card-img { transform: scale(1.06); filter: brightness(0.7); }
  .product-card:hover .card-cta { transform: translateY(0); opacity: 1; }
  .card-img-wrap { height: 340px; overflow: hidden; background: var(--black-4); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.5s ease, filter 0.4s ease; }
  .card-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(8,8,8,0.95) 0%,rgba(8,8,8,0.2) 50%,transparent 100%); opacity: 0.6; transition: opacity 0.4s; }
  .card-tag { position: absolute; top: 16px; left: 16px; font-family: var(--font-display); font-weight: 800; font-size: 10px; letter-spacing: 0.2em; color: var(--white); background: var(--red); padding: 5px 12px; clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%); }
  .card-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; }
  .card-title { font-family: var(--font-display); font-weight: 800; font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4px; }
  .card-desc { font-size: 13px; color: var(--gray-4); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-cta { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 800; font-size: 12px; letter-spacing: 0.18em; text-decoration: none; color: var(--white); background: var(--red); padding: 10px 20px; clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); transform: translateY(8px); opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s; border: none; cursor: pointer; }
  .card-cta:hover { background: var(--red-dark); }
  .catalog-loading { grid-column: 1/-1; text-align: center; padding: 80px 20px; }
  .loading-icon { font-size: 32px; color: var(--red); margin-bottom: 16px; }
  .loading-text { font-family: var(--font-display); font-size: 18px; color: var(--gray-3); letter-spacing: 0.1em; }
  .cta-section { background: var(--black); padding: 100px 5%; position: relative; overflow: hidden; }
  .cta-section::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle,rgba(197,22,29,0.08) 0%,transparent 70%); pointer-events: none; }
  .cta-bg-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: clamp(80px,15vw,200px); color: transparent; -webkit-text-stroke: 1px rgba(197,22,29,0.06); text-transform: uppercase; pointer-events: none; white-space: nowrap; user-select: none; }
  .cta-inner { position: relative; z-index: 1; text-align: center; }
  .cta-inner .section-eyebrow { justify-content: center; }
  .cta-title { font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: clamp(44px,7vw,90px); line-height: 0.92; text-transform: uppercase; margin-bottom: 24px; }
  .cta-title .red { color: var(--red); }
  .cta-sub { font-size: 15px; color: var(--gray-4); margin-bottom: 44px; max-width: 480px; margin-left: auto; margin-right: auto; }
  .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  footer { background: var(--black-2); border-top: 1px solid var(--gray-1); padding: 64px 5% 32px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
  .footer-brand-name { font-family: var(--font-display); font-weight: 800; font-size: 22px; letter-spacing: 0.12em; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .footer-brand-name span { color: var(--red); }
  .footer-desc { font-size: 13px; color: var(--gray-3); line-height: 1.8; max-width: 280px; margin-bottom: 24px; }
  .social-links { display: flex; gap: 10px; }
  .social-link { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-1); color: var(--gray-3); text-decoration: none; font-size: 14px; clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%); transition: background 0.2s, color 0.2s, border-color 0.2s; }
  .social-link:hover { background: var(--red); color: var(--white); border-color: var(--red); }
  .footer-heading { font-family: var(--font-display); font-weight: 700; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--white); margin-bottom: 20px; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-links a { font-size: 13px; color: var(--gray-3); text-decoration: none; transition: color 0.2s; display: inline-flex; align-items: center; gap: 8px; }
  .footer-links a:hover { color: var(--red); }
  .footer-contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
  .footer-contact-item i { color: var(--red); margin-top: 2px; font-size: 13px; flex-shrink: 0; }
  .footer-contact-item span { font-size: 13px; color: var(--gray-3); line-height: 1.6; }
  .footer-bottom { border-top: 1px solid var(--gray-1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-bottom p { font-size: 12px; color: var(--gray-2); }
  .footer-bottom a { font-size: 12px; color: var(--gray-2); text-decoration: none; transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--red); }
  #publicModalGallery { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 200; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); }
  #publicModalGallery.open { display: flex; }
  .modal-box { background: var(--black-3); border: 1px solid var(--gray-1); width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--gray-1); flex-shrink: 0; }
  .modal-header-title { font-family: var(--font-display); font-weight: 800; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; }
  .modal-header-sub { font-size: 12px; color: var(--red); margin-top: 2px; letter-spacing: 0.1em; }
  .modal-close { width: 36px; height: 36px; border: 1px solid var(--gray-2); background: transparent; color: var(--gray-3); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; clip-path: polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%); transition: background 0.2s, color 0.2s; }
  .modal-close:hover { background: var(--red); color: var(--white); border-color: var(--red); }
  .modal-body { overflow-y: auto; padding: 20px; }
  #publicGalleryGrid { display: grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 2px; }
  .gallery-photo { background: var(--black-4); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; padding: 12px; cursor: pointer; overflow: hidden; position: relative; }
  .gallery-photo::after { content: '\\f00e'; font-family: 'Font Awesome 6 Free'; font-weight: 900; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; background: rgba(197,22,29,0.75); opacity: 0; transition: opacity 0.25s; }
  .gallery-photo:hover::after { opacity: 1; }
  .gallery-photo img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s; }
  .gallery-photo:hover img { transform: scale(1.05); }
  .hamburger { display: none; background: none; border: none; color: var(--white); font-size: 22px; cursor: pointer; padding: 4px; }
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  @media (max-width: 768px) {
    .hamburger { display: block; }
    .nav-links { display: none; }
    .hero-title { font-size: clamp(52px,14vw,80px); }
    .stats-inner { gap: 20px; }
    .stat-item + .stat-item { padding-left: 20px; }
    .stat-num { font-size: 36px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; text-align: center; }
  }
`