import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល!'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ!'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/forgot-password', {
        email,
      })

      if (response.status === 200 || response.data?.message) {
        setSuccessMessage('លេខកូដ OTP ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នករួចរាល់!')
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        }, 1200)
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message === 'User not found' ? 'រកមិនឃើញគណនីអ៊ីមែលនេះទេ!' : error.response.data.message)
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
          ភ្លេចពាក្យសម្ងាត់
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក។ យើងនឹងផ្ញើលេខកូដសម្ងាត់ (OTP) ទៅកាន់អ៊ីមែលនោះ ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី។
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
      <form onSubmit={handleForgotPassword} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            អ៊ីមែលគណនី <span className="text-red-600">*</span>
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-bold text-sm tracking-wide uppercase transition-colors rounded-none disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>កំពុងផ្ញើលេខកូដ...</span>
            ) : (
              <>
                <span>ផ្ញើលេខកូដ OTP</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Back to Login Link */}
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

