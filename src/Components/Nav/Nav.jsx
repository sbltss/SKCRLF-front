import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { getAccessToken } from "../../lib/tokenStorage";

function Nav() {
  const { isAuthenticated, logout } = useAuth() || { isAuthenticated: false, logout: () => {} }
  const authed = isAuthenticated || !!getAccessToken()

  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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

  // Remove item from cart
  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    
    setCartCount(updated.length);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculate total cart price
  const totalPrice = cartItems
    .reduce((sum, item) => sum + parseFloat(item.price), 0)
    .toFixed(2);

  return (
    <>
      {/* Header Navigation */}
      <div
        className="px-5 bg-light"
        aria-hidden={!authed}
        style={{ opacity: authed ? 1 : 0, transition: "opacity 200ms ease" }}
      >
        <nav
          className="navbar navbar-light justify-content-between px-5 w-100"
          style={{ pointerEvents: authed ? "auto" : "none" }}
        >

          {/* Logo */}
          <a href="#" className="navbar-brand fs-1 fw-bold" style={{ color: 'red' }}>
            SKCRLF
          </a>

          {/* Search Bar */}
          <div className="product-search flex-grow-1 d-flex justify-content-center">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              style={{ maxWidth: "500px" }}
              disabled={!authed}
              onChange={(e) => {

                const event = new CustomEvent("searchQueryChanged", {
                  detail: e.target.value,
                });
                window.dispatchEvent(event);
              }}
            />
          </div>



        

          {/* Cart Icon */}
          <div
            className="cart-icon position-relative"
            style={{ cursor: "pointer" }}
            onClick={() => setIsCartOpen(true)}
          >
            <i className="bi bi-bag fs-4"></i>

            {/* Cart Count */}
            <span className="cart-count">{cartCount}</span>
          </div>

          <button
            className="btn btn-danger ms-3 px-3 py-2"
            style={{ transition: "opacity 200ms ease" }}
            aria-label="Logout"
            tabIndex={0}
            disabled={!authed}
            onClick={() => logout()}
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Sidebar Cart */}
      <div
        className={`cart-sidebar ${isCartOpen ? "open" : ""}`}
        aria-hidden={!authed}
        style={{ pointerEvents: authed ? "auto" : "none" }}
      >

        {/* Cart Header */}
        <div className="cart-header d-flex justify-content-between align-items-center p-3">
          <h5 className="m-0">Your Cart</h5>

          {/* Close Button */}
          <button
            className="btn btn-sm btn-outline-dark bg-dark text-white"
            onClick={() => setIsCartOpen(false)}
          >
            Close
          </button>
        </div>

        {/* Cart Body */}
        <div className="cart-body p-3">
          {cartItems.length === 0 ? (

            // Empty Cart Message
            <p className="alert alert-danger">Your Cart Is Empty</p>

          ) : (

            // Cart Items List
            cartItems.map((item) => (
              <div key={item.id} className="d-flex mb-3 align-items-center">

                {/* Item Image */}
                <img
                  src={item.image}
                  width={60}
                  height={60}
                  className="me-3 rounded"
                  alt=""
                />

                {/* Item Details */}
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.Productname}</h6>
                  <p className="mb-1">${item.price}</p>
                </div>

                {/* Remove Button */}
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

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer p-3 border-top">
            <h6>Total : ${totalPrice}</h6>

            {/* Checkout Button */}
            <button className="btn btn-dark w-100 mt-2">Checkout</button>
          </div>
        )}

      </div>
    </>
  );
}

export default Nav;
