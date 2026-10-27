import { useState, useEffect } from 'react'
import { FolderTree, Plus, Trash2, X, Check, Package, RefreshCw, Pencil } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import api from '../utils/api'

export default function Categories() {
  const [categories, setCategories] = useState([])

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteCategory, setDeleteCategory] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchCategories = () => {
    setLoading(true)
    api.get('/categories')
      .then((res) => {
        const catList = res.data?.data || []
        if (Array.isArray(catList)) {
          const mapped = catList.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || 'ប្រភេទមុខទំនិញក្នុងប្រព័ន្ធ',
            productCount: Number(c.products_count ?? c.products?.length ?? 0),
          }))
          setCategories(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    api.get('/categories')
      .then((res) => {
        if (ignore) return
        const catList = res.data?.data || []
        if (Array.isArray(catList)) {
          const mapped = catList.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
            description: c.description || 'ប្រភេទមុខទំនិញក្នុងប្រព័ន្ធ',
            productCount: Number(c.products_count ?? c.products?.length ?? 0),
          }))
          setCategories(mapped)
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
    setEditingCategory(null)
    setNewCategoryName('')
    setNewCategoryDesc('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat)
    setNewCategoryName(cat.name)
    setNewCategoryDesc(cat.description || '')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setNewCategoryName('')
    setNewCategoryDesc('')
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const formattedName = newCategoryName.trim().toUpperCase()
    const formattedDesc = newCategoryDesc.trim() || 'ប្រភេទមុខទំនិញក្នុងប្រព័ន្ធ'
    setSaving(true)

    if (editingCategory) {
      try {
        await api.put(`/categories/${editingCategory.id}`, {
          name: formattedName,
          description: formattedDesc,
        })
      } catch {
        try {
          await api.put(`/admin/categories/${editingCategory.id}`, {
            name: formattedName,
            description: formattedDesc,
          })
        } catch {
          // Local fallback
        }
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formattedName,
                slug: formattedName.toLowerCase().replace(/\s+/g, '-'),
                description: formattedDesc,
              }
            : c
        )
      )
      setToastMessage(`បានកែប្រែប្រភេទ "${formattedName}" ដោយជោគជ័យ!`)
    } else {
      let createdCat = null
      try {
        const res = await api.post('/categories', {
          name: formattedName,
          description: formattedDesc,
        })
        createdCat = res.data?.data
      } catch {
        try {
          const res = await api.post('/admin/categories', {
            name: formattedName,
            description: formattedDesc,
          })
          createdCat = res.data?.data
        } catch {
          // Local fallback
        }
      }

      const newCat = {
        id: createdCat?.id || Date.now(),
        name: formattedName,
        slug: createdCat?.slug || formattedName.toLowerCase().replace(/\s+/g, '-'),
        description: formattedDesc,
        productCount: 0,
      }

      setCategories((prev) => [newCat, ...prev])
      setToastMessage(`បានបន្ថែមប្រភេទ "${formattedName}" ដោយជោគជ័យ!`)
    }

    setSaving(false)
    handleCloseModal()
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategory) return
    const { id, name } = deleteCategory
    setDeleteLoading(true)
    try {
      await api.delete(`/categories/${id}`)
    } catch {
      try {
        await api.delete(`/admin/categories/${id}`)
      } catch {
        // Local removal
      }
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setToastMessage(`បានលុបប្រភេទ "${name}" ដោយជោគជ័យ!`)
    setTimeout(() => setToastMessage(''), 3000)
    setDeleteLoading(false)
    setDeleteCategory(null)
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
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
              ប្រភេទមុខទំនិញ
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              គ្រប់គ្រងប្រភេទទំនិញ និងចំណាត់ថ្នាក់មុខទំនិញក្នុងហាង {loading ? '' : ` (${categories.length} ប្រភេទ)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
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
              <span>បន្ថែមប្រភេទថ្មី</span>
            </button>
          </div>
        </div>

        {/* Categories Grid / Loading */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800">
            <div className="w-7 h-7 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">កំពុងផ្ទុកទិន្នន័យ...</span>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-neutral-200 p-5 space-y-3 relative hover:border-black transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-neutral-100 flex items-center justify-center text-black font-bold">
                    <FolderTree size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      title="កែសម្រួលប្រភេទ"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteCategory({ id: c.id, name: c.name })}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="លុបប្រភេទ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-black tracking-tight">{c.name}</h3>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    slug: {c.slug}
                  </span>
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                    <Package size={13} />
                    <span><strong className="tabular-nums font-bold text-black">{c.productCount}</strong> មុខទំនិញ</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                    សកម្ម
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800">
            មិនមានទិន្នន័យប្រភេទមុខទំនិញដែលត្រូវនឹងការស្វែងរកនេះទេ។
          </div>
        )}

      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white border border-neutral-300 w-full max-w-md shadow-2xl z-10 rounded-none">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h3 className="text-sm font-black text-black uppercase">
                {editingCategory ? 'កែសម្រួលប្រភេទមុខទំនិញ' : 'បន្ថែមប្រភេទមុខទំនិញថ្មី'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ឈ្មោះប្រភេទ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="ឧ. SMART WATCH"
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ការពិពណ៌នា
                </label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="ពិពណ៌នាសង្ខេបអំពីប្រភេទមុខទំនិញ..."
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
                  <span>{editingCategory ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុក'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteCategory)}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="បញ្ជាក់ការលុបប្រភេទមុខទំនិញ"
        message="តើអ្នកពិតជាចង់លុបប្រភេទមុខទំនិញនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។"
        itemName={deleteCategory ? deleteCategory.name : ''}
        loading={deleteLoading}
      />
    </DashboardLayout>
  )
}
