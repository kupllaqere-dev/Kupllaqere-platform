'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    try {
      const cart = localStorage.getItem('fv_cart');
      const history = localStorage.getItem('fv_purchase_history');
      if (cart) setCartItems(JSON.parse(cart));
      if (history) setPurchaseHistory(JSON.parse(history));
    } catch { /* silent */ }
  }, []);

  function addToCart(item) {
    const existing = cartItems.find(i => i.id === item.id);
    const next = existing
      ? cartItems.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cartItems, { id: item.id, name: item.name, qty: 1 }];
    setCartItems(next);
    try { localStorage.setItem('fv_cart', JSON.stringify(next)); } catch { /* silent */ }
  }

  function removeFromCart(id) {
    const next = cartItems.filter(i => i.id !== id);
    setCartItems(next);
    try { localStorage.setItem('fv_cart', JSON.stringify(next)); } catch { /* silent */ }
  }

  function checkout() {
    if (cartItems.length === 0) return false;
    const purchase = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cartItems.map(i => ({ ...i })),
    };
    const newHistory = [purchase, ...purchaseHistory];
    setPurchaseHistory(newHistory);
    setCartItems([]);
    try {
      localStorage.setItem('fv_cart', JSON.stringify([]));
      localStorage.setItem('fv_purchase_history', JSON.stringify(newHistory));
    } catch { /* silent */ }
    return true;
  }

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, purchaseHistory, totalItems, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
