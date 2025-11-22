import React, { useEffect, useMemo, useState } from 'react';
import './Shoes.css'
import productData from './Products.json'
import { useShoes } from '../services/shoes'
import { mapShoeImages } from '../services/imageMap'
import img2 from '../assets/2.png'

const Shoes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Products');
  const { data: apiShoes, isLoading, error } = useShoes(true)
  const [apiItems, setApiItems] = useState(null)
  useEffect(() => {
    let active = true
    async function run() {
      if (apiShoes && apiShoes.length) {
        try {
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
  const items = apiItems && apiItems.length ? apiItems.map(s => ({ 
    id: s.id, 
    shoes_id: s.shoes_id,
    brand: s.brand,
    category: s.category,
    color: s.color,
    description: s.description,
    rating: s.rating,
    quantity: s.quantity,
    size: s.size,
    image: s.imagePath || s.image, 
    product_name: s.name || s.product_name, 
    price: String(s.price), 
    tag: s.tag
  })) : productData
  const maxPrice = useMemo(() => Math.max(...items.map(p => parseFloat(p.price || 0))), [items]);
  const minPrice = useMemo(() => Math.min(...items.map(p => parseFloat(p.price || 0))), [items]);
  const [priceLimit, setPriceLimit] = useState(0);
  useEffect(() => { setPriceLimit(maxPrice) }, [maxPrice])
  const formatPrice = (n) => `₱ ${Math.round(n).toLocaleString()}`

  useEffect(() => {
    const handleSearchQuery = (e) => {
      setSearchQuery(String(e.detail || '').toLowerCase());
    };
    window.addEventListener('searchQueryChanged', handleSearchQuery);
    return () => window.removeEventListener('searchQueryChanged', handleSearchQuery);
  }, []);

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

  const appliesCategory = (p) => {
    const sel = String(category || '').toLowerCase()
    if (sel === 'all products') return true
    const cat = String(p.category || '').toLowerCase()
    if (cat) return cat === sel
    // fallback mapping based on tag when category missing
    const inferred = p.tag === 'New' ? 'basketball shoes' : p.tag === 'Sale' ? 'running shoes' : 'lifestyle shoes'
    return inferred === sel
  };

  const displayed = useMemo(() => {
    return items
      .filter(p => appliesCategory(p))
      .filter(p => parseFloat(p.price) <= priceLimit)
      .filter(p => searchQuery ? p.product_name.toLowerCase().includes(searchQuery) : true);
  }, [items, searchQuery, category, priceLimit]);

  return (
    <div className="shoes-layout">
      <aside className="shoes-sidebar">
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
        <div className="filter">
          <div className="filter-title">Filtering</div>
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
      </aside>
      <main className="shoes-content">
        {isLoading && <div className="empty">Loading shoes…</div>}
        {error && !isLoading && <div className="empty">Failed to load shoes</div>}
        <div className="grid">
          {displayed.map(product => (
            <div key={product.id} className="card">
              <div className="card-image">
                <img src={img2} alt={product.product_name} />
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
      </main>
    </div>
  );
}

export default Shoes;
