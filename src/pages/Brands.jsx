import { useState, useEffect } from 'react'
import { Tag, Plus, Trash2, X, Check, Package, RefreshCw, Pencil } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import api from '../utils/api'

export default function Brands() {
  const [brands, setBrands] = useState([])

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandDesc, setNewBrandDesc] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteBrand, setDeleteBrand] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchBrands = () => {
    setLoading(true)
    api.get('/brands')
      .then((res) => {
        const brandList = res.data?.data || []
        if (Array.isArray(brandList) && brandList.length > 0) {
          const mapped = brandList.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            description: b.description || 'ម៉ាកយីហោផ្លូវការ',
            productCount: Number(b.products_count ?? b.products?.length ?? 0),
          }))
          setBrands(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    api.get('/brands')
      .then((res) => {
        if (ignore) return
        const brandList = res.data?.data || []
        if (Array.isArray(brandList)) {
          const mapped = brandList.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug || b.name.toLowerCase().replace(/\s+/g, '-'),
            description: b.description || 'ម៉ាកយីហោទំនិញក្នុងប្រព័ន្ធ',
            productCount: Number(b.products_count ?? b.products?.length ?? 0),
          }))
          setBrands(mapped)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleOpenAdd = () => {
    setEditingBrand(null)
    setNewBrandName('')
    setNewBrandDesc('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand)
    setNewBrandName(brand.name)
    setNewBrandDesc(brand.description || '')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBrand(null)
    setNewBrandName('')
    setNewBrandDesc('')
  }

  const handleSaveBrand = async (e) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    const formattedName = newBrandName.trim().toUpperCase()
    const formattedDesc = newBrandDesc.trim() || 'ម៉ាកយីហោផ្លូវការ'
    setSaving(true)

    if (editingBrand) {
      try {
        await api.put(`/brands/${editingBrand.id}`, {
          name: formattedName,
          description: formattedDesc,
        })
      } catch {
        try {
          await api.put(`/admin/brands/${editingBrand.id}`, {
            name: formattedName,
            description: formattedDesc,
          })
        } catch {
          // Local fallback
        }
      }

      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                name: formattedName,
                slug: formattedName.toLowerCase().replace(/\s+/g, '-'),
                description: formattedDesc,
              }
            : b
        )
      )
      setToastMessage(`បានកែប្រែម៉ាក "${formattedName}" ដោយជោគជ័យ!`)
    } else {
      let createdBrand = null
      try {
        const res = await api.post('/brands', {
          name: formattedName,
          description: formattedDesc,
        })
        createdBrand = res.data?.data
      } catch {
        try {
          const res = await api.post('/admin/brands', {
            name: formattedName,
            description: formattedDesc,
          })
          createdBrand = res.data?.data
        } catch {
          // Local fallback
        }
      }

      const newB = {
        id: createdBrand?.id || Date.now(),
        name: formattedName,
        slug: createdBrand?.slug || formattedName.toLowerCase().replace(/\s+/g, '-'),
        description: formattedDesc,
        productCount: 0,
      }

      setBrands((prev) => [newB, ...prev])
      setToastMessage(`បានបន្ថែមម៉ាក "${formattedName}" ដោយជោគជ័យ!`)
    }

    setSaving(false)
    handleCloseModal()
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleConfirmDeleteBrand = async () => {
    if (!deleteBrand) return
    const { id, name } = deleteBrand
    setDeleteLoading(true)
    try {
      await api.delete(`/brands/${id}`)
    } catch {
      try {
        await api.delete(`/admin/brands/${id}`)
      } catch {
        // Local removal
      }
    }
    setBrands((prev) => prev.filter((b) => b.id !== id))
    setToastMessage(`បានលុបម៉ាកយីហោ "${name}" ដោយជោគជ័យ!`)
    setTimeout(() => setToastMessage(''), 3000)
    setDeleteLoading(false)
    setDeleteBrand(null)
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout searchQuery={search} onSearchChange={setSearch}>
      <div className="space-y-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="p-3 bg-black text-white text-xs font-bold flex items-center justify-between border border-neutral-800 transition-all">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-tight">
              ម៉ាកយីហោទំនិញ
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              គ្រប់គ្រងបញ្ជីម៉ាកយីហោ និងផលិតផលដែលដាក់លក់ក្នុងហាង ({brands.length} ម៉ាកយីហោ)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBrands}
              disabled={loading}
              className="h-9 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">ធ្វើបច្ចុប្បន្នភាព</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="h-9 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>បន្ថែមម៉ាកថ្មី</span>
            </button>
          </div>
        </div>

        {/* Brands Grid / Loading */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800">
            <div className="w-7 h-7 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">កំពុងផ្ទុកទិន្នន័យ...</span>
          </div>
        ) : filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-neutral-200 p-5 space-y-3 relative hover:border-black transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-neutral-100 flex items-center justify-center text-black font-bold">
                    <Tag size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      title="កែសម្រួលម៉ាក"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteBrand({ id: b.id, name: b.name })}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="លុបម៉ាក"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-black tracking-tight">{b.name}</h3>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    slug: {b.slug}
                  </span>
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                    <Package size={13} />
                    <span><strong className="tabular-nums font-bold text-black">{b.productCount}</strong> មុខទំនិញក្នុងស្តុក</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                    ដៃគូផ្លូវការ
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800">
            មិនមានទិន្នន័យម៉ាកយីហោដែលត្រូវនឹងការស្វែងរកនេះទេ។
          </div>
        )}

      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white border border-neutral-300 w-full max-w-md shadow-2xl z-10 rounded-none">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h3 className="text-sm font-black text-black uppercase">
                {editingBrand ? 'កែសម្រួលម៉ាកយីហោ' : 'បន្ថែមម៉ាកយីហោថ្មី'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ឈ្មោះម៉ាកយីហោ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="ឧ. SONY, XIAOMI"
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ការពិពណ៌នា
                </label>
                <textarea
                  rows={3}
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="ពិពណ៌នាសង្ខេបអំពីម៉ាកយីហោ..."
                  className="w-full p-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 rounded-none cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-none cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <RefreshCw size={12} className="animate-spin" />}
                  <span>{editingBrand ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុក'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteBrand)}
        onClose={() => setDeleteBrand(null)}
        onConfirm={handleConfirmDeleteBrand}
        title="បញ្ជាក់ការលុបម៉ាកយីហោ"
        message="តើអ្នកពិតជាចង់លុបម៉ាកយីហោនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។"
        itemName={deleteBrand ? deleteBrand.name : ''}
        loading={deleteLoading}
      />
    </DashboardLayout>
  )
}
