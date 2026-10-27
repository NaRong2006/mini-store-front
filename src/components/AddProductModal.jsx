import { useState, useRef, useEffect } from 'react'
import {
  X,
  Plus,
  Package,
  Check,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import api, { getImageUrl } from '../utils/api'

function getInitialFormData(productToEdit, categories, brands) {
  if (productToEdit) {
    const rawImg = productToEdit.image || productToEdit.image_url || ''
    return {
      name: productToEdit.name || '',
      category: productToEdit.category || (categories[0]?.name || 'SMART PHONE'),
      brand: productToEdit.brand || (brands[0]?.name || 'APPLE'),
      sku: productToEdit.sku || 'SKU-ITEM',
      price: String(productToEdit.price || '').replace(/[^0-9.]/g, ''),
      discount: String(productToEdit.discount || '0').replace(/[^0-9.]/g, ''),
      stock: String(productToEdit.stock ?? ''),
      status: Boolean(productToEdit.status),
      description: productToEdit.description || '',
      image: rawImg,
    }
  }
  return {
    name: '',
    category: categories[0]?.name || 'SMART PHONE',
    brand: brands[0]?.name || 'APPLE',
    sku: 'SKU-ITEM',
    price: '',
    discount: '0',
    stock: '',
    status: true,
    description: '',
    image: '',
  }
}

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  productToEdit = null,
  categories = [],
  brands = [],
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(productToEdit, categories, brands))
  const [imageMode, setImageMode] = useState('upload') // 'upload' | 'url'
  const [imageFile, setImageFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [prevProduct, setPrevProduct] = useState(productToEdit)
  const fileInputRef = useRef(null)

  // Sync state if productToEdit changes
  if (productToEdit !== prevProduct) {
    setPrevProduct(productToEdit)
    setFormData(getInitialFormData(productToEdit, categories, brands))
    setErrors({})
    setImageFile(null)
    setImageMode(productToEdit?.image || productToEdit?.image_url ? 'url' : 'upload')
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'សូមជ្រើសរើសឯកសាររូបភាពត្រឹមត្រូវ (PNG, JPG, WEBP)!' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'ទំហំរូបភាពមិនត្រូវលើសពី 5MB ឡើយ!' })
      return
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview)
    }

    setImageFile(file)
    setFilePreview(URL.createObjectURL(file))
    const nextErrors = { ...errors }
    delete nextErrors.image
    setErrors(nextErrors)
  }

  const handleRemoveFile = () => {
    setImageFile(null)
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
      setFilePreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'សូមបញ្ចូលឈ្មោះទំនិញ!'
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'សូមបញ្ចូលតម្លៃត្រឹមត្រូវ!'
    if (formData.stock === '' || Number(formData.stock) < 0) errs.stock = 'សូមបញ្ចូលចំនួនស្តុក!'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const categoryObj = categories.find((c) => c.name === formData.category) || categories[0]
    const brandObj = brands.find((b) => b.name === formData.brand) || brands[0]

    try {
      if (imageFile) {
        // Multipart upload from laptop / device
        const fd = new FormData()
        fd.append('name', formData.name.trim())
        fd.append('price', parseFloat(formData.price))
        fd.append('discount', parseFloat(formData.discount || 0))
        fd.append('stock', parseInt(formData.stock, 10))
        fd.append('status', formData.status ? '1' : '0')
        fd.append('description', formData.description || formData.name)
        fd.append('category_id', categoryObj?.id || 2)
        fd.append('brand_id', brandObj?.id || 5)
        fd.append('image', imageFile)

        if (productToEdit) {
          fd.append('_method', 'PUT')
          await api.post(`/products/${productToEdit.id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await api.post('/products', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
      } else {
        // Image URL or no new file
        const payload = {
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          discount: parseFloat(formData.discount || 0),
          stock: parseInt(formData.stock, 10),
          status: Boolean(formData.status),
          description: formData.description || formData.name,
          category_id: categoryObj?.id || 2,
          brand_id: brandObj?.id || 5,
        }

        if (formData.image && formData.image.trim()) {
          payload.image = formData.image.trim()
          payload.image_url = formData.image.trim()
        }

        if (productToEdit) {
          await api.put(`/products/${productToEdit.id}`, payload)
        } else {
          await api.post('/products', payload)
        }
      }

      if (onAddProduct) {
        onAddProduct()
      }
      onClose()
    } catch (err) {
      console.error(err)
      setErrors({
        submit:
          err.response?.data?.message ||
          'មិនអាចរក្សាទុកទិន្នន័យបានទេ។ សូមពិនិត្យព័ត៌មានម្តងទៀត!',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Determine current active preview
  const currentUrlPreview = getImageUrl(formData.image)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-10 rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-black dark:text-white tracking-tight leading-none">
                {productToEdit ? 'កែសម្រួលព័ត៌មានទំនិញ' : 'បន្ថែមទំនិញថ្មី'}
              </h2>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 block">
                {productToEdit
                  ? `កែប្រែទិន្នន័យទំនិញ ID: #${productToEdit.id}`
                  : 'បំពេញព័ត៌មានលម្អិតនៃមុខទំនិញ និងរូបភាពខាងក្រោម'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              ឈ្មោះទំនិញ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              placeholder="ឧទាហរណ៍៖ iPhone 18 Pro Max"
              className={`w-full h-10 px-3 border ${
                errors.name
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
              } text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none`}
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Grid 2 Cols: Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                ប្រភេទមុខទំនិញ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="SMART PHONE">SMART PHONE</option>
                    <option value="LAPTOP">LAPTOP</option>
                    <option value="TABLET">TABLET</option>
                    <option value="SPEAKER">SPEAKER</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                ម៉ាកយីហោ
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none cursor-pointer"
              >
                {brands.length > 0 ? (
                  brands.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="APPLE">APPLE</option>
                    <option value="SAMSUNG">SAMSUNG</option>
                    <option value="ASUS">ASUS</option>
                    <option value="DELL">DELL</option>
                    <option value="HP">HP</option>
                    <option value="SONY">SONY</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Grid 3 Cols: SKU, Price, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                លេខកូដទំនិញ
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                តម្លៃ ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value })
                  if (errors.price) setErrors({ ...errors, price: '' })
                }}
                placeholder="1299.99"
                className={`w-full h-10 px-3 border ${
                  errors.price
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                } text-xs font-mono text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none`}
              />
              {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                ចំនួនក្នុងស្តុក <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => {
                  setFormData({ ...formData, stock: e.target.value })
                  if (errors.stock) setErrors({ ...errors, stock: '' })
                }}
                placeholder="50"
                className={`w-full h-10 px-3 border ${
                  errors.stock
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                } text-xs font-mono text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none`}
              />
              {errors.stock && <p className="text-[11px] text-red-500 mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              ការពិពណ៌នាអំពីទំនិញ
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ព័ត៌មានបន្ថែមអំពីទំហំ អេក្រង់ ពណ៌ ឬលក្ខណៈពិសេស..."
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none resize-none"
            />
          </div>

          {/* PRODUCT IMAGE SECTION: TABS FOR (1) LAPTOP UPLOAD (2) IMAGE URL */}
          <div className="border border-neutral-200 dark:border-neutral-800 p-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ImageIcon size={14} />
                <span>រូបភាពទំនិញ (Product Image)</span>
              </label>

              {/* Toggle Mode Buttons */}
              <div className="flex items-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-0.5 rounded-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none ${
                    imageMode === 'upload'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Upload size={12} />
                  <span>Upload ពី Laptop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none ${
                    imageMode === 'url'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <LinkIcon size={12} />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {/* TAB 1: UPLOAD FROM DEVICE / LAPTOP */}
            {imageMode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-file-upload"
                />

                {filePreview ? (
                  <div className="flex items-center gap-3.5 p-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <div className="w-16 h-16 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={filePreview}
                        alt="Upload Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-black dark:text-white truncate block">
                        {imageFile?.name || 'រូបភាពត្រូវបានជ្រើសរើស'}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                        {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        <Check size={11} /> រួចរាល់សម្រាប់ Upload
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="product-file-upload"
                        className="h-8 px-3 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={12} />
                        <span>ប្តូររូប</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer"
                        title="ដករូបភាពចេញ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="product-file-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-900/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:scale-105 transition-transform">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-black dark:text-white mt-2">
                      ចុចដើម្បីជ្រើសរើសរូបភាពពី Laptop / កុំព្យូទ័រ
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">
                      គាំទ្រ PNG, JPG, JPEG, WEBP (ទំហំអតិបរមា 5MB)
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* TAB 2: IMAGE URL */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {currentUrlPreview ? (
                    <div className="w-11 h-11 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={currentUrlPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : null}
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/... ឬតំណភ្ជាប់រូបភាពផ្ទាល់"
                    className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
                  />
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="h-10 px-3 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      លុប
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500">
                  អ្នកអាចចម្លង (Copy) Link រូបភាពពីអ៊ីនធឺណិតមកបិទភ្ជាប់ (Paste) នៅទីនេះបាន។
                </p>
              </div>
            )}

            {errors.image && <p className="text-[11px] text-red-500">{errors.image}</p>}
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="product-status"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="w-4 h-4 accent-black rounded-none cursor-pointer"
            />
            <label
              htmlFor="product-status"
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              ដាក់លក់ភ្លាមៗលើប្រព័ន្ធ
            </label>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
              {errors.submit}
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-none transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-none transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>កំពុងរក្សាទុក...</span>
              ) : (
                <>
                  {productToEdit ? <Check size={14} /> : <Plus size={14} />}
                  <span>{productToEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកទំនិញថ្មី'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
