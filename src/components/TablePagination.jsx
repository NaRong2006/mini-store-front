import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) {
  // Do not render pagination if total items fit within the minimum page size
  const minLimit = pageSizeOptions && pageSizeOptions.length > 0 ? pageSizeOptions[0] : 10
  if (totalItems <= minLimit) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, totalItems)

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []
    if (safePage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (safePage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(safePage - 1)
      pages.push(safePage)
      pages.push(safePage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
      {/* Left: Info & Page Size */}
      <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
        <div className="text-neutral-600 dark:text-neutral-400 font-medium">
          បង្ហាញ <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">{startItem} - {endItem}</span> នៃ{' '}
          <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">{totalItems}</span> ជួរ
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 border-l border-neutral-200 dark:border-neutral-800 pl-4">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">ក្នុងមួយទំព័រ៖</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="h-7 px-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white font-bold focus:outline-none focus:border-black dark:focus:border-neutral-500 cursor-pointer rounded-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          className="h-8 w-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-black dark:hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900 disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 transition-colors cursor-pointer"
          title="ទំព័រដំបូង"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="h-8 w-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-black dark:hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900 disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 transition-colors cursor-pointer"
          title="ទំព័រមុន"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-neutral-400 font-mono">
                  ...
                </span>
              )
            }
            const isActive = p === safePage
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[32px] px-2 flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer tabular-nums ${
                  isActive
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100 hover:border-black dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:border-neutral-500'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className="h-8 w-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-black dark:hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900 disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 transition-colors cursor-pointer"
          title="ទំព័របន្ទាប់"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages}
          className="h-8 w-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-black dark:hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-900 disabled:hover:border-neutral-300 dark:disabled:hover:border-neutral-700 transition-colors cursor-pointer"
          title="ទំព័រចុងក្រោយ"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  )
}
