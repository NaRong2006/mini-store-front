import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
    if (!name.trim()) {
      newErrors.name = 'សូមបញ្ចូលឈ្មោះរបស់អ្នក!'
    }

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

    if (!passwordConfirmation) {
      newErrors.password_confirmation = 'សូមផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់!'
    } else if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      if (response.status === 201 || response.data?.user) {
        setSuccessMessage('ការចុះឈ្មោះទទួលបានជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ទំព័រចូល...')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        const firstKey = Object.keys(backendErrors)[0]
        setErrorMessage(backendErrors[firstKey][0] || 'ការចុះឈ្មោះមិនជោគជ័យ!')
      } else if (error.response?.data?.message) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
          ចុះឈ្មោះគណនី
        </h1>
        <p className="text-sm text-neutral-500">
          សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនីគ្រប់គ្រងថ្មី
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
      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            ឈ្មោះពេញ <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <User size={18} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              placeholder="សុខ សប្បាយ"
              className={`w-full h-12 pl-11 pr-3.5 bg-white border ${
                errors.name ? 'border-red-500' : 'border-neutral-300'
              } text-black text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            ពាក្យសម្ងាត់ <span className="text-red-600">*</span>
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-600">*</span>
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
              <span>កំពុងចុះឈ្មោះ...</span>
            ) : (
              <>
                <span>បង្កើតគណនី</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center pt-2">
          <span className="text-xs text-neutral-500">
            មានគណនីរួចហើយ?{' '}
            <Link
              to="/login"
              className="text-black font-bold hover:underline underline-offset-2"
            >
              ចូលប្រើប្រាស់
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  )
}

