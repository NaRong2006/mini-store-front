import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Download,
  Calendar,
  Check,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import CountUp from '../components/CountUp'
import { exportOrdersToCsv } from '../utils/exportCsv'
import api from '../utils/api'

export default function Reports() {
  const [period, setPeriod] = useState('month')
  const [toastMessage, setToastMessage] = useState('')
  const [realOrders, setRealOrders] = useState([])

  useEffect(() => {
    let ignore = false
    api.get('/orders')
      .then((res) => {
        if (ignore) return
        if (res.data && Array.isArray(res.data.items)) {
          const mapped = res.data.items.map((o) => {
            const firstItem = o.items && o.items[0]
            const productName = firstItem?.product?.name || firstItem?.product_name || '-'
            const qty = firstItem?.quantity || 1
            const totalNum =
              parseFloat(o.total || 0) ||
              parseFloat(firstItem?.price || firstItem?.product?.price || 0) * qty
            return {
              id: o.order_number || `ORD-${o.id}`,
              customer: o.user?.name || o.customer_name || 'អតិថិជនទូទៅ',
              email: o.user?.email || o.customer_email || '-',
              product: `${productName} (x${qty})`,
              amount: `$${totalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              paymentStatus: o.payment_status || 'paid',
              orderStatus: o.status || 'confirmed',
              date: o.created_at ? o.created_at.split('T')[0] : '-',
            }
          })
          setRealOrders(mapped)
        }
      })
      .catch(() => {})
      

    return () => {
      ignore = true
    }
  }, [])

  const filterByPeriod = (filter) => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    const currentYearMonth = today.substring(0, 7)
    const currentYear = today.substring(0, 4)

    return realOrders.filter((o) => {
      const dStr = o.date || (o.created_at ? o.created_at.split('T')[0] : '')
      if (!dStr) return true
      if (filter === 'today') return dStr === today
      if (filter === 'week') {
        const d = new Date(dStr)
        return d >= sevenDaysAgo && d <= now
      }
      if (filter === 'month') return dStr.startsWith(currentYearMonth)
      if (filter === 'year') return dStr.startsWith(currentYear)
      return true
    })
  }

  const periodOrders = filterByPeriod(period)
  const totalRevNum = periodOrders.reduce((acc, o) => {
    return acc + (parseFloat(String(o.amount).replace(/[^0-9.]/g, '')) || 0)
  }, 0)
  const avgOrderNum = periodOrders.length > 0 ? totalRevNum / periodOrders.length : 0

  const current = {
    totalRevenue: `$${totalRevNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    totalOrders: periodOrders.length,
    avgOrderValue: `$${avgOrderNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    categories: [
      {
        name: 'SMART PHONE (Apple iPhone)',
        revenue: `$${totalRevNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        percent: '100%',
      },
    ],
  }

  const handleExport = () => {
    const listToExport = periodOrders.length > 0 ? periodOrders : realOrders
    exportOrdersToCsv(listToExport, `MiniStore_Revenue_Report_${period}.csv`)
    setToastMessage('កំពុងទាញយករបាយការណ៍លក់ជាឯកសារ CSV...')
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <DashboardLayout>
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
              របាយការណ៍លក់
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              វិភាគស្ថិតិចំណូល ការបញ្ជាទិញ និងចំណាត់ថ្នាក់មុខទំនិញលក់ដាច់ប្រចាំហាង
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Filter */}
            <div className="inline-flex border border-neutral-300 bg-white">
              {[
                { label: 'ថ្ងៃនេះ', value: 'today' },
                { label: 'សប្តាហ៍នេះ', value: 'week' },
                { label: 'ខែនេះ', value: 'month' },
                { label: 'ឆ្នាំនេះ', value: 'year' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setPeriod(f.value)}
                  className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                    period === f.value
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="h-8 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">ទាញយករបាយការណ៍</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-neutral-200 space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              ចំណូលសរុប
            </span>
            <span className="text-3xl font-black font-mono text-black block tracking-tight">
              <CountUp value={current.totalRevenue} />
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-neutral-100">
              <TrendingUp size={13} />
              <span>កើនឡើងជាលំដាប់</span>
            </span>
          </div>

          <div className="p-5 bg-white border border-neutral-200 space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              ចំនួនបញ្ជាទិញ
            </span>
            <span className="text-3xl font-black font-mono text-black block tracking-tight">
              <CountUp value={current.totalOrders} />
            </span>
            <span className="text-xs text-neutral-500 font-medium pt-1 border-t border-neutral-100">
              ប្រតិបត្តិការជោគជ័យ
            </span>
          </div>

          <div className="p-5 bg-white border border-neutral-200 space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              តម្លៃបញ្ជាទិញមធ្យម
            </span>
            <span className="text-3xl font-black font-mono text-black block tracking-tight">
              <CountUp value={current.avgOrderValue} />
            </span>
            <span className="text-xs text-neutral-500 font-medium pt-1 border-t border-neutral-100">
              ក្នុងមួយវិក្កយបត្រ
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h2 className="text-base font-black text-black tracking-tight">
              ការបែងចែកចំណូលតាមប្រភេទមុខទំនិញ
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Calendar size={13} />
              <span className="capitalize">{period} report</span>
            </div>
          </div>

          <div className="space-y-4">
            {current.categories.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-black">{c.name}</span>
                  <span className="font-mono text-black">{c.revenue} ({c.percent})</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-black rounded-none"
                    style={{ width: c.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
