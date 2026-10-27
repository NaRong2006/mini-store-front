import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Search, Check, ShieldCheck, UserCheck, RefreshCw, CheckCircle2, User, Eye } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import CountUp from '../components/CountUp'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import UserProfileModal from '../components/UserProfileModal'
import TablePagination from '../components/TablePagination'
import api from '../utils/api'

export default function Users() {
  const [users, setUsers] = useState([])

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('User')
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const mapUser = (u) => {
    let roleName = 'User'
    if (u.role?.name === 'ADMIN' || u.role_id === 1) roleName = 'Admin'
    else if (u.role?.name === 'STAFF' || u.role_id === 4) roleName = 'Staff'
    else if (u.role?.name === 'SUPERADMIN' || u.role_id === 3) roleName = 'Admin'

    const profile = u.profile || null
    const profileAddress = profile?.address || u.address || null
    const profilePhone = profile?.phone || u.phone || null
    const rawAvatar = profile?.avatar || null
    const avatar = rawAvatar
      ? (rawAvatar.startsWith('http') ? rawAvatar : `http://127.0.0.1:8000/storage/${rawAvatar}`)
      : null

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: profilePhone,
      address: profileAddress,
      avatar,
      gender: profile?.gender === 'female' ? 'ស្រី' : profile?.gender === 'male' ? 'ប្រុស' : profile?.gender || null,
      birthday: profile?.birthday || null,
      bio: profile?.bio || null,
      hasProfile: Boolean(profilePhone || profileAddress || rawAvatar || profile?.birthday || profile?.bio),
      verified: Boolean(u.email_verified_at),
      role: roleName,
      status: Boolean(u.is_active),
      joined: u.created_at ? u.created_at.split('T')[0] : '-',
      rawUser: u,
    }
  }

  const fetchUsers = () => {
    setLoading(true)
    api.get('/users')
      .then((res) => {
        const userList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(userList) && userList.length > 0) {
          const mapped = userList.map(mapUser)
          setUsers(mapped)
          setToastMessage(`បានធ្វើបច្ចុប្បន្នភាពបញ្ជីអ្នកប្រើប្រាស់ (${mapped.length} គណនី)!`)
          setTimeout(() => setToastMessage(''), 2500)
        }
      })
      .catch(() => {
        api.get('/admin/users')
          .then((res) => {
            const userList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
            if (Array.isArray(userList) && userList.length > 0) {
              setUsers(userList.map(mapUser))
            }
          })
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    api.get('/users')
      .then((res) => {
        if (ignore) return
        const userList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(userList) && userList.length > 0) {
          setUsers(userList.map(mapUser))
        }
      })
      .catch(() => {
        api.get('/admin/users')
          .then((res) => {
            if (ignore) return
            const userList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
            if (Array.isArray(userList) && userList.length > 0) {
              setUsers(userList.map(mapUser))
            }
          })
          .catch(() => {})
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleAddUser = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status: true,
      joined: new Date().toISOString().split('T')[0],
    }

    setUsers([newUser, ...users])
    setName('')
    setEmail('')
    setRole('User')
    setIsModalOpen(false)
    setToastMessage(`បានបន្ថែមអ្នកប្រើប្រាស់ "${newUser.name}" ដោយជោគជ័យ!`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleConfirmDeleteUser = async () => {
    if (!deleteUser) return
    const { id, name } = deleteUser

    // Protect primary super admin account
    if (id === 1 || id === 29) {
      setToastMessage('មិនអាចលុបគណនីអ្នកគ្រប់គ្រងចម្បង (Super Admin) បានទេ!')
      setTimeout(() => setToastMessage(''), 3500)
      setDeleteUser(null)
      return
    }

    setDeleteLoading(true)
    try {
      await api.delete(`/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setToastMessage(`បានលុបគណនី "${name}" ដោយជោគជ័យ!`)
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      try {
        await api.delete(`/admin/users/${id}`)
        setUsers((prev) => prev.filter((u) => u.id !== id))
        setToastMessage(`បានលុបគណនី "${name}" ដោយជោគជ័យ!`)
        setTimeout(() => setToastMessage(''), 3000)
      } catch (errAdmin) {
        const errMsg =
          errAdmin.response?.data?.message ||
          err.response?.data?.message ||
          `មិនអាចលុបគណនី "${name}" បានទេ!`
        setToastMessage(errMsg)
        setTimeout(() => setToastMessage(''), 3500)
      }
    } finally {
      setDeleteLoading(false)
      setDeleteUser(null)
    }
  }

  const toggleStatus = async (id) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    const newStatus = !target.status

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    )

    try {
      await api.put(`/users/${id}`, { is_active: newStatus })
      setToastMessage(`បានកែប្រែស្ថានភាព "${target.name}" ទៅជា ${newStatus ? 'សកម្ម' : 'ផ្អាក'}!`)
      setTimeout(() => setToastMessage(''), 2500)
    } catch {
      try {
        await api.put(`/admin/users/${id}`, { is_active: newStatus })
      } catch {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: target.status } : u))
        )
        setToastMessage('មិនអាចកែប្រែស្ថានភាពគណនីបានទេ!')
        setTimeout(() => setToastMessage(''), 3000)
      }
    }
  }

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val)
    setCurrentPage(1)
  }

  const handleSearchChange = (val) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter.toUpperCase()

    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.address && u.address.toLowerCase().includes(search.toLowerCase())) ||
      u.role.toLowerCase().includes(search.toLowerCase())

    return matchesRole && matchesSearch
  })

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <DashboardLayout searchQuery={search} onSearchChange={handleSearchChange}>
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
              អ្នកប្រើប្រាស់
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              គ្រប់គ្រងគណនីបុគ្គលិក និងអតិថិជនក្នុងប្រព័ន្ធ {loading ? '' : ` (${users.length} គណនី)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="h-9 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">ធ្វើបច្ចុប្បន្នភាព</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>បន្ថែមអ្នកប្រើប្រាស់</span>
            </button>
          </div>
        </div>

        {/* User Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">គណនីសរុប</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black"><CountUp value={users.length} /></span>
              <span className="text-xs font-bold text-neutral-500">នាក់</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">អ្នកគ្រប់គ្រង</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black">
                <CountUp value={users.filter((u) => u.role === 'Admin').length} />
              </span>
              <span className="text-xs font-bold text-neutral-500">នាក់</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">បុគ្គលិក</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black">
                <CountUp value={users.filter((u) => u.role === 'Staff').length} />
              </span>
              <span className="text-xs font-bold text-neutral-500">នាក់</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-neutral-200 space-y-1">
            <span className="text-xs font-bold text-neutral-500 block">អតិថិជន</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums text-black">
                <CountUp value={users.filter((u) => u.role === 'User' || u.role === 'Customer').length} />
              </span>
              <span className="text-xs font-bold text-neutral-500">នាក់</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'ALL', label: 'ទាំងអស់' },
              { id: 'Admin', label: 'Admin' },
              { id: 'Staff', label: 'Staff' },
              { id: 'User', label: 'User' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleRoleFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  roleFilter === tab.id
                    ? 'bg-black text-white border-black dark:bg-neutral-800 dark:text-white dark:border-neutral-700'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-black dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល..."
              className="w-full h-9 pl-9 pr-8 border border-neutral-300 bg-white text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none"
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

        {/* Users Table */}
        <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs table-fixed">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[8%] text-center" />
              <col className="w-[8%] text-center" />
              <col className="w-[8%] text-center" />
              <col className="w-[9%] text-center" />
              <col className="w-[8%] text-right" />
            </colgroup>
            <thead className="bg-neutral-50/90 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center whitespace-nowrap">#ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ឈ្មោះអ្នកប្រើប្រាស់</th>
                <th className="py-3 px-3 whitespace-nowrap">អ៊ីមែល</th>
                <th className="py-3 px-3 whitespace-nowrap">លេខទូរស័ព្ទ</th>
                <th className="py-3 px-3 whitespace-nowrap">ទីតាំង / អាសយដ្ឋាន</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">តួនាទី</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">ការផ្ទៀងផ្ទាត់</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">ស្ថានភាព</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">ថ្ងៃចូលរួម</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#121214]">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">កំពុងផ្ទុកទិន្នន័យ...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group">
                  <td className="py-3 px-3 text-center tabular-nums text-neutral-400 dark:text-neutral-500 font-bold whitespace-nowrap">
                    #{u.id}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-black dark:text-white whitespace-nowrap truncate">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-black dark:text-white border border-neutral-200 dark:border-neutral-700 font-mono shrink-0 overflow-hidden text-xs">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-full h-full object-cover block"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <span style={{ display: u.avatar ? 'none' : 'flex' }} className="w-full h-full items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="whitespace-nowrap truncate block font-bold text-black dark:text-white">{u.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap truncate text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-3 px-3 tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {u.phone ? (
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{u.phone}</span>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap truncate text-[11px]" title={u.address || ''}>
                    {u.address ? (
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{u.address}</span>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border whitespace-nowrap min-w-[70px] ${
                        u.role === 'Admin'
                          ? 'bg-black text-white border-black dark:bg-neutral-800 dark:text-white dark:border-neutral-700'
                          : u.role === 'Staff'
                          ? 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                      }`}
                    >
                      {u.role === 'Admin' && <ShieldCheck size={12} />}
                      {u.role === 'Staff' && <UserCheck size={12} />}
                      {(u.role === 'User' || u.role === 'Customer' || (!['Admin', 'Staff'].includes(u.role))) && (
                        <User size={12} className="text-neutral-400" />
                      )}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border whitespace-nowrap ${
                        u.verified
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60'
                          : 'bg-neutral-50 text-neutral-400 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-500 dark:border-neutral-800'
                      }`}
                    >
                      {u.verified ? <CheckCircle2 size={11} className="text-blue-600 dark:text-blue-400" /> : null}
                      <span>{u.verified ? 'ផ្ទៀងផ្ទាត់រួច' : 'មិនទាន់'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`px-2.5 py-1 text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap min-w-[60px] ${
                        u.status
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 hover:bg-emerald-100'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {u.status ? 'សកម្ម' : 'ផ្អាក'}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap tabular-nums text-center text-xs">
                    {u.joined}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-500 hover:text-black dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                        title="មើល Profile"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteUser({ id: u.id, name: u.name })}
                        className="p-1.5 hover:bg-red-600 hover:text-white text-neutral-500 hover:text-red-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                        title="លុបគណនី"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-neutral-400 dark:text-neutral-500 text-xs bg-white dark:bg-[#121214]">
                    មិនមានទិន្នន័យអ្នកប្រើប្រាស់ដែលត្រូវនឹងការស្វែងរកនេះទេ។
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Table Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>

      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleConfirmDeleteUser}
        title="បញ្ជាក់ការលុបគណនីអ្នកប្រើប្រាស់"
        message="តើអ្នកពិតជាចង់លុបគណនីនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។"
        itemName={deleteUser ? deleteUser.name : ''}
        loading={deleteLoading}
      />

      {/* User Profile Detail Modal */}
      <UserProfileModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border border-neutral-300 w-full max-w-md shadow-2xl z-10 rounded-none">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h3 className="text-sm font-black text-black uppercase">
                បន្ថែមអ្នកប្រើប្រាស់ថ្មី
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  ឈ្មោះពេញ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. Sok San"
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  អ៊ីមែល <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-10 px-3 border border-neutral-300 text-xs text-black focus:outline-none focus:border-black rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  តួនាទី
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 bg-white text-xs text-black focus:outline-none focus:border-black rounded-none cursor-pointer"
                >
                  <option value="User">អតិថិជន</option>
                  <option value="Staff">បុគ្គលិក</option>
                  <option value="Admin">អ្នកគ្រប់គ្រង</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 rounded-none cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-none cursor-pointer"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
