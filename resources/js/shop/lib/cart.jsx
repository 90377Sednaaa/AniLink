import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)
const STORAGE_KEY = 'anilink_shop_cart'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const add = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i => (i.product_id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price_per_unit,
        unit_type: product.unit_type,
        image: product.image,
        qty,
      }]
    })
  }

  const setQty = (productId, qty) => {
    setItems(prev => (qty <= 0
      ? prev.filter(i => i.product_id !== productId)
      : prev.map(i => (i.product_id === productId ? { ...i, qty } : i))))
  }

  const remove = (productId) => setItems(prev => prev.filter(i => i.product_id !== productId))
  const clear = () => setItems([])

  const value = useMemo(() => ({
    items, add, setQty, remove, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
  }), [items])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => useContext(Ctx)
