import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { peso } from './format'

export default function ProductCard({ product }) {
  const { add } = useCart()

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-[16px] overflow-hidden flex flex-col hover:shadow-[0_6px_20px_rgba(46,83,57,0.12)] transition">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-[#F0EDE6]">
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="font-semibold leading-tight hover:text-[#2E5339]">{product.name}</Link>
          {product.farmer?.verified && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-[#E8F0E9] border border-[#C5D9C7] text-[#2E5339]">✓ Verified</span>
          )}
        </div>

        <div className="text-xs text-[#5C5C5C]">{product.farmer?.farm_name || product.farmer?.name || '—'} · {product.farmer?.municipality || 'PH'}</div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <div className="text-lg font-bold text-[#2E5339]">{peso(product.price_per_unit)}<span className="text-xs font-normal text-[#8A8A8A]">/{product.unit_type}</span></div>
            <div className="text-[11px] text-[#8A8A8A]">{product.available_quantity > 0 ? `${product.available_quantity} ${product.unit_type} available` : 'Sold out'}</div>
          </div>
          <button
            disabled={product.status !== 'available' || product.available_quantity <= 0}
            onClick={() => add(product, 1)}
            className="shrink-0 text-xs font-semibold px-3 py-2 rounded-[10px] bg-[#D4A017] text-[#1A1A1A] hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  )
}
