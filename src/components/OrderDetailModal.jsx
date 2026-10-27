import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  ShoppingBag,
  User,
  MapPin,
  QrCode,
  CreditCard,
  Banknote,
} from 'lucide-react'

// Robust product image resolver
const resolveProductImage = (it, order) => {
  if (it?.image) return it.image.startsWith('http') ? it.image : `http://127.0.0.1:8000/storage/${it.image}`
  if (it?.product?.images && it.product.images.length > 0) {
    const raw = it.product.images[0].image
    if (raw) return raw.startsWith('http') ? raw : `http://127.0.0.1:8000/storage/${raw}`
  }
  if (it?.product?.image) {
    const raw = it.product.image
    if (raw) return raw.startsWith('http') ? raw : `http://127.0.0.1:8000/storage/${raw}`
  }
  if (order?.productThumb) return order.productThumb
  return null
}

export default function OrderDetailModal({ isOpen, onClose, order, onUpdateStatus }) {
  if (!isOpen || !order) return null

  const getPaymentMethodBadge = (method, bankName) => {
    switch (method) {
      case 'bank_qr':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs font-bold">
            <QrCode size={12} className="text-black dark:text-white" />
            <span>
              {bankName && bankName.includes('abaa')
                ? 'ABA'
                : bankName && bankName.includes('aclb')
                ? 'ACLEDA'
                : bankName && bankName.includes('wing')
                ? 'Wing'
                : 'QR'}
            </span>
          </span>
        )
      case 'card':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60 text-xs font-bold">
            <CreditCard size={12} className="text-blue-700 dark:text-blue-400" />
            <span>Card</span>
          </span>
        )
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs font-bold">
            <Banknote size={12} className="text-neutral-700 dark:text-neutral-300" />
            <span>សាច់ប្រាក់</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 text-xs font-medium">
            <QrCode size={12} className="text-neutral-500 dark:text-neutral-400" />
            <span>{method || 'QR'}</span>
          </span>
        )
    }
  }

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 text-xs font-bold">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>បានទូទាត់</span>
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 text-xs font-bold">
            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
            <span>រង់ចាំការទូទាត់</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60 text-xs font-bold">
            <AlertTriangle size={12} className="text-rose-600 dark:text-rose-400" />
            <span>បរាជ័យ</span>
          </span>
        )
    }
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="text-xs font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 border border-neutral-300 dark:border-neutral-700">
            បានបញ្ជាក់
          </span>
        )
      case 'processing':
        return (
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 border border-neutral-300 dark:border-neutral-700">
            កំពុងរៀបចំ
          </span>
        )
      case 'delivered':
        return (
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-300 dark:border-emerald-800/60">
            បានដឹកជញ្ជូន
          </span>
        )
      default:
        return (
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 border border-neutral-300 dark:border-neutral-700">
            បានលុបចោល
          </span>
        )
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Extract real customer details
  const customerName = order.customer || order.user?.name || 'អតិថិជន'
  const customerEmail = order.email || order.user?.email || 'គ្មានអ៊ីមែល'
  const customerPhone = order.phone || order.user?.profile?.phone || null
  const customerAddress = order.address || order.user?.profile?.address || null

  // Extract real items with guaranteed product images
  const itemsList =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items.map((it) => {
          const unitPriceNum = Number(
            it.price ? String(it.price).replace(/[^0-9.]/g, '') : (it.product?.price || 0)
          )
          const qty = it.quantity || 1
          const subtotalNum = Number(
            it.subtotal ? String(it.subtotal).replace(/[^0-9.]/g, '') : unitPriceNum * qty
          )
          const image = resolveProductImage(it, order)

          return {
            name: it.name || it.product_name || it.product?.name || 'មុខទំនិញ',
            image,
            quantity: qty,
            price:
              typeof it.price === 'string' && it.price.startsWith('$')
                ? it.price
                : `$${unitPriceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtotal:
              typeof it.subtotal === 'string' && it.subtotal.startsWith('$')
                ? it.subtotal
                : `$${subtotalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          }
        })
      : [
          {
            name: order.product || '-',
            image: resolveProductImage(null, order),
            quantity: 1,
            price: order.amount || '$0.00',
            subtotal: order.amount || '$0.00',
          },
        ]

  const subtotalDisplay = order.subtotal || order.amount || '$0.00'
  const discountDisplay = order.discount ? `-$${Number(order.discount).toFixed(2)}` : '-$0.00'
  const totalDisplay = order.total || order.amount || '$0.00'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog: Compact & No Scroll Required */}
      <div className="relative bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 w-full max-w-3xl flex flex-col shadow-2xl z-10 rounded-none max-h-[96vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <ShoppingBag size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-black dark:text-white tracking-tight leading-none">
                  ព័ត៌មានលម្អិតការបញ្ជាទិញ
                </h2>
                <span className="tabular-nums text-[11px] font-bold text-black dark:text-white bg-white dark:bg-neutral-800 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700">
                  {order.id}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5 block">
                កាលបរិច្ឆេទបញ្ជាទិញ៖ {order.date || '2026-10-08'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer rounded-none"
            aria-label="បិទ"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body: Compact Spacing */}
        <div className="p-4 space-y-2.5 flex-1 text-xs overflow-y-auto">
          
          {/* Status Bar */}
          <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">វិធីសាស្ត្រទូទាត់៖</span>
              {getPaymentMethodBadge(order.paymentMethod, order.bankName)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">ការទូទាត់៖</span>
              {getPaymentBadge(order.paymentStatus)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">ស្ថានភាព៖</span>
              {getOrderStatusBadge(order.orderStatus)}
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 space-y-1 bg-white dark:bg-neutral-900/40">
              <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 font-bold text-[10px] pb-1 border-b border-neutral-100 dark:border-neutral-800 uppercase">
                <User size={12} />
                <span>ព័ត៌មានអតិថិជន</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-black dark:text-white text-xs truncate">{customerName}</span>
                {customerPhone && (
                  <span className="text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold text-[11px] shrink-0">
                    {customerPhone}
                  </span>
                )}
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 block text-[11px] truncate">{customerEmail}</span>
            </div>

            <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 space-y-1 bg-white dark:bg-neutral-900/40">
              <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 font-bold text-[10px] pb-1 border-b border-neutral-100 dark:border-neutral-800 uppercase">
                <MapPin size={12} />
                <span>អាសយដ្ឋានដឹកជញ្ជូន</span>
              </div>
              <div className="text-neutral-700 dark:text-neutral-300 text-xs line-clamp-2">
                {customerAddress ? (
                  <p className="font-semibold text-black dark:text-white">{customerAddress}</p>
                ) : (
                  <p className="text-neutral-400 dark:text-neutral-500 italic">មិនទាន់មានអាសយដ្ឋានដឹកជញ្ជូន</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214]">
            <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-bold text-black dark:text-white flex items-center justify-between text-xs">
              <span>បញ្ជីមុខទំនិញដែលបានបញ្ជាទិញ</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">
                ({itemsList.length} មុខទំនិញ)
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/80 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-bold border-b border-neutral-200 dark:border-neutral-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">មុខទំនិញ</th>
                    <th className="py-2.5 px-3 text-center">ចំនួន</th>
                    <th className="py-2.5 px-3 text-right">តម្លៃរាយ</th>
                    <th className="py-2.5 px-3 text-right">តម្លៃសរុប</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
                  {itemsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-black dark:text-white">
                        <span className="truncate max-w-xs text-xs block font-bold text-black dark:text-white">{item.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-bold text-neutral-800 dark:text-neutral-200">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                        {item.price}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-black text-black dark:text-white">
                        {item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation Breakdown: Sleek 4-Column Grid */}
            <div className="px-4 py-3 bg-neutral-100 dark:bg-[#18181b] border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">តម្លៃទំនិញសរុប</span>
                  <span className="tabular-nums font-bold text-sm text-black dark:text-white">{subtotalDisplay}</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">ថ្លៃដឹកជញ្ជូន</span>
                  <span className="tabular-nums font-bold text-sm text-emerald-600 dark:text-emerald-400">ឥតគិតថ្លៃ ($0.00)</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">ការបញ្ចុះតម្លៃ</span>
                  <span className="tabular-nums font-bold text-sm text-neutral-700 dark:text-neutral-300">{discountDisplay}</span>
                </div>
                <div className="flex flex-col space-y-0.5 text-right">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">ទឹកប្រាក់សរុប</span>
                  <span className="tabular-nums font-black text-base text-black dark:text-white">{totalDisplay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Updater: Horizontal Row */}
          {onUpdateStatus && (
            <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-black dark:text-white text-xs shrink-0">
                ប្តូរស្ថានភាពការបញ្ជាទិញ៖
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'confirmed', label: 'បានបញ្ជាក់' },
                  { id: 'processing', label: 'កំពុងរៀបចំ' },
                  { id: 'delivered', label: 'បានដឹកជញ្ជូន' },
                  { id: 'cancelled', label: 'លុបចោល' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onUpdateStatus(order.id, st.id)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
                      order.orderStatus === st.id
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-black dark:bg-[#18181b] dark:text-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
          <button
            onClick={handlePrint}
            className="h-8 px-3 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white flex items-center gap-1.5 rounded-none transition-colors cursor-pointer"
          >
            <Printer size={13} />
            <span>បោះពុម្ពវិក្កយបត្រ</span>
          </button>

          <button
            onClick={onClose}
            className="h-8 px-4 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>

      </div>
    </div>
  )
}
