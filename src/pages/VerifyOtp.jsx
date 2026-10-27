import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Mail, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') || '')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'សូមបញ្ចូលអ៊ីមែល!'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ!'
    }

    if (!otp.trim()) {
      newErrors.otp = 'សូមបញ្ចូលលេខកូដ OTP!'
    } else if (otp.trim().length !== 6) {
      newErrors.otp = 'លេខកូដ OTP ត្រូវតែមាន ៦ ខ្ទង់!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/verify', {
        email,
        otp: otp.trim(),
      })

      if (response.status === 200 || response.data?.message) {
        setSuccessMessage('ផ្ទៀងផ្ទាត់ជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ទំព័រកំណត់ពាក្យសម្ងាត់ថ្មី...')
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`)
        }, 1200)
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message === 'OPT Invalid' || error.response.data.message === 'OTP Invalid' ? 'លេខកូដ OTP មិនត្រឹមត្រូវទេ!' : error.response.data.message)
      } else {
        setErrorMessage('មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setErrorMessage('សូមបញ្ចូលអ៊ីមែលជាមុនសិន!')
      return
    }

    setResending(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/forgot-password', { email })
      setSuccessMessage('លេខកូដ OTP ថ្មីត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នកម្តងទៀត!')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'មិនអាចផ្ញើលេខកូដឡើងវិញបានទេ។')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
          ផ្ទៀងផ្ទាត់លេខកូដ OTP
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          សូមបញ្ចូលលេខកូដសម្ងាត់ ៦ ខ្ទង់ដែលបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក។
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
      <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            អ៊ីមែលរបស់អ្នក <span className="text-red-600">*</span>
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

        {/* OTP Code */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-neutral-700">
              លេខកូដ OTP ៦ ខ្ទង់ <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              disabled={resending}
              onClick={handleResendOtp}
              className="text-xs font-semibold text-neutral-600 hover:text-black inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
              <span>{resending ? 'កំពុងផ្ញើ...' : 'ផ្ញើម្តងទៀត'}</span>
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <KeyRound size={18} />
            </div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''))
                if (errors.otp) setErrors({ ...errors, otp: '' })
              }}
              placeholder="123456"
              className={`w-full h-12 pl-11 pr-3.5 bg-white border ${
                errors.otp ? 'border-red-500' : 'border-neutral-300'
              } text-black text-center text-lg font-mono tracking-[0.5em] placeholder:text-neutral-300 focus:outline-none focus:border-black rounded-none transition-colors`}
            />
          </div>
          {errors.otp && (
            <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
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
              <span>កំពុងផ្ទៀងផ្ទាត់...</span>
            ) : (
              <>
                <span>ផ្ទៀងផ្ទាត់លេខកូដ</span>
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
