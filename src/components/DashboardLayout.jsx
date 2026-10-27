import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { CambodiaFlag, UkFlag } from './FlagIcons'
import {
  ShoppingBag,
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Tag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  CheckCheck,
  ChevronDown,
  Check,
  Moon,
  Sun,
} from 'lucide-react'

export default function DashboardLayout({ children, searchQuery, onSearchChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'ការបញ្ជាទិញថ្មី ORD-20261007-12',
      desc: 'Huang Taindi បានបញ្ជាទិញ Iphone 17 Pro Max ($1,399.99)',
      time: '10 នាទីមុន',
      unread: true,
    },
    {
      id: 2,
      title: 'ស្តុកទំនិញទាប',
      desc: 'MacBook Pro M4 16" នៅសល់តែ 18 គ្រឿងក្នុងស្តុកប៉ុណ្ណោះ',
      time: '1 ម៉ោងមុន',
      unread: true,
    },
    {
      id: 3,
      title: 'អតិថិជនថ្មីបានចុះឈ្មោះ',
      desc: 'Sok San (soksan@ministore.com) បានបង្កើតគណនីថ្មី',
      time: '3 ម៉ោងមុន',
      unread: false,
    },
  ])

  const notifRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Guard: if role is USER, kick out to login
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const roleId = Number(user?.role_id ?? user?.role?.id)
      const roleName = String(user?.role?.name || '').toUpperCase()
      if (roleId === 2 || roleName === 'USER') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login?error=user_forbidden', { replace: true })
      }
    } catch {
      // ignore
    }
  }, [navigate])

  // Get current logged-in user from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { name: 'Admin User', email: 'admin@ministore.com' }
    } catch {
      return { name: 'Admin User', email: 'admin@ministore.com' }
    }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })))
  }

  const navItems = [
    { name: t('dashboard', 'ផ្ទាំងគ្រប់គ្រង'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('orders', 'ការបញ្ជាទិញ'), path: '/orders', icon: ShoppingCart },
    { name: t('products', 'ទំនិញក្នុងស្តុក'), path: '/products', icon: Package },
    { name: t('categories', 'ប្រភេទមុខទំនិញ'), path: '/categories', icon: FolderTree },
    { name: t('brands', 'ម៉ាកយីហោ'), path: '/brands', icon: Tag },
    { name: t('users', 'អ្នកប្រើប្រាស់'), path: '/users', icon: Users },
    { name: t('reports', 'របាយការណ៍លក់'), path: '/reports', icon: BarChart3 },
    { name: t('settings', 'ការកំណត់'), path: '/settings', icon: Settings },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#09090b] flex text-black dark:text-neutral-100 antialiased">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:w-64 bg-white dark:bg-[#121214] border-r border-neutral-200 dark:border-neutral-800 flex-col justify-between fixed inset-y-0 left-0 z-30 select-none">
        <div>
          {/* Logo Brand Header */}
          <Link
            to="/dashboard"
            className="h-16 px-6 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-black dark:text-white block leading-none">
                MINI STORE
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-neutral-400">
              ម៉ឺនុយចម្បង
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-none transition-colors ${
                    isActive
                      ? 'bg-black text-white dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none font-bold ${
                        isActive
                          ? 'bg-white text-black dark:bg-neutral-900 dark:text-white'
                          : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Logout at Sidebar Bottom */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
              {storedUser.name ? storedUser.name.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <span className="text-xs font-bold text-black dark:text-white block truncate leading-tight">
                {storedUser.name || 'Admin'}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                {storedUser.email || 'admin@ministore.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-9 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-800 transition-colors rounded-none cursor-pointer"
          >
            <LogOut size={14} />
            <span>ចាកចេញពីប្រព័ន្ធ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 bg-white dark:bg-[#121214] border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between p-4 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="font-black text-base text-black dark:text-white">MINI STORE</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-none ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-800 font-mono font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full h-9 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-300 rounded-none cursor-pointer"
            >
              <LogOut size={14} />
              <span>{t('logout', 'ចាកចេញ')}</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#121214] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Quick Search Bar */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder', 'ស្វែងរកទំនិញ, ការបញ្ជាទិញ...')}
                className="w-full h-9 pl-9 pr-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-900 focus:border-black dark:focus:border-neutral-400 focus:outline-none rounded-none transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions: Language, Dark Mode & Notifications */}
          <div className="flex items-center gap-2">
            {/* Language Switcher with Flag Icon & Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="h-9 px-2.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer select-none"
                title={lang === 'km' ? 'ប្តូរទៅភាសាអង់គ្លេស (Switch Language)' : 'Switch to Khmer (ប្តូរភាសា)'}
              >
                {lang === 'km' ? (
                  <CambodiaFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                ) : (
                  <UkFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                )}
                <span className="font-mono text-xs font-black">{lang === 'km' ? 'KH' : 'EN'}</span>
                <ChevronDown
                  size={12}
                  className={`text-neutral-400 transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl z-50 py-1 rounded-none">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('km')
                      setLangOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      lang === 'km'
                        ? 'bg-neutral-100 dark:bg-neutral-800 font-bold text-black dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CambodiaFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                      <span>ភាសាខ្មែរ</span>
                    </div>
                    {lang === 'km' && <Check size={13} className="text-black dark:text-white shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLang('en')
                      setLangOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      lang === 'en'
                        ? 'bg-neutral-100 dark:bg-neutral-800 font-bold text-black dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UkFlag className="w-5 h-3.5 border border-neutral-300 dark:border-neutral-700 shadow-2xs" />
                      <span>English</span>
                    </div>
                    {lang === 'en' && <Check size={13} className="text-black dark:text-white shrink-0" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={isDark ? 'ប្តូរទៅពន្លឺ' : 'ប្តូរទៅងងឹត'}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-none transition-colors cursor-pointer"
                title={t('notifications', 'ការជូនដំណឹង')}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-none" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl z-50 rounded-none">
                  <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-black dark:text-white">{t('notifications', 'ការជូនដំណឹង')}</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono bg-red-600 text-white px-1.5 py-0.2 rounded-none font-bold">
                          {unreadCount} {t('newBadge', 'ថ្មី')}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        <span>{t('markAllRead', 'អានទាំងអស់')}</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-400 font-medium">
                        គ្មានការជូនដំណឹងថ្មីទេ
                      </div>
                    ) : (
                      notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors ${
                          n.unread ? 'bg-neutral-50/60 dark:bg-neutral-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-bold ${n.unread ? 'text-black dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                            {n.title}
                          </span>
                          {n.unread && <span className="w-1.5 h-1.5 bg-black dark:bg-white mt-1.5 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono block mt-1">
                          {n.time}
                        </span>
                      </div>
                    )))}
                  </div>

                  <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 text-center bg-neutral-50 dark:bg-neutral-800/50">
                    <Link
                      to="/orders"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-black dark:text-white hover:underline"
                    >
                      {t('viewAllOrders', 'មើលការបញ្ជាទិញទាំងអស់ →')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-12 bg-white dark:bg-[#121214] border-t border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>{t('copyright', '© 2026 MINI STORE. រក្សាសិទ្ធិគ្រប់យ៉ាង។')}</span>
          <span className="font-mono">v2.0.1</span>
        </footer>

      </div>

    </div>
  )
}
