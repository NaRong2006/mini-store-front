import { useState, useEffect } from 'react'
import {
  X,
  Package,
  Pencil,
  CheckCircle2,
  XCircle,
  Tag,
  FolderTree,
  Boxes,
  TrendingUp,
} from 'lucide-react'
import { getImageUrl } from '../utils/api'

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onEdit,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [prevProductId, setPrevProductId] = useState(product?.id)

  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id)
    setSelectedImageIndex(0)
    setImgError(false)
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  // Collect all image sources available for this product
  const allImages = []
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      const src = typeof img === 'string' ? img : (img?.url || img?.image)
      if (src && !allImages.includes(src)) allImages.push(src)
    })
  }
  if (Array.isArray(product.rawProduct?.images)) {
    product.rawProduct.images.forEach((img) => {
      const src = typeof img === 'string' ? img : (img?.url || img?.image)
      if (src && !allImages.includes(src)) allImages.push(src)
    })
  }
  if (product.image && !allImages.includes(product.image)) {
    allImages.unshift(product.image)
  }
  if (product.image_url && !allImages.includes(product.image_url)) {
    allImages.unshift(product.image_url)
  }

  const activeImageSrc = allImages[selectedImageIndex] || product.image || product.image_url || null
  const formattedImage = getImageUrl(activeImageSrc)

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 20

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-10 rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-black dark:text-white tracking-tight leading-none">
                ព័ត៌មានលម្អិតទំនិញ
              </h2>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-1 block">
                Product ID: #{product.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer rounded-none"
            aria-label="បិទ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Main Product Showcase: Large Image and Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Image Showcase Container */}
            <div className="flex flex-col gap-2">
              <div className="relative w-full aspect-square bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-4 overflow-hidden group">
                {formattedImage && !imgError ? (
                  <img
                    src={formattedImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <Package size={48} className="text-neutral-300 dark:text-neutral-600" />
                    <span className="text-[11px] font-medium text-neutral-500">គ្មានរូបភាព</span>
                  </div>
                )}
                {/* Badges on Image */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
                  <span className="px-2 py-0.5 bg-black/80 dark:bg-white/90 text-white dark:text-black font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    {product.sku || 'SKU'}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 pointer-events-none">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border backdrop-blur-xs ${
                      product.status
                        ? 'bg-emerald-500/90 text-white border-emerald-400'
                        : 'bg-neutral-500/90 text-white border-neutral-400'
                    }`}
                  >
                    {product.status ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    <span>{product.status ? 'សកម្ម' : 'អសកម្ម'}</span>
                  </span>
                </div>
              </div>

              {/* Gallery Thumbnails if multiple images exist */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => {
                    const thumbUrl = getImageUrl(img)
                    const isSelected = idx === selectedImageIndex
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(idx)
                          setImgError(false)
                        }}
                        className={`w-12 h-12 border shrink-0 p-0.5 transition-all cursor-pointer rounded-none bg-neutral-100 dark:bg-neutral-900 ${
                          isSelected
                            ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                            : 'border-neutral-300 dark:border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Core Specs / Right Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 uppercase">
                    <FolderTree size={11} />
                    <span>{product.category}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 uppercase">
                    <Tag size={11} />
                    <span>{product.brand}</span>
                  </span>
                </div>
                <h3 className="text-lg font-black text-black dark:text-white leading-tight">
                  {product.name}
                </h3>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 block">
                  តម្លៃលក់បច្ចុប្បន្ន
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-black dark:text-white tabular-nums">
                    {product.price}
                  </span>
                  {product.discount && product.discount !== '0%' && (
                    <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold">
                      បញ្ចុះតម្លៃ -{product.discount}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock and Sales Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
                    <Boxes size={12} />
                    <span className="text-[11px] font-bold">ស្តុកនៅសល់</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 shrink-0 ${
                        isOutOfStock
                          ? 'bg-rose-500'
                          : isLowStock
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-black tabular-nums ${
                        isOutOfStock
                          ? 'text-rose-600 dark:text-rose-400'
                          : isLowStock
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-black dark:text-white'
                      }`}
                    >
                      {product.stock}
                    </span>
                    <span className="text-neutral-500 text-[11px]">គ្រឿង</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
                    <TrendingUp size={12} />
                    <span className="text-[11px] font-bold">លក់ចេញសរុប</span>
                  </div>
                  <span className="text-sm font-black text-black dark:text-white tabular-nums">
                    {product.sales || '0 គ្រឿង'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              ការពិពណ៌នាអំពីទំនិញ (Description)
            </span>
            <div className="p-3.5 bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
              {product.description ||
                product.rawProduct?.description ||
                `${product.name} គឺជាផលិតផលពិតប្រាកដគុណភាពខ្ពស់ ធានារយៈពេល ១ ឆ្នាំពេញពីក្រុមហ៊ុនផ្លូវការ និងគាំទ្រសេវាកម្មជួសជុលរហ័ស។`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            កូដទំនិញ៖ {product.sku}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer rounded-none"
            >
              បិទ
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="h-8 px-4 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center gap-1.5"
              >
                <Pencil size={12} />
                <span>កែសម្រួលទំនិញ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
