export const peso = (n) =>
  `₱${Number(n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const statusColor = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'pending') return 'bg-[#FFF4D6] border-[#F2D98A] text-[#8A6A0A]'
  if (s === 'confirmed' || s === 'preparing') return 'bg-[#E8F0E9] border-[#C5D9C7] text-[#4A7C59]'
  if (s === 'ready' || s === 'delivered' || s === 'completed') return 'bg-[#2E5339] border-[#2E5339] text-white'
  if (s === 'cancelled') return 'bg-[#F6E3E2] border-[#E5B9B6] text-[#B0413E]'
  return 'bg-[#F0EDE6] border-[#E8E2D6] text-[#5C5C5C]'
}
