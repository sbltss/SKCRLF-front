import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { getAccessToken } from "../../lib/tokenStorage";

function Nav() {
  const { isAuthenticated, logout } = useAuth() || { isAuthenticated: false, logout: () => {} }
  const authed = isAuthenticated || !!getAccessToken()

  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [shrunk, setShrunk] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef(null)
  const sentinelRef = useRef(null)
  const lastScrollY = useRef(window.scrollY || 0)
  const ticking = useRef(false)

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
      setCartItems(cart);
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);

    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  useEffect(() => {
    document.body.classList.add('with-fixed-nav')
    return () => { document.body.classList.remove('with-fixed-nav') }
  }, [])

  useEffect(() => {
    // Dynamically adjust reserved space when nav shrinks/expands
    const top = getComputedStyle(document.documentElement).getPropertyValue('--nav-height-' + (shrunk ? 'shrunk' : 'expanded')) || '80px'
    document.body.style.paddingTop = top
    if (shrunk) document.body.classList.add('nav-is-shrunk')
    else document.body.classList.remove('nav-is-shrunk')
  }, [shrunk])

  useEffect(() => {
    const s = sentinelRef.current
    if (!s) return
    const io = new IntersectionObserver((entries) => {
      const e = entries[0]
      setScrolled(!e.isIntersecting)
    }, { root: null, threshold: 0 })
    io.observe(s)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY || 0
        if (y > lastScrollY.current + 8) setShrunk(true)
        else if (y < lastScrollY.current - 8) setShrunk(false)
        lastScrollY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    
    setCartCount(updated.length);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const totalPrice = cartItems
    .reduce((sum, item) => sum + parseFloat(item.price), 0)
    .toFixed(2);

  return (
    <>
      <div
        ref={headerRef}
        className={`nav-shell ${scrolled ? 'is-scrolled' : ''} ${shrunk ? 'is-shrunk' : ''}`}
        aria-hidden={!authed}
        style={{ opacity: authed ? 1 : 0, pointerEvents: authed ? 'auto' : 'none' }}
      >
        <div className="nav-inner">
          <a href="#" className="nav-brand">SKCRLF</a>
          <button className="nav-burger" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
            <span />
          </button>
          <div className="nav-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              disabled={!authed}
              onChange={(e) => {
                const event = new CustomEvent("searchQueryChanged", { detail: e.target.value });
                window.dispatchEvent(event);
              }}
            />
          </div>
          <div className="nav-actions">
            <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
              <i className="bi bi-bag"></i>
              <span className="cart-count">{cartCount}</span>
            </div>
            <button
              className="nav-logout"
              aria-label="Logout"
              tabIndex={0}
              disabled={!authed}
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="nav-mobile" role="dialog" aria-modal="true">
            <div className="nav-mobile-content">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                disabled={!authed}
                onChange={(e) => {
                  const event = new CustomEvent("searchQueryChanged", { detail: e.target.value });
                  window.dispatchEvent(event);
                }}
              />
              <div className="nav-mobile-actions">
                <button className="nav-logout" disabled={!authed} onClick={() => logout()}>Logout</button>
                <button className="nav-close" onClick={() => setMobileOpen(false)} aria-label="Close">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="nav-sentinel" ref={sentinelRef} />

      <div
        className={`cart-sidebar ${isCartOpen ? "open" : ""}`}
        aria-hidden={!authed}
        style={{ pointerEvents: authed ? "auto" : "none" }}
      >

        <div className="cart-header d-flex justify-content-between align-items-center p-3">
          <h5 className="m-0">Your Cart</h5>

          <button
            className="btn btn-sm btn-outline-dark bg-dark text-white"
            onClick={() => setIsCartOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="cart-body p-3">
          {cartItems.length === 0 ? (
            <p className="alert alert-danger">Your Cart Is Empty</p>

          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="d-flex mb-3 align-items-center">
                <img
                  src={item.image}
                  width={60}
                  height={60}
                  className="me-3 rounded"
                  alt=""
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.Productname}</h6>
                  <p className="mb-1">${item.price}</p>
                </div>
                <button
                  className="btn btn-sm bg-dark text-white"
                  onClick={() => removeItem(item.id)}
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer p-3 border-top">
            <h6>Total : ${totalPrice}</h6>

            <button className="btn btn-dark w-100 mt-2">Checkout</button>
          </div>
        )}

      </div>
    </>
  );
}

export default Nav;
