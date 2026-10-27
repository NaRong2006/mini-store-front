import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Check,
  RefreshCw,
  Pencil,
  ChevronDown,
  FolderTree,
  Tag,
  Search,
  RotateCcw,
  X,
  SlidersHorizontal,
} from 'lucide-react'

// Sleek Custom Dropdown Filter Component
function FilterDropdown({ label, icon: Icon, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || options[0]
  const isFiltered = value !== 'ALL'

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 border flex items-center gap-2 text-xs transition-colors cursor-pointer rounded-none select-none ${
          isFiltered
            ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white font-bold'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-neutral-500 text-black dark:text-white font-semibold'
        }`}
      >
        {Icon && <Icon size={13} className={isFiltered ? 'text-white dark:text-black' : 'text-neutral-500 dark:text-neutral-400'} />}
        <span className={isFiltered ? 'text-neutral-300 dark:text-neutral-700 font-normal' : 'text-neutral-500 dark:text-neutral-400 font-normal'}>
          {label}៖
        </span>
        <span>{selectedOption?.label || selectedOption?.value}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
            isFiltered ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-400'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 min-w-[200px] bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-700 shadow-xl z-30 py-1 rounded-none max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer rounded-none ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-bold text-black dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-black dark:hover:text-white font-medium'
                }`}
              >
                <span>{opt.label || opt.value}</span>
                {isSelected && <Check size={13} className="text-black dark:text-white shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
import DashboardLayout from '../components/DashboardLayout'
import CountUp from '../components/CountUp'
import AddProductModal from '../components/AddProductModal'
import ProductDetailModal from '../components/ProductDetailModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import TablePagination from '../components/TablePagination'
import api from '../utils/api'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddOpen, setIsAddOpen] = useState(() => searchParams.get('action') === 'new')
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [brandsList, setBrandsList] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [brandFilter, setBrandFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Real initial products in mini-store database
  const [products, setProducts] = useState([])

  const mapProduct = (item) => {
    const rawImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0].image : null
    const image = rawImage
      ? (rawImage.startsWith('http') ? rawImage : `http://127.0.0.1:8000/storage/${rawImage}`)
      : null

    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      image,
      category: item.category?.name || '-',
      brand: item.brand?.name || '-',
      price: `$${parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      discount: item.discount && parseFloat(item.discount) > 0 ? `${parseFloat(item.discount) * 100}%` : '0%',
      stock: item.stock,
      sales: `${Number(item.total_sales || 0)} គ្រឿង`,
      status: Boolean(item.status),
      stockStatus: item.stock <= 0 ? 'out_of_stock' : item.stock <= 20 ? 'low_stock' : 'in_stock',
      description: item.description || '',
      rawProduct: item,
    }
  }

  // Clear action param if present
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Fetch real products from API
  const fetchProducts = () => {
    setLoading(true)
    api.get('/products')
      .then((res) => {
        const prodList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        const mapped = prodList.map(mapProduct)
          setProducts(mapped)
          setToastMessage('បានធ្វើបច្ចុប្បន្នភាពបញ្ជីទំនិញ!')
          setTimeout(() => setToastMessage(''), 2500)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false

    Promise.allSettled([
      // 1. Fetch Products
      api.get('/products').then((res) => {
        if (ignore) return
        const prodList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(prodList)) {
          setProducts(prodList.map(mapProduct))
        }
      }),

      // 2. Fetch Categories
      api.get('/categories').then((res) => {
        if (ignore) return
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(list)) setCategoriesList(list)
      }),

      // 3. Fetch Brands
      api.get('/brands').then((res) => {
        if (ignore) return
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(list)) setBrandsList(list)
      }),
    ]).finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const { id, name } = deleteTarget
    setDeleteLoading(true)
    try {
      await api.delete(`/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setToastMessage(`បានលុបទំនិញ "${name}" ដោយជោគជ័យ!`)
      setTimeout(() => setToastMessage(''), 3000)
    } catch {
      setToastMessage(`មិនអាចលុបទំនិញ "${name}" បានទេ!`)
      setTimeout(() => setToastMessage(''), 3000)
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  const toggleStatus = async (id) => {
    const target = products.find((p) => p.id === id)
    if (!target) return
    const newStatus = !target.status

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    )

    try {
      await api.put(`/products/${id}`, { status: newStatus })
      setToastMessage(
        `បានកែប្រែស្ថានភាព "${target.name}" ទៅជា ${newStatus ? 'សកម្ម' : 'អសកម្ម'} ដោយជោគជ័យ!`
      )
      setTimeout(() => setToastMessage(''), 3000)
    } catch {
      // Revert if API failed
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: target.status } : p))
      )
      setToastMessage('មិនអាចកែប្រែស្ថានភាពទំនិញបានទេ សូមព្យាយាមម្តងទៀត!')
      setTimeout(() => setToastMessage(''), 3500)
    }
  }

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val)
    setCurrentPage(1)
  }

  const handleBrandFilterChange = (val) => {
    setBrandFilter(val)
    setCurrentPage(1)
  }

  const handleSearchChange = (val) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const categoryOptions = [
    { value: 'ALL', label: 'ទាំងអស់' },
    ...Array.from(
      new Set([
        ...categoriesList.map((c) => c.name),
        ...products.map((p) => p.category).filter(Boolean),
      ])
    ).map((cat) => ({ value: cat, label: cat })),
  ]

  const brandOptions = [
    { value: 'ALL', label: 'ទាំងអស់' },
    ...Array.from(
      new Set([
        ...brandsList.map((b) => b.name),
        ...products.map((p) => p.brand).filter(Boolean),
      ])
    ).map((b) => ({ value: b, label: b })),
  ]

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      categoryFilter === 'ALL' || p.category === categoryFilter
    const matchesBrand =
      brandFilter === 'ALL' || p.brand === brandFilter
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesBrand && matchesSearch
  })

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <DashboardLayout
      onOpenAddProduct={() => setIsAddOpen(true)}
      searchQuery={search}
      onSearchChange={handleSearchChange}
    >
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
              ទំនិញក្នុងស្តុក
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              គ្រប់គ្រងបញ្ជីទំនិញ តម្លៃ និងបរិមាណស្តុកក្នុងហាង {loading ? '' : ` (${products.length} មុខទំនិញ)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="h-9 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ផ្ទុកទិន្នន័យឡើងវិញ"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">ធ្វើបច្ចុប្បន្នភាព</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="h-9 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>បន្ថែមទំនិញថ្មី</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">ទំនិញសរុប</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black"><CountUp value={products.length} /></span>
              <span className="text-xs font-bold text-neutral-500">មុខ</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">កំពុងដាក់លក់</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-emerald-700">
                <CountUp value={products.filter((p) => p.status).length} />
              </span>
              <span className="text-xs font-bold text-emerald-600">មុខ</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">ស្តុកទាប</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-amber-700">
                <CountUp value={products.filter((p) => p.stockStatus === 'low_stock').length} />
              </span>
              <span className="text-xs font-bold text-amber-600">មុខ</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">ចំនួនស្តុកសរុប</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black">
                <CountUp value={products.reduce((acc, p) => acc + (p.stock || 0), 0)} />
              </span>
              <span className="text-xs font-bold text-neutral-500">គ្រឿង</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 dark:text-neutral-500 mr-1">
              <SlidersHorizontal size={14} className="text-neutral-500 dark:text-neutral-400" />
              <span>ចម្រាញ់៖</span>
            </div>

            {/* Custom Category Dropdown */}
            <FilterDropdown
              label="ប្រភេទ"
              icon={FolderTree}
              value={categoryFilter}
              options={categoryOptions}
              onChange={handleCategoryFilterChange}
            />

            {/* Custom Brand Dropdown */}
            <FilterDropdown
              label="ម៉ាក"
              icon={Tag}
              value={brandFilter}
              options={brandOptions}
              onChange={handleBrandFilterChange}
            />

            {/* Clear Filters Button */}
            {(categoryFilter !== 'ALL' || brandFilter !== 'ALL' || search.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  handleCategoryFilterChange('ALL')
                  handleBrandFilterChange('ALL')
                  handleSearchChange('')
                }}
                className="h-9 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
                title="សម្អាតការចម្រាញ់ទាំងអស់"
              >
                <RotateCcw size={12} />
                <span>សម្អាត</span>
              </button>
            )}
          </div>

          {/* Search Box with Embedded Icon and Clear Button */}
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬ SKU..."
              className="w-full h-9 pl-9 pr-8 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white rounded-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer p-0.5"
                title="សម្អាតការស្វែងរក"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs table-fixed">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[16%]" />
              <col className="w-[11%]" />
              <col className="w-[9%] text-center" />
              <col className="w-[8%] text-center" />
              <col className="w-[9%] text-right" />
              <col className="w-[6%] text-center" />
              <col className="w-[10%] text-center" />
              <col className="w-[8%] text-center" />
              <col className="w-[8%] text-center" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="bg-neutral-50/90 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center whitespace-nowrap">#ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ឈ្មោះទំនិញ</th>
                <th className="py-3 px-3 whitespace-nowrap">កូដទំនិញ</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">ប្រភេទទំនិញ</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">ម៉ាកយីហោ</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">តម្លៃលក់</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">បញ្ចុះតម្លៃ</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">ស្តុកនៅសល់</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">លក់ចេញ</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">ស្ថានភាព</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#121214]">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">កំពុងផ្ទុកទិន្នន័យ...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3 text-center tabular-nums text-neutral-400 dark:text-neutral-500 font-bold whitespace-nowrap">
                      #{p.id}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-black dark:text-white whitespace-nowrap min-w-0">
                      <span className="text-xs font-bold text-black dark:text-white truncate block hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" title={p.name}>
                        {p.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-neutral-700 dark:text-neutral-300 text-[11px] bg-neutral-100/90 dark:bg-neutral-800/90 px-2 py-0.5 border border-neutral-200 dark:border-neutral-700/80 font-semibold inline-block">
                        {p.sku}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 uppercase tracking-wide">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold border border-neutral-200 dark:border-neutral-800 uppercase tracking-wide">
                        {p.brand}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums font-black text-black dark:text-white text-right whitespace-nowrap text-xs">
                      {p.price}
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {p.discount && p.discount !== '0%' ? (
                        <span className="inline-block px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50 text-[10px] font-bold tabular-nums">
                          -{p.discount}
                        </span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500 font-medium tabular-nums">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`tabular-nums text-xs ${
                          p.stock <= 0
                            ? 'font-bold text-rose-600 dark:text-rose-400'
                            : p.stock <= 20
                            ? 'font-bold text-amber-600 dark:text-amber-400'
                            : 'font-semibold text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {p.stock <= 0 ? 'អស់ស្តុក' : `${p.stock} គ្រឿង`}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`text-xs tabular-nums font-semibold ${
                          !p.sales || p.sales.startsWith('0')
                            ? 'text-neutral-500 dark:text-neutral-400'
                            : 'text-emerald-700 dark:text-emerald-400 font-bold'
                        }`}
                      >
                        {p.sales || '0 គ្រឿង'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStatus(p.id)
                        }}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                          p.status
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {p.status ? <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={11} />}
                        <span>{p.status ? 'សកម្ម' : 'អសកម្ម'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProduct(p)
                          }}
                          className="p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-500 hover:text-black dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                          title="មើលព័ត៌មានលម្អិត"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProduct(p)
                            setIsAddOpen(true)
                          }}
                          className="p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-500 hover:text-black dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                          title="កែសម្រួលទំនិញ"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: p.id, name: p.name })
                          }}
                          className="p-1.5 hover:bg-red-600 hover:text-white text-neutral-500 hover:text-red-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                          title="លុបទំនិញ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-xs bg-white dark:bg-[#121214]">
                    មិនមានទំនិញដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ។
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Table Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>

      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="បញ្ជាក់ការលុបទំនិញ"
        message="តើអ្នកពិតជាចង់លុបទំនិញនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។"
        itemName={deleteTarget ? deleteTarget.name : ''}
        loading={deleteLoading}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onEdit={(p) => {
          setSelectedProduct(null)
          setEditingProduct(p)
          setIsAddOpen(true)
        }}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal
        key={editingProduct ? `edit-${editingProduct.id}` : (isAddOpen ? 'add-open' : 'add-closed')}
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false)
          setEditingProduct(null)
        }}
        productToEdit={editingProduct}
        categories={categoriesList}
        brands={brandsList}
        onAddProduct={() => {
          fetchProducts()
          setToastMessage(
            editingProduct
              ? 'បានកែប្រែព័ត៌មានទំនិញដោយជោគជ័យ!'
              : 'បានបន្ថែមទំនិញថ្មីដោយជោគជ័យ!'
          )
          setTimeout(() => setToastMessage(''), 3000)
        }}
      />
    </DashboardLayout>
  )
}
