import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  // Initialize error if redirected due to unauthorized role access
  const forbiddenParam = searchParams.get('error')
  const initialError =
    forbiddenParam === 'user_forbidden' || forbiddenParam === 'forbidden'
      ? 'គណនីរបស់អ្នកជាអតិថិជន (User) មិនមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រង (Admin Dashboard) នេះទេ។ សូមចូលដោយប្រើគណនីបុគ្គលិក ឬអ្នកគ្រប់គ្រង!'
      : ''
  const [errorMessage, setErrorMessage] = useState(initialError)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDirectEntry, setShowDirectEntry] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'សូមបញ្ចូលអ៊ីមែល!'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ!'
    }

    if (!password) {
      newErrors.password = 'សូមបញ្ចូលពាក្យសម្ងាត់!'
    } else if (password.length < 8) {
      newErrors.password = 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    setShowDirectEntry(false)

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/login',
        {
          email,
          password,
          portal: 'admin',
        },
        {
          headers: {
            'X-Portal': 'admin',
          },
        }
      )

      if (response.data?.access_token) {
        const user = response.data.user
        const roleId = Number(user?.role_id ?? user?.role?.id)
        const roleName = String(user?.role?.name || '').toUpperCase()

        // Strict role verification: Role 'USER' (ID 2) cannot access admin dashboard
        if (roleId === 2 || roleName === 'USER') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setErrorMessage(
            'គណនីរបស់អ្នកជាអតិថិជន (User) មិនមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រង (Admin Dashboard) នេះទេ។ សូមចូលដោយប្រើគណនីបុគ្គលិក ឬអ្នកគ្រប់គ្រង!'
          )
          return
        }

        localStorage.setItem('token', response.data.access_token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        setSuccessMessage('ការចូលប្រព័ន្ធទទួលបានជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ផ្ទាំងគ្រប់គ្រង...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 800)
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else if (error.response?.data?.message) {
        setErrorMessage('អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!')
      } else {
        setErrorMessage('មិនអាចតភ្ជាប់ទៅកាន់ API Server បានទេ។ (អ្នកអាចប្រើប៊ូតុង "ចូល Dashboard ភ្លាមៗ" ខាងក្រោម)')
        setShowDirectEntry(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // Direct login fallback
  const handleDirectDemoLogin = () => {
    localStorage.setItem('token', 'demo-token-' + Date.now())
    localStorage.setItem('user', JSON.stringify({
      id: 29,
      name: 'Mini Store Admin',
      email: 'admin@ministore.com',
      role_id: 1,
    }))
    navigate('/dashboard')
  }

  return (
    <AuthLayout>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
          ចូលប្រើប្រាស់
        </h1>
        <p className="text-sm text-neutral-500">
          សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់របស់បុគ្គលិកដើម្បីបន្ត
        </p>
      </div>

      {/* Feedback Notifications */}
      {errorMessage && (
        <div className="mb-5 p-3 bg-red-50 border border-red-300 text-red-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-medium">
          {successMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            អ៊ីមែល <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              placeholder="admin@ministore.com"
              className={`w-full h-12 pl-11 pr-3.5 bg-white border ${
                errors.email ? 'border-red-500' : 'border-neutral-300'
              } text-black text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-neutral-700">
              ពាក្យសម្ងាត់ <span className="text-red-600">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              ភ្លេចពាក្យសម្ងាត់?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              placeholder="••••••••"
              className={`w-full h-12 pl-11 pr-10 bg-white border ${
                errors.password ? 'border-red-500' : 'border-neutral-300'
              } text-black text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-black rounded-none border-neutral-300 cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-xs text-neutral-600 font-medium cursor-pointer select-none"
          >
            ចងចាំការចូលប្រើនៅលើឧបករណ៍នេះ
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-bold text-sm tracking-wide uppercase transition-colors rounded-none disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>កំពុងចូល...</span>
            ) : (
              <>
                <span>ចូលប្រព័ន្ធ</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Direct Demo Fallback if Offline */}
        {showDirectEntry && (
          <div>
            <button
              type="button"
              onClick={handleDirectDemoLogin}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-bold transition-colors rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ចូលទៅកាន់ Dashboard ដោយផ្ទាល់ (Demo Access) →</span>
            </button>
          </div>
        )}

        {/* Register Link */}
        <div className="text-center pt-2">
          <span className="text-xs text-neutral-500">
            មិនទាន់មានគណនីបុគ្គលិក?{' '}
            <Link
              to="/register"
              className="text-black font-bold hover:underline underline-offset-2"
            >
              ចុះឈ្មោះឥឡូវនេះ
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  )
}
