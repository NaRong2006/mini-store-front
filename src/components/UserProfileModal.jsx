import { useEffect } from 'react'
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react'

export default function UserProfileModal({ isOpen, onClose, user }) {
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

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white border border-neutral-300 w-full max-w-lg shadow-2xl z-10 rounded-none animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center shrink-0">
              <User size={15} />
            </div>
            <div>
              <h3 className="text-sm font-black text-black tracking-tight uppercase">
                ព័ត៌មានលម្អិតគណនី
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                User ID: #{user.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            title="បិទ"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 text-xs">
          
          {/* User Hero Banner */}
          <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-200">
            <div className="w-16 h-16 bg-white border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden text-xl font-bold font-mono">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <span style={{ display: user.avatar ? 'none' : 'flex' }} className="w-full h-full items-center justify-center bg-black text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-black truncate">{user.name}</h4>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    user.role === 'Admin'
                      ? 'bg-black text-white border-black'
                      : user.role === 'Staff'
                      ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-white text-neutral-700 border-neutral-300'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    user.status
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                  }`}
                >
                  {user.status ? 'សកម្ម' : 'ផ្អាក'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono truncate">{user.email}</p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-neutral-500">
                {user.hasProfile ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>មានព័ត៌មានលម្អិតពេញលេញ</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    មិនទាន់មានទិន្នន័យផ្ទាល់ខ្លួនបន្ថែម
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <Phone size={11} /> លេខទូរស័ព្ទ
              </span>
              <p className="text-xs font-semibold text-black tabular-nums">
                {user.phone || <span className="text-neutral-400 italic font-normal">មិនទាន់មាន</span>}
              </p>
            </div>

            <div className="p-3 border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <MapPin size={11} /> ទីតាំង / អាសយដ្ឋាន
              </span>
              <p className="text-xs font-semibold text-black truncate" title={user.address || ''}>
                {user.address || <span className="text-neutral-400 italic font-normal">មិនទាន់មាន</span>}
              </p>
            </div>

            <div className="p-3 border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <User size={11} /> ភេទ
              </span>
              <p className="text-xs font-semibold text-black">
                {user.gender || <span className="text-neutral-400 italic font-normal">មិនបានបញ្ជាក់</span>}
              </p>
            </div>

            <div className="p-3 border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <Calendar size={11} /> ថ្ងៃខែឆ្នាំកំណើត
              </span>
              <p className="text-xs font-semibold text-black tabular-nums">
                {user.birthday || <span className="text-neutral-400 italic font-normal">មិនបានបញ្ជាក់</span>}
              </p>
            </div>

            <div className="p-3 border border-neutral-200 bg-white space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <FileText size={11} /> ជីវប្រវត្តិសង្ខេប
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {user.bio || <span className="text-neutral-400 italic">មិនទាន់មានការពិពណ៌នា...</span>}
              </p>
            </div>

            <div className="p-3 border border-neutral-200 bg-white space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                <Calendar size={11} /> កាលបរិច្ឆេទបង្កើតគណនី
              </span>
              <p className="text-xs font-semibold text-black tabular-nums font-mono">
                {user.joined}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-none cursor-pointer transition-colors"
          >
            បិទ
          </button>
        </div>

      </div>
    </div>
  )
}
