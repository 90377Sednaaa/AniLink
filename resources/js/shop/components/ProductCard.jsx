import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { peso } from './format'
import { Icon } from '../../shared/ui'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const isAvailable = product.status === 'available' && product.available_quantity > 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAvailable) return
    add(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-2xl overflow-hidden flex flex-col hover:border-[#2E5339]/40 hover:shadow-[0_8px_24px_rgba(46,83,57,0.08)] transition group">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-[#F4F1EA] overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#5C5C5C]/60 gap-1">
            <Icon name="sprout" className="w-8 h-8 text-[#4A7C59]/50" />
            <span className="text-[11px] font-medium tracking-wide uppercase">Fresh Harvest</span>
          </div>
        )}

        {/* Stock / Sold out status overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-white/95 text-[#B0413E] text-xs font-bold shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/products/${product.id}`}
              className="font-semibold text-sm sm:text-base leading-snug text-[#1A1A1A] hover:text-[#2E5339] transition line-clamp-1"
            >
              {product.name}
            </Link>
            {product.farmer?.verified && (
              <span className="shrink-0 text-[11px] font-semibold text-[#2E5339]" title="Verified local farm">
                ✓
              </span>
            )}
          </div>

          <div className="text-xs text-[#5C5C5C] mt-1 truncate">
            {product.farmer?.farm_name || product.farmer?.name || 'Local Farm'} · {product.farmer?.municipality || 'PH'}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E8E2D6]/70 flex items-end justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-bold text-[#2E5339] leading-tight">
              {peso(product.price_per_unit)}
              <span className="text-xs font-normal text-[#8A8A8A]">/{product.unit_type}</span>
            </div>
            <div className="text-[10px] text-[#8A8A8A] mt-0.5">
              {isAvailable ? `${product.available_quantity} ${product.unit_type} left` : 'Out of stock'}
            </div>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAdd}
            className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
              added
                ? 'bg-[#4A7C59] text-white'
                : isAvailable
                ? 'bg-[#2E5339] text-white hover:bg-[#24412D]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {added ? (
              <>
                <span>✓</span>
                <span>Added</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
