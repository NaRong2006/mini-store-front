import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../utils/api'
import AuthLayout from '../components/AuthLayout'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email] = useState(() => searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'សូមបញ្ចូលអ៊ីមែល!'
    }

    if (!password) {
      newErrors.password = 'សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី!'
    } else if (password.length < 8) {
      newErrors.password = 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ!'
    }

    if (!passwordConfirmation) {
      newErrors.password_confirmation = 'សូមផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី!'
    } else if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      if (response.status === 200 || response.data?.message) {
        setSuccessMessage('ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ទំព័រចូល...')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage('មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
          កំណត់ពាក្យសម្ងាត់ថ្មី
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          សូមបង្កើតពាក្យសម្ងាត់ថ្មីដែលមានសុវត្ថិភាពខ្ពស់យ៉ាងតិច ៨ តួអក្សរ។
        </p>
      </div>

      {/* Notifications */}
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
      <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
        {/* Email Field (hidden or read-only display) */}
        {email && (
          <div className="p-3 bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 flex items-center justify-between">
            <span className="font-semibold text-neutral-500">គណនីអ៊ីមែល៖</span>
            <span className="font-bold text-black">{email}</span>
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            ពាក្យសម្ងាត់ថ្មី <span className="text-red-600">*</span>
          </label>
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

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            បញ្ជាក់ពាក្យសម្ងាត់ថ្មី <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Lock size={18} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value)
                if (errors.password_confirmation) setErrors({ ...errors, password_confirmation: '' })
              }}
              placeholder="••••••••"
              className={`w-full h-12 pl-11 pr-10 bg-white border ${
                errors.password_confirmation ? 'border-red-500' : 'border-neutral-300'
              } text-black text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-bold text-sm tracking-wide uppercase transition-colors rounded-none disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>កំពុងផ្លាស់ប្តូរ...</span>
            ) : (
              <>
                <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center pt-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>ត្រឡប់ទៅទំព័រចូលប្រើប្រាស់</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
