import { useState } from 'react'
import { Save, Check, Store, Globe, BellRing } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useLanguage } from '../context/LanguageContext'
import { CambodiaFlag, UkFlag } from '../components/FlagIcons'

export default function Settings() {
  const { lang, setLang } = useLanguage()
  const [storeName, setStoreName] = useState('MINI STORE')
  const [storeEmail, setStoreEmail] = useState('contact@ministore.com')
  const [storePhone, setStorePhone] = useState('+855 23 888 999')
  const [currency, setCurrency] = useState('USD')
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [orderEmailAlert, setOrderEmailAlert] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setToastMessage('បានរក្សាទុកការកំណត់ហាងដោយជោគជ័យ!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        
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
              ការកំណត់ទូទៅ
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              កែសម្រួលព័ត៌មានហាង រូបិយប័ណ្ណ ភាសា និងប្រព័ន្ធជូនដំណឹង
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Store Profile Section */}
          <div className="bg-white border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 text-sm font-black text-black">
              <Store size={16} />
              <span>ព័ត៌មានទូទៅអំពីហាង</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ឈ្មោះហាង
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  អ៊ីមែលទំនាក់ទំនង
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  លេខទូរស័ព្ទទំនាក់ទំនង
                </label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Currency & Language */}
          <div className="bg-white border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 text-sm font-black text-black">
              <Globe size={16} />
              <span>រូបិយប័ណ្ណ និងភាសា</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  រូបិយប័ណ្ណចម្បង
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 bg-white text-xs text-black focus:outline-none focus:border-black rounded-none cursor-pointer"
                >
                  <option value="USD">ដុល្លារអាមេរិក (USD $)</option>
                  <option value="KHR">រៀលខ្មែរ (KHR ៛)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  ភាសាប្រព័ន្ធ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('km')
                    }}
                    className={`h-10 px-3 border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      lang === 'km'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black'
                    }`}
                  >
                    <CambodiaFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                    <span>ភាសាខ្មែរ (KH)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLang('en')
                    }}
                    className={`h-10 px-3 border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      lang === 'en'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black'
                    }`}
                  >
                    <UkFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                    <span>English (EN)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Alerts */}
          <div className="bg-white border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 text-sm font-black text-black">
              <BellRing size={16} />
              <span>ប្រព័ន្ធជូនដំណឹង</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.checked)}
                  className="w-4 h-4 accent-black rounded-none"
                />
                <span className="text-xs font-semibold text-neutral-700">
                  ជូនដំណឹងភ្លាមៗនៅពេលស្តុកទំនិញនៅសល់ទាប
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={orderEmailAlert}
                  onChange={(e) => setOrderEmailAlert(e.target.checked)}
                  className="w-4 h-4 accent-black rounded-none"
                />
                <span className="text-xs font-semibold text-neutral-700">
                  ផ្ញើអ៊ីមែលស្វ័យប្រវត្តិទៅកាន់អ្នកគ្រប់គ្រងនៅពេលមានការបញ្ជាទិញថ្មី
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              className="h-11 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-none transition-colors cursor-pointer"
            >
              <Save size={15} />
              <span>រក្សាទុកការកំណត់</span>
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  )
}

