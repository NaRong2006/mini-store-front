import { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'បញ្ជាក់ការលុបទិន្នន័យ',
  message = 'តើអ្នកពិតជាចង់លុបធាតុនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។',
  itemName = '',
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white border border-neutral-300 w-full max-w-md flex flex-col shadow-2xl z-10 rounded-none animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle size={16} />
            </div>
            <h3 className="text-sm font-black text-black tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer rounded-none disabled:opacity-50"
            title="បិទ"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-xs">
          <p className="text-neutral-600 leading-relaxed">
            {message}
          </p>

          {itemName && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-black flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 shrink-0" />
              <span className="font-bold text-xs truncate">{itemName}</span>
            </div>
          )}

          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            ⚠️ <strong>ចំណាំ៖</strong> ទិន្នន័យដែលបានលុប នឹងត្រូវដកចេញពីប្រព័ន្ធដោយស្វ័យប្រវត្តិ។
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 hover:border-black transition-colors cursor-pointer disabled:opacity-50"
          >
            បោះបង់
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Trash2 size={13} />
            <span>{loading ? 'កំពុងលុប...' : 'លុបចេញ'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}

