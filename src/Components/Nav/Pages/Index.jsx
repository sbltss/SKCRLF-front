import React, { useEffect, useState } from 'react';
import productData from './Products.json';

function Index() {

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSortOption, setFilterSortOption] = useState('all');

  useEffect(() => {
    const handleSearchQuery = (e) => {
      setSearchQuery(e.detail.toLowerCase());
    };

    window.addEventListener('searchQueryChanged', handleSearchQuery);
    return () => window.removeEventListener('searchQueryChanged', handleSearchQuery);
  }, []);

  // Filter & Sort Product
  const handleFilterSort = () => {
    let filtered = [...productData];

    // Filtering (New, Sale)
    if (filterSortOption === 'New' || filterSortOption === 'Sale') {
      filtered = filtered.filter(product => product.tag === filterSortOption);
    }

    // Sorting by Price Low (Ascending)
    if (filterSortOption === 'low') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }

    // Sorting by Price High (Descending)
    else if (filterSortOption === 'high') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.Productname.toLowerCase().includes(searchQuery)
      );
    }

    return filtered;
  };





  const displayedProduct = handleFilterSort();

  // Add to Cart
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

  return (
    <>
      <div className="shop-container">
        <div className="container">

          {/* Page Title */}
          <h1 className="text-white py-4 fw-semibold">Products</h1>

          {/* Product Count */}
          <div className="container my-4">
            <div className="d-flex justify-content-start align-items-center gap-2">

              {/* Showing X */}
              <span className="text-muted" style={{ fontSize: "1.1rem" }}>
                Showing
              </span>

              <strong>{displayedProduct.length}</strong>
              Product{displayedProduct.length !== 1 && 's'} for "
              {filterSortOption === 'all'
                ? 'All'
                : filterSortOption.charAt(0).toUpperCase() + filterSortOption.slice(1)
              }"
            </div>

            {/* Filter Dropdown */}
            <div>
              <select
                className="form-select py-2 fs-6"
                style={{ minWidth: '260px', backgroundColor: '#f5f5f5', border: '0px' }}
                onChange={(e) => setFilterSortOption(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="New">New Products</option>
                <option value="Sale">Sale Products</option>
                <option value="low">Low Price</option>   {/* low to high */}
                <option value="high">High Price</option> {/* high to low */}
              </select>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          {displayedProduct.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-danger text-center">
                No Product found matching your search
              </div>
            </div>
          ) : (
            displayedProduct.map((product) => (
              <div className="col-lg-4 col-md-6 col-sm-12 mb-4 d-flex justify-content-center" key={product.id}>
                <div
                  className="product-item text-center position-relative"
                  style={{ maxWidth: '300px', width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}
                >
                  {/* Product Image */}
                  <div className="product-image w-100 position-relative overflow-hidden" style={{ height: '250px' }}>
                    <img
                      src={product.image}
                      className="img-fluid"
                      alt={product.Productname}
                      style={{ objectFit: 'contain', height: '100%', width: '100%' }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="product-details mt-3">
                    <h6>{product.Productname}</h6>
                    <p className="text-muted">₱{product.price}</p>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="btn btn-dark w-100" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}

export default Index;
