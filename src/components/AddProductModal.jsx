import { useState } from 'react'
import { X, Plus, Package, Check } from 'lucide-react'
import api from '../utils/api'

function getInitialFormData(productToEdit, categories, brands) {
  if (productToEdit) {
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
      image: productToEdit.image || '',
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
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [prevProduct, setPrevProduct] = useState(productToEdit)

  if (productToEdit !== prevProduct) {
    setPrevProduct(productToEdit)
    setFormData(getInitialFormData(productToEdit, categories, brands))
    setErrors({})
  }

  if (!isOpen) return null

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

    try {
      if (productToEdit) {
        await api.put(`/products/${productToEdit.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      if (onAddProduct) {
        onAddProduct()
      }
      onClose()
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'មិនអាចរក្សាទុកទិន្នន័យបានទេ។ សូមពិនិត្យព័ត៌មានម្តងទៀត!' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl z-10 rounded-none">
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
                {productToEdit ? `កែប្រែទិន្នន័យទំនិញ ID: #${productToEdit.id}` : 'បំពេញព័ត៌មានលម្អិតនៃមុខទំនិញខាងក្រោម'}
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
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
                errors.name ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 bg-white'
              } text-xs text-black focus:outline-none focus:border-black rounded-none`}
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
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black rounded-none cursor-pointer"
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
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black rounded-none cursor-pointer"
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
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-black rounded-none"
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
                  errors.price ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 bg-white'
                } text-xs font-mono text-black focus:outline-none focus:border-black rounded-none`}
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
                  errors.stock ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 bg-white'
                } text-xs font-mono text-black focus:outline-none focus:border-black rounded-none`}
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
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black rounded-none resize-none"
            />
          </div>

          {/* Product Image URL with Live Preview */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              តំណភ្ជាប់រូបភាពទំនិញ (Image URL)
            </label>
            <div className="flex items-center gap-3">
              {formData.image ? (
                <div className="w-11 h-11 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={formData.image}
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
                placeholder="ឧទាហរណ៍៖ http://... ឬទុកទំនេរសម្រាប់រូបភាពលំនាំដើម"
                className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
              />
            </div>
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
            <label htmlFor="product-status" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
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
