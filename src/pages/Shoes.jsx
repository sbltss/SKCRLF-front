// Shoes page: displays items from API with local fallbacks and client-side filters
// Enhanced with GSAP animations: entry, hover, responsive, and reduced-motion support
import React, { useEffect, useMemo, useState, useRef } from 'react';
import './Shoes.css'
import productData from './Products.json'
import { useShoes } from '../services/shoes'
import { mapShoeImages } from '../services/imageMap'
import { img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12 } from '../assets'
import { gsap } from 'gsap'

// Main Shoes component
const Shoes = () => {
  // Search query coming from global nav input
  const [searchQuery, setSearchQuery] = useState('');
  // Category selection from sidebar menu
  const [category, setCategory] = useState('All Products');
  // Shoes API data via React Query hook
  const { data: apiShoes, isLoading, error } = useShoes(true)
  // Local state for normalized API items with mapped images
  const [apiItems, setApiItems] = useState(null)
  useEffect(() => {
    let active = true
    async function run() {
      if (apiShoes && apiShoes.length) {
        try {
          // Resolve image paths based on shoe_id when available
          const mapped = await mapShoeImages(apiShoes)
          if (active) setApiItems(mapped)
        } catch {
          if (active) setApiItems(apiShoes)
        }
      } else {
        setApiItems(null)
      }
    }
    run()
    return () => { active = false }
  }, [apiShoes])  
  
  // Static asset images fallback mapping by id
  const image = [
    {id: 2, image: img2}, 
    {id: 3, image: img3}, 
    {id: 4, image: img4}, 
    {id: 5, image: img5}, 
    {id: 6, image: img6}, 
    {id: 7, image: img7}, 
    {id: 8, image: img8}, 
    {id: 9, image: img9}, 
    {id: 10, image: img10}, 
    {id: 11, image: img11}, 
    {id: 12, image: img12}
  ]

  // Normalize API items to UI model, otherwise fallback to local product data
  const items = apiItems && apiItems.length ? apiItems.map(s => ({ 
    id: s.shoes_id, 
    shoes_id: s.shoes_id,
    brand: s.brand,
    category: s.category,
    color: s.color,
    description: s.description,
    rating: s.rating,
    quantity: s.quantity,
    size: s.size, 
    product_name: s.name || s.product_name, 
    price: String(s.price), 
    tag: s.tag
  })) : productData
  // Compute min/max price for range filter
  const maxPrice = useMemo(() => Math.max(...items.map(p => parseFloat(p.price || 0))), [items]);
  const minPrice = useMemo(() => Math.min(...items.map(p => parseFloat(p.price || 0))), [items]);
  // Selected price limit from range input
  const [priceLimit, setPriceLimit] = useState(0);
  useEffect(() => { setPriceLimit(maxPrice) }, [maxPrice])
  // Format price into local ₱ display
  const formatPrice = (n) => `₱ ${Math.round(n).toLocaleString()}`
  // Ref to the cards grid container (for GSAP)
  const gridRef = useRef(null)
  // Reduced motion preference
  const prefersReducedMotion = useRef(false)
  // Timeout for sustained hover modal trigger
  const hoverTimeoutRef = useRef(null)
  // Modal open flag
  const [modalOpen, setModalOpen] = useState(false)
  // Modal product data
  const [modalProduct, setModalProduct] = useState(null)
  // Modal image loading state
  const [modalLoading, setModalLoading] = useState(false)
  // Modal elements refs
  const modalBackdropRef = useRef(null)
  const modalPanelRef = useRef(null)
  // Hover delay for modal trigger (ms)
  const [hoverDelayMs] = useState(2000)
  // Preserve scroll position when opening modal
  const scrollPosRef = useRef(0)
  // Filter container ref & floating state
  const filterRef = useRef(null)
  const [isFilterFloating, setIsFilterFloating] = useState(false)
  const filterOriginY = useRef(0)
  const [filterH, setFilterH] = useState(0)
  // Sidebar floating machinery
  const sidebarRef = useRef(null)
  const [isSidebarFloating, setIsSidebarFloating] = useState(false)
  const sidebarOriginY = useRef(0)
  const [sidebarH, setSidebarH] = useState(0)
  // Track current sidebar floating animation state
  const sidebarFloatingRef = useRef(false)

  // Detect reduced motion preference and respond to changes
  // Listen for global searchQueryChanged events from nav input
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => { prefersReducedMotion.current = !!mql.matches }
    handler()
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])

  // Measure initial filter position & height for floating calculations
  useEffect(() => {
    const handleSearchQuery = (e) => {
      setSearchQuery(String(e.detail || '').toLowerCase());
    };
    window.addEventListener('searchQueryChanged', handleSearchQuery);
    return () => window.removeEventListener('searchQueryChanged', handleSearchQuery);
  }, []);

  // Measure initial sidebar position & height for floating calculations
  useEffect(() => {
    const el = filterRef.current
    const sidebar = document.querySelector('.shoes-sidebar')
    if (!el || !sidebar) return
    const measure = () => {
      filterOriginY.current = el.getBoundingClientRect().top + window.scrollY
      setFilterH(el.offsetHeight || 0)
    }
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Floating filter behavior: pin filter within viewport under header, clamped to sidebar
  useEffect(() => {
    const el = sidebarRef.current
    const sidebar = document.querySelector('.shoes-sidebar')
    if (!el || !sidebar) return
    const measure = () => {
      sidebarOriginY.current = el.getBoundingClientRect().top + window.scrollY
      setSidebarH(el.offsetHeight || 0)
    }
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Floating sidebar behavior: pin entire sidebar under header, disabled on mobile
  useEffect(() => {
    const el = filterRef.current
    const sidebar = document.querySelector('.shoes-sidebar')
    if (!el || !sidebar) return
    let ticking = false
    const getHeaderTop = () => {
      const root = document.documentElement
      const shrunk = document.body.classList.contains('nav-is-shrunk')
      const varName = '--nav-height-' + (shrunk ? 'shrunk' : 'expanded')
      const v = getComputedStyle(root).getPropertyValue(varName) || '80px'
      const n = parseFloat(v)
      return Number.isNaN(n) ? 80 : n
    }
    const update = () => {
      const topOffset = getHeaderTop() + 16
      const origin = filterOriginY.current
      const sRect = sidebar.getBoundingClientRect()
      const sLeft = sRect.left + window.scrollX
      const sWidth = sRect.width
      const sBottomY = sRect.bottom + window.scrollY
      const floating = window.scrollY + topOffset >= origin
      if (floating) {
        setIsFilterFloating(true)
        el.classList.add('filter-floating')
        el.style.position = 'fixed'
        el.style.top = `${topOffset}px`
        el.style.left = `${sLeft}px`
        el.style.width = `${sWidth}px`
        // clamp so filter doesn't overflow sidebar bottom
        const h = el.offsetHeight || filterH
        const maxTop = sBottomY - h - window.scrollY - 16
        if (maxTop < topOffset) el.style.top = `${Math.max(0, maxTop)}px`
      } else {
        setIsFilterFloating(false)
        el.classList.remove('filter-floating')
        el.style.position = ''
        el.style.top = ''
        el.style.left = ''
        el.style.width = ''
      }
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { update(); ticking = false })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [filterH])

  // Attach hover/focus/touch feedback on sidebar for micro-interactions
  useEffect(() => {
    const el = sidebarRef.current
    const layout = document.querySelector('.shoes-layout')
    if (!el || !layout) return
    let ticking = false
    const getHeaderTop = () => {
      const root = document.documentElement
      const shrunk = document.body.classList.contains('nav-is-shrunk')
      const varName = '--nav-height-' + (shrunk ? 'shrunk' : 'expanded')
      const v = getComputedStyle(root).getPropertyValue(varName) || '80px'
      const n = parseFloat(v)
      return Number.isNaN(n) ? 80 : n
    }
    const update = () => {
      const topOffset = getHeaderTop() + 16
      const origin = sidebarOriginY.current
      const lRect = layout.getBoundingClientRect()
      const lLeft = lRect.left + window.scrollX
      const sWidth = el.getBoundingClientRect().width
      const lBottomY = lRect.bottom + window.scrollY
      const floating = window.scrollY + topOffset >= origin
      const isMobile = window.matchMedia('(max-width: 991px)').matches
      if (floating && !isMobile) {
        setIsSidebarFloating(true)
        el.classList.add('sidebar-floating')
        el.style.position = 'fixed'
        el.style.top = `${topOffset}px`
        el.style.left = `${lLeft}px`
        el.style.width = `${sWidth}px`
        const h = el.offsetHeight || sidebarH
        const maxTop = lBottomY - h - window.scrollY - 16
        if (maxTop < topOffset) el.style.top = `${Math.max(0, maxTop)}px`
        if (!sidebarFloatingRef.current) {
          sidebarFloatingRef.current = true
          gsap.fromTo(el, { opacity: 0.95, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
        }
      } else {
        setIsSidebarFloating(false)
        el.classList.remove('sidebar-floating')
        el.style.position = ''
        el.style.top = ''
        el.style.left = ''
        el.style.width = ''
        if (sidebarFloatingRef.current) {
          sidebarFloatingRef.current = false
          gsap.to(el, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
        }
      }
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { update(); ticking = false })
    }
    const onResize = () => update()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [sidebarH])

  useEffect(() => {
    const el = sidebarRef.current
    if (!el) return
    const onEnter = () => el.classList.add('sidebar-hover')
    const onLeave = () => el.classList.remove('sidebar-hover')
    const onFocus = () => el.classList.add('sidebar-hover')
    const onBlur = () => el.classList.remove('sidebar-hover')
    const onTouchStart = () => el.classList.add('sidebar-hover')
    const onTouchEnd = () => el.classList.remove('sidebar-hover')
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('focus', onFocus, true)
    el.addEventListener('blur', onBlur, true)
    el.addEventListener('touchstart', onTouchStart)
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('focus', onFocus, true)
      el.removeEventListener('blur', onBlur, true)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // Add selected product to cart and broadcast update
  const addToCart = (product) => {
    const existing = JSON.parse(localStorage.getItem('cart')) || [];
    const alreadyCart = existing.find(p => p.id === product.id);
    if (!alreadyCart) {
      const updatedProduct = { ...product, quantity: 1 };
      const updatedCart = [...existing, updatedProduct];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Category filter supports fallback mapping when API lacks category
  const appliesCategory = (p) => {
    const sel = String(category || '').toLowerCase()
    if (sel === 'all products') return true
    const cat = String(p.category || '').toLowerCase()
    if (cat) return cat === sel
    // fallback mapping based on tag when category missing
    const inferred = p.tag === 'New' ? 'basketball shoes' : p.tag === 'Sale' ? 'running shoes' : 'lifestyle shoes'
    return inferred === sel
  };

  // Final filtered list based on category, price range and search
  const displayed = useMemo(() => {
    return items
      .filter(p => appliesCategory(p))
      .filter(p => parseFloat(p.price) <= priceLimit)
      .filter(p => searchQuery ? p.product_name.toLowerCase().includes(searchQuery) : true);
  }, [items, searchQuery, category, priceLimit]);

  // Pagination: 10 items per page with controls
  const pageSize = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(displayed.length / pageSize))
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return displayed.slice(start, start + pageSize)
  }, [displayed, page])
  useEffect(() => { setPage(1) }, [searchQuery, category, priceLimit])
  const goTo = (n) => setPage(Math.min(totalPages, Math.max(1, n)))

  console.log(displayed)

  // Smooth list-entry animation for cards (skips when reduced motion is enabled)
  // Smooth list-entry animation for cards (skips when reduced motion is enabled)
  useEffect(() => {
    if (prefersReducedMotion.current) return
    const ctx = gsap.context(() => {
      gsap.killTweensOf('.card')
      gsap.fromTo(
        '.card',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out' }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [displayed])

  // Subtle hover lift on cards with responsive easing; disabled for reduced motion
  // Subtle hover lift on cards with responsive easing; disabled for reduced motion
  useEffect(() => {
    const root = gridRef.current
    if (!root) return
    const cards = root.querySelectorAll('.card')
    const enter = (e) => {
      if (prefersReducedMotion.current) return
      gsap.to(e.currentTarget, { y: -4, duration: 0.2, ease: 'power2.out' })
    }
    const leave = (e) => {
      if (prefersReducedMotion.current) return
      gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: 'power2.out' })
    }
    cards.forEach((el) => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave) })
    return () => { cards.forEach((el) => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave) }) }
  }, [displayed])

  // Scroll-based visibility: fade cards in when entering viewport and fade out on exit
  // Scroll-based visibility: fade cards in when entering viewport and fade out on exit
  useEffect(() => {
    if (prefersReducedMotion.current) return
    const root = gridRef.current
    if (!root) return
    const cards = Array.from(root.querySelectorAll('.card'))
    const inView = (el) => {
      const rect = el.getBoundingClientRect()
      return rect.bottom >= 0 && rect.right >= 0 && rect.top <= window.innerHeight && rect.left <= window.innerWidth
    }
    cards.forEach((el) => {
      const visible = inView(el)
      gsap.set(el, { opacity: visible ? 1 : 0 })
    })
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target
        gsap.killTweensOf(el)
        if (entry.isIntersecting) {
          gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
        } else {
          gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power2.out' })
        }
      })
    }, { root: null, threshold: 0 })
    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [displayed])

  // Initial component load animation for layout elements with responsive values
  // Initial component load animation for layout elements with responsive values
  useEffect(() => {
    if (prefersReducedMotion.current) return
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 992px)', () => {
        gsap.from('.shoes-sidebar', { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out' })
        gsap.from('.grid', { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out', delay: 0.1 })
      })
      mm.add('(max-width: 991px)', () => {
        gsap.from('.shoes-sidebar', { opacity: 0, y: 8, duration: 0.4, ease: 'power2.out' })
        gsap.from('.grid', { opacity: 0, y: 8, duration: 0.4, ease: 'power2.out', delay: 0.1 })
      })
    })
    return () => { ctx.revert(); mm.revert() }
  }, [])

  // Hover-to-zoom with sustained hover opening modal
  // Hover-to-zoom with sustained hover opening modal
  const handleHoverEnter = (product, e) => {
    const img = e.currentTarget.querySelector('img')
    if (img && !prefersReducedMotion.current) gsap.to(img, { scale: 1.2, duration: 0.3, ease: 'power2.out' })
    clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      // Preload image and open modal
      setModalLoading(true)
      const hi = new Image()
      hi.src = img?.src || ''
      hi.onload = () => { setModalLoading(false) }
      openModal(product)
    }, hoverDelayMs)
  }

  // Restore image scale and cancel hover timeout
  const handleHoverLeave = (e) => {
    clearTimeout(hoverTimeoutRef.current)
    const img = e.currentTarget.querySelector('img')
    if (img && !prefersReducedMotion.current) gsap.to(img, { scale: 1, duration: 0.25, ease: 'power2.out' })
  }

  // Simple focus trap inside modal; ESC closes
  const trapFocus = (e) => {
    if (!modalOpen) return
    const panel = modalPanelRef.current
    if (!panel) return
    if (e.key === 'Escape') { closeModal(); return }
    if (e.key !== 'Tab') return
    const focusables = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  // Open modal and animate backdrop/panel, preserve scroll
  const openModal = (product) => {
    setModalProduct(product)
    setModalOpen(true)
    scrollPosRef.current = window.scrollY || 0
    document.body.style.top = `-${scrollPosRef.current}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    // Animate backdrop and panel
    if (!prefersReducedMotion.current) {
      gsap.set(modalBackdropRef.current, { opacity: 0 })
      gsap.set(modalPanelRef.current, { opacity: 0, y: 24, boxShadow: '0 0 0 rgba(0,0,0,0)' })
      gsap.to(modalBackdropRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(modalPanelRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      gsap.to(modalPanelRef.current, { boxShadow: '0 20px 60px rgba(0,0,0,0.15)', duration: 0.4, ease: 'power2.out' })
    }
    // Parallax on mouse move in panel
    const panel = modalPanelRef.current
    if (panel) {
      const onMove = (ev) => {
        if (prefersReducedMotion.current) return
        const rect = panel.getBoundingClientRect()
        const rx = (ev.clientX - rect.left) / rect.width - 0.5
        const ry = (ev.clientY - rect.top) / rect.height - 0.5
        const img = panel.querySelector('.modal-image')
        if (img) gsap.to(img, { x: rx * 8, y: ry * 8, duration: 0.2, ease: 'power2.out' })
      }
      panel.addEventListener('mousemove', onMove)
      panel.__onMove = onMove
    }
    window.addEventListener('keydown', trapFocus)
    // Focus close button
    setTimeout(() => { modalPanelRef.current?.querySelector('.modal-close')?.focus() }, 50)
  }

  // Close modal and restore scroll/body styles
  const closeModal = () => {
    const restore = () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollPosRef.current || 0)
    }
    if (!prefersReducedMotion.current) {
      gsap.to(modalBackdropRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' })
      gsap.to(modalPanelRef.current, { opacity: 0, y: 16, duration: 0.25, ease: 'power2.out', onComplete: () => { setModalOpen(false); setModalProduct(null); restore() } })
    } else {
      setModalOpen(false); setModalProduct(null); restore()
    }
    const panel = modalPanelRef.current
    if (panel && panel.__onMove) { panel.removeEventListener('mousemove', panel.__onMove); delete panel.__onMove }
    window.removeEventListener('keydown', trapFocus)
  }

  // Cleanup global listeners on unmount
  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current)
      window.removeEventListener('keydown', trapFocus)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [])

  return (
    <div className="shoes-layout">
      <aside className="shoes-sidebar" ref={sidebarRef} role="complementary" aria-label="Filters sidebar" tabIndex={-1}>
        <nav>
          <ul className="menu">
            {['All Products','Basketball Shoes','Running Shoes','Lifestyle Shoes'].map(item => (
              <li key={item}>
                <button
                  className={`menu-item ${category === item ? 'active' : ''}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <div className="filter-title">Filtering</div>
          <div className="filter-range" role="group" aria-label="Price range filter">
            <label htmlFor="priceRange" className="filter-label">Price Range</label>
            <input
              id="priceRange"
              type="range"
              min={String(minPrice)}
              max={String(maxPrice)}
              value={priceLimit}
              onChange={(e) => setPriceLimit(parseFloat(e.target.value))}
              aria-label="Price range"
            />
            <div className="price-scale">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
            <div className="price-current">Up to {formatPrice(priceLimit)}</div>
          </div>
        </div>
        {isFilterFloating && <div className="filter-placeholder" aria-hidden="true" style={{ height: `${filterH}px` }} />}
      </aside>
      {isSidebarFloating && <div className="sidebar-placeholder" aria-hidden="true" style={{ height: `${sidebarH}px` }} />}
      <main className="shoes-content">
        {isLoading && <div className="empty">Loading shoes…</div>}
        {error && !isLoading && <div className="empty">Failed to load shoes</div>}
        <div className="grid" ref={gridRef}>
          {paged.map(product => (
            <div key={product.id} className="card">
              <div className="card-image" onMouseEnter={(e) => handleHoverEnter(product, e)} onMouseLeave={handleHoverLeave}>
                <img src={image?.find(p => p.id === product.id)?.image} alt={product.product_name} />
                <button className="add-btn" aria-label="Add to cart" onClick={() => addToCart(product)}>+</button>
              </div>
              <div className="card-body">
                <h6 className="card-title">{product.product_name}</h6>
                <p className="card-price">₱ {product.price}</p>
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <div className="empty">No shoes found</div>
          )}
        </div>
        {displayed.length > 0 && (
          <div className="pagination" aria-label="Shoes pagination">
            <button className="page-btn" onClick={() => goTo(page - 1)} disabled={page === 1} aria-label="Previous page">Prev</button>
            <div className="page-list" role="group" aria-label="Pages">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`page-num ${page === i + 1 ? 'active' : ''}`} onClick={() => goTo(i + 1)} aria-current={page === i + 1 ? 'page' : undefined}>{i + 1}</button>
              ))}
            </div>
            <button className="page-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages} aria-label="Next page">Next</button>
          </div>
        )}
      </main>
      {modalOpen && (
        <>
          <div className="modal-backdrop" ref={modalBackdropRef} onClick={closeModal} />
          <div className="modal-panel" ref={modalPanelRef} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${modalProduct?.id}`}>
            <div className="modal-header">
              <h5 id={`modal-title-${modalProduct?.id}`}>{modalProduct?.product_name}</h5>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <div className="modal-content-scroll">
              <div className="modal-grid">
                <div className="modal-image">
                  {modalLoading ? (
                    <div className="modal-loading">Loading…</div>
                  ) : (
                    <img src={image?.find(p => p.id === modalProduct?.id)?.image} alt={modalProduct?.product_name} />
                  )}
                </div>
                <div className="modal-body">
                  <div className="modal-meta">
                    <div><strong>Price:</strong> ₱ {modalProduct?.price}</div>
                    <div><strong>Size:</strong> {modalProduct?.size || 'N/A'}</div>
                    <div><strong>Color:</strong> {modalProduct?.color || 'N/A'}</div>
                    <div><strong>Category:</strong> {modalProduct?.category || 'N/A'}</div>
                    <div><strong>Description:</strong> {modalProduct?.description || 'N/A'}</div>
                  </div>
                  <div className="modal-variants">
                    <strong>Available Sizes:</strong> {Array.isArray(modalProduct?.available_sizes) ? modalProduct.available_sizes.join(', ') : (modalProduct?.size || 'N/A')}
                  </div>
                  <div className="modal-reviews">
                    <strong>Customer Reviews</strong>
                    <p>No reviews yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Shoes;
