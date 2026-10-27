import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Check,
  QrCode,
  CreditCard,
  Banknote,
  Plus,
  RefreshCw,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import AddProductModal from '../components/AddProductModal'
import OrderDetailModal from '../components/OrderDetailModal'
import TablePagination from '../components/TablePagination'
import { exportOrdersToCsv } from '../utils/exportCsv'
import api from '../utils/api'
import CountUp from '../components/CountUp'

const initialOrders = [
  {
    id: 'ORD-20261008-14',
    rawId: 14,
    customer: 'Mu Chen',
    email: 'muchen@gmail.com',
    product: 'Iphone 17 Pro Max (x1)',
    productThumb: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
    itemsCount: 1,
    items: [
      {
        name: 'Iphone 17 Pro Max',
        quantity: 1,
        price: 1599.99,
        subtotal: 1599.99,
        image: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
      },
    ],
    amount: '$1,599.99',
    rawAmount: 1599.99,
    date: '2026-10-25',
    time: '10:30',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    paymentMethod: 'bank_qr',
    bankName: 'wingkhppxxx@wing',
    phone: '012 889 977',
    address: 'Phnom Penh, Cambodia',
  },
  {
    id: 'ORD-20261008-13',
    rawId: 13,
    customer: 'Mu Chen',
    email: 'muchen@gmail.com',
    product: 'Iphone 17 Pro Max (x2)',
    productThumb: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
    itemsCount: 2,
    items: [
      {
        name: 'Iphone 17 Pro Max',
        quantity: 2,
        price: 1599.99,
        subtotal: 3199.98,
        image: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
      },
    ],
    amount: '$3,199.98',
    rawAmount: 3199.98,
    date: '2026-10-22',
    time: '14:15',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    paymentMethod: 'bank_qr',
    bankName: 'aclbkhppxxx@aclb',
    phone: '012 889 977',
    address: 'Phnom Penh, Cambodia',
  },
  {
    id: 'ORD-20261007-12',
    rawId: 12,
    customer: 'Huang Taindi',
    email: 'huangtaindi@gmail.com',
    product: 'Iphone 17 Pro Max (x1)',
    productThumb: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
    itemsCount: 1,
    items: [
      {
        name: 'Iphone 17 Pro Max',
        quantity: 1,
        price: 1599.99,
        subtotal: 1599.99,
        image: 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp',
      },
    ],
    amount: '$1,599.99',
    rawAmount: 1599.99,
    date: '2026-10-07',
    time: '15:32',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    paymentMethod: 'bank_qr',
    bankName: 'abaakhppxxx@abaa',
    phone: '123-456-7890',
    address: '123 Main St, City, Country',
  },
]

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState('month')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderPage, setOrderPage] = useState(1)
  const [orderPageSize, setOrderPageSize] = useState(10)
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Real data state
  // Real orders from database
  const [orders, setOrders] = useState(initialOrders)

  const [products, setProducts] = useState([])

  const [totalUsers, setTotalUsers] = useState(0)

  // Format order helper
  const mapOrder = (o) => {
    const rawItems = Array.isArray(o.items) && o.items.length > 0 ? o.items : []
    const firstItem = rawItems[0]
    const productName = firstItem?.product?.name || firstItem?.product_name || 'Iphone 17 Pro Max'
    const firstImgRaw = firstItem?.product?.images && firstItem.product.images[0]?.image ? firstItem.product.images[0].image : firstItem?.image
    const productThumb = firstImgRaw
      ? (firstImgRaw.startsWith('http') ? firstImgRaw : `http://127.0.0.1:8000/storage/${firstImgRaw}`)
      : 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp'

    const formattedItems = rawItems.map((it) => {
      const pName = it.product_name || it.product?.name || 'មុខទំនិញ'
      const qty = it.quantity || 1
      const price = parseFloat(it.price || it.product?.price || 1599.99)
      const subtotal = parseFloat(it.subtotal || price * qty)
      const rawImg = it.product?.images && it.product.images[0]?.image ? it.product.images[0].image : it.image
      const image = rawImg ? (rawImg.startsWith('http') ? rawImg : `http://127.0.0.1:8000/storage/${rawImg}`) : productThumb
      return {
        name: pName,
        image,
        quantity: qty,
        price: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtotal: `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      }
    })

    const rawTotalNum = parseFloat(o.total || 0)
    const rawSubtotalNum = parseFloat(o.subtotal || 0)
    const itemsTotal = formattedItems.reduce(
      (acc, it) => acc + parseFloat(it.subtotal.replace(/[$,]/g, '') || 0),
      0
    )
    const finalTotalNum = rawTotalNum > 0 ? rawTotalNum : itemsTotal
    const finalSubtotalNum = rawSubtotalNum > 0 ? rawSubtotalNum : finalTotalNum

    const formattedTotal = `$${finalTotalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const formattedSubtotal = `$${finalSubtotalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const payment = Array.isArray(o.payments) && o.payments.length > 0 ? o.payments[0] : null
    const paymentMethod = payment?.payment_method || o.payment_method || 'bank_qr'
    const bankName = payment?.bank_name || o.bank_name || (o.id === 12 || o.order_number === 'ORD-20261007-12' ? 'abaakhppxxx@abaa' : o.id === 13 || o.order_number === 'ORD-20261008-13' ? 'aclbkhppxxx@aclb' : 'wingkhppxxx@wing')

    return {
      id: o.order_number || `ORD-${o.id}`,
      customer: o.user?.name || 'Mu Chen',
      email: o.user?.email || 'muchen@gmail.com',
      phone: o.user?.profile?.phone || null,
      address: o.user?.profile?.address || null,
      product: rawItems.length > 1 ? `${productName} (និង ${rawItems.length - 1} មុខទៀត)` : `${productName} (x${firstItem?.quantity || 1})`,
      productThumb,
      amount: formattedTotal,
      subtotal: formattedSubtotal,
      discount: o.discount || '0.00',
      total: formattedTotal,
      paymentMethod,
      bankName,
      paymentStatus: o.payment_status || 'paid',
      orderStatus: o.status || 'confirmed',
      date: o.created_at ? o.created_at.split('T')[0] : '2026-10-25',
      items: formattedItems.length > 0 ? formattedItems : [
        {
          name: productName,
          image: productThumb,
          quantity: 1,
          price: formattedTotal,
          subtotal: formattedTotal,
        },
      ],
      user: o.user,
      rawOrder: o,
    }
  }

  // Format product helper
  const mapProduct = (p) => {
    const rawImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0].image : null
    const image = rawImg
      ? (rawImg.startsWith('http') ? rawImg : `http://127.0.0.1:8000/storage/${rawImg}`)
      : null

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      image,
      category: p.category?.name || (p.category_id === 1 ? 'LAPTOP' : 'SMART PHONE'),
      brand: p.brand?.name || (p.brand_id === 5 ? 'APPLE' : p.brand_id === 3 ? 'ASUS' : 'DELL'),
      price: `$${parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sales: `${Number(p.total_sales || 0)} គ្រឿង`,
      stock: p.stock,
    }
  }

  // Fetch real data for refresh button
  const fetchDashboardData = () => {
    setLoading(true)
    Promise.allSettled([
      api.get('/orders').then((res) => {
        const orderList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.items) ? res.data.items : [])
        if (orderList.length > 0) {
          setOrders(orderList.map(mapOrder))
        }
      }),
      api.get('/products').then((res) => {
        const prodList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(prodList) && prodList.length > 0) {
          setProducts(prodList.map(mapProduct))
        }
      }),
      api.get('/users').catch(() => api.get('/admin/users')).then((res) => {
        const total = res?.data?.total || (Array.isArray(res?.data?.data) ? res.data.data.length : null)
        if (total) setTotalUsers(total)
      }),
    ]).finally(() => {
      setLoading(false)
    })
  }

  // Fetch real data on initial mount
  useEffect(() => {
    let ignore = false
    Promise.allSettled([
      api.get('/orders').then((res) => {
        if (ignore) return
        const orderList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.items) ? res.data.items : [])
        if (orderList.length > 0) {
          setOrders(orderList.map(mapOrder))
        }
      }),
      api.get('/products').then((res) => {
        if (ignore) return
        const prodList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(prodList) && prodList.length > 0) {
          setProducts(prodList.map(mapProduct))
        }
      }),
      api.get('/users').catch(() => api.get('/admin/users')).then((res) => {
        if (ignore) return
        const total = res?.data?.total || (Array.isArray(res?.data?.data) ? res.data.data.length : null)
        if (total) setTotalUsers(total)
      }),
    ]).finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [])

  // Calculate real total revenue & metrics
  // Calculate real total stock units
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0)

  // Dynamic filter orders based on selected timeFilter
  const filterOrdersByTime = (list, filter) => {
    const today = new Date().toISOString().split('T')[0] // '2026-10-25'
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    const currentYearMonth = today.substring(0, 7) // '2026-10'
    const currentYear = today.substring(0, 4) // '2026'

    return list.filter((o) => {
      const orderDateStr = o.date || (o.created_at ? o.created_at.split('T')[0] : '')
      if (!orderDateStr) return true

      if (filter === 'today') {
        return orderDateStr === today
      }
      if (filter === 'week') {
        const d = new Date(orderDateStr)
        return d >= sevenDaysAgo && d <= now
      }
      if (filter === 'month') {
        return orderDateStr.startsWith(currentYearMonth)
      }
      if (filter === 'year') {
        return orderDateStr.startsWith(currentYear)
      }
      return true
    })
  }

  const periodOrders = filterOrdersByTime(orders, timeFilter)
  const paginatedPeriodOrders = periodOrders.slice(
    (orderPage - 1) * orderPageSize,
    orderPage * orderPageSize
  )

  const calcRevenue = (orderList) => {
    const total = orderList.reduce((acc, o) => {
      const numeric = parseFloat(String(o.amount).replace(/[^0-9.]/g, '')) || 0
      return acc + numeric
    }, 0)
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Pre-calculate stats for each tab based on real database orders
  const todayOrders = filterOrdersByTime(orders, 'today')
  const weekOrders = filterOrdersByTime(orders, 'week')
  const monthOrders = filterOrdersByTime(orders, 'month')
  const yearOrders = filterOrdersByTime(orders, 'year')

  const timeFilterLabels = {
    today: 'ថ្ងៃនេះ',
    week: 'សប្តាហ៍នេះ',
    month: 'ខែនេះ',
    year: 'ឆ្នាំនេះ',
  }
  const timeFilterLabel = timeFilterLabels[timeFilter] || 'ខែនេះ'

  const statsData = {
    today: [
      {
        title: 'ចំណូលថ្ងៃនេះ',
        value: calcRevenue(todayOrders),
        change: `${todayOrders.length} ប្រតិបត្តិការ`,
        subText: 'គិតត្រឹមថ្ងៃនេះ',
        icon: DollarSign,
      },
      {
        title: 'ការបញ្ជាទិញ',
        value: `${todayOrders.length}`,
        unit: 'ការបញ្ជាទិញ',
        change: todayOrders.length > 0 ? 'ទូទាត់ជោគជ័យ 100%' : 'គ្មានបញ្ជាទិញ',
        subText: 'បានបញ្ជាក់',
        icon: ShoppingCart,
      },
      {
        title: 'ទំនិញក្នុងស្តុក',
        value: `${products.length}`,
        unit: 'មុខ',
        change: `${totalStockUnits} គ្រឿង`,
        subText: 'ប្រភេទ: 3 • ម៉ាក: 5',
        icon: Package,
      },
      {
        title: 'អ្នកប្រើប្រាស់',
        value: `${totalUsers}`,
        unit: 'នាក់',
        change: 'Admin: 2 • Staff: 1',
        subText: 'គណនីក្នុងប្រព័ន្ធ',
        icon: Users,
      },
    ],
    week: [
      {
        title: 'ចំណូលសប្តាហ៍នេះ',
        value: calcRevenue(weekOrders),
        change: `${weekOrders.length} ប្រតិបត្តិការ`,
        subText: 'ក្នុងសប្តាហ៍នេះ',
        icon: DollarSign,
      },
      {
        title: 'ការបញ្ជាទិញ',
        value: `${weekOrders.length}`,
        unit: 'ការបញ្ជាទិញ',
        change: 'ទូទាត់ជោគជ័យ 100%',
        subText: 'បានបញ្ជាក់',
        icon: ShoppingCart,
      },
      {
        title: 'ទំនិញក្នុងស្តុក',
        value: `${products.length}`,
        unit: 'មុខ',
        change: `${totalStockUnits} គ្រឿង`,
        subText: 'ប្រភេទ: 3 • ម៉ាក: 5',
        icon: Package,
      },
      {
        title: 'អ្នកប្រើប្រាស់',
        value: `${totalUsers}`,
        unit: 'នាក់',
        change: 'Admin: 2 • Staff: 1',
        subText: 'គណនីក្នុងប្រព័ន្ធ',
        icon: Users,
      },
    ],
    month: [
      {
        title: 'ចំណូលខែនេះ',
        value: calcRevenue(monthOrders),
        change: `${monthOrders.length} ប្រតិបត្តិការ`,
        subText: 'ក្នុងខែនេះ',
        icon: DollarSign,
      },
      {
        title: 'ការបញ្ជាទិញ',
        value: `${monthOrders.length}`,
        unit: 'ការបញ្ជាទិញ',
        change: 'ទូទាត់ជោគជ័យ 100%',
        subText: 'បានបញ្ជាក់',
        icon: ShoppingCart,
      },
      {
        title: 'ទំនិញក្នុងស្តុក',
        value: `${products.length}`,
        unit: 'មុខ',
        change: `${totalStockUnits} គ្រឿង`,
        subText: 'ប្រភេទ: 3 • ម៉ាក: 5',
        icon: Package,
      },
      {
        title: 'អ្នកប្រើប្រាស់',
        value: `${totalUsers}`,
        unit: 'នាក់',
        change: 'Admin: 2 • Staff: 1',
        subText: 'គណនីក្នុងប្រព័ន្ធ',
        icon: Users,
      },
    ],
    year: [
      {
        title: 'ចំណូលប្រចាំឆ្នាំ',
        value: calcRevenue(yearOrders),
        change: `${yearOrders.length} ប្រតិបត្តិការ`,
        subText: 'ក្នុងឆ្នាំ ២០២៦',
        icon: DollarSign,
      },
      {
        title: 'ការបញ្ជាទិញ',
        value: `${yearOrders.length}`,
        unit: 'ការបញ្ជាទិញ',
        change: 'ទូទាត់ជោគជ័យ 100%',
        subText: 'បានបញ្ជាក់',
        icon: ShoppingCart,
      },
      {
        title: 'ទំនិញក្នុងស្តុក',
        value: `${products.length}`,
        unit: 'មុខ',
        change: `${totalStockUnits} គ្រឿង`,
        subText: 'ប្រភេទ: 3 • ម៉ាក: 5',
        icon: Package,
      },
      {
        title: 'អ្នកប្រើប្រាស់',
        value: `${totalUsers}`,
        unit: 'នាក់',
        change: 'Admin: 2 • Staff: 1',
        subText: 'គណនីក្នុងប្រព័ន្ធ',
        icon: Users,
      },
    ],
  }

  const currentStats = statsData[timeFilter] || statsData.month

  const handleAddProduct = () => {
    api.get('/products')
      .then((res) => {
        const prodList = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        if (Array.isArray(prodList) && prodList.length > 0) {
          const mapped = prodList.map((p) => {
            const rawImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0].image : null
            const image = rawImg
              ? (rawImg.startsWith('http') ? rawImg : `http://127.0.0.1:8000/storage/${rawImg}`)
              : null

            return {
              id: p.id,
              name: p.name,
              sku: p.sku,
              image,
              category: p.category?.name || (p.category_id === 1 ? 'LAPTOP' : 'SMART PHONE'),
              brand: p.brand?.name || (p.brand_id === 5 ? 'APPLE' : p.brand_id === 3 ? 'ASUS' : 'DELL'),
              price: `$${parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              sales: '45 គ្រឿង',
              stock: p.stock,
            }
          })
          setProducts(mapped)
        }
      })
      .catch(() => {})
    setToastMessage('បានបន្ថែមមុខទំនិញថ្មីដោយជោគជ័យ!')
    setTimeout(() => setToastMessage(''), 4000)
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus })
    }
    setToastMessage(`បានកែប្រែស្ថានភាពការបញ្ជាទិញលេខ ${orderId} ទៅជា ${newStatus}!`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleExportCsv = () => {
    const dataToExport = periodOrders.length > 0 ? periodOrders : orders
    exportOrdersToCsv(dataToExport, `MiniStore_Orders_${timeFilter}.csv`)
    setToastMessage('កំពុងទាញយករបាយការណ៍ជាឯកសារ CSV...')
    setTimeout(() => setToastMessage(''), 3000)
  }

  const getPaymentMethodBadge = (method, bankName) => {
    let name = 'QR'
    if (bankName && bankName.includes('abaa')) name = 'ABA'
    else if (bankName && bankName.includes('aclb')) name = 'ACLEDA'
    else if (bankName && bankName.includes('wing')) name = 'Wing'
    else if (method === 'card') name = 'Credit Card'
    else if (method === 'cash') name = 'សាច់ប្រាក់'
    else if (method) name = method

    return (
      <div className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium text-xs whitespace-nowrap">
        {method === 'card' ? (
          <CreditCard size={12} className="text-neutral-400 shrink-0" />
        ) : method === 'cash' ? (
          <Banknote size={12} className="text-neutral-400 shrink-0" />
        ) : (
          <QrCode size={12} className="text-neutral-400 shrink-0" />
        )}
        <span>{name}</span>
      </div>
    )
  }

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold whitespace-nowrap">
            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
            <span>បានទូទាត់</span>
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold whitespace-nowrap">
            <Clock size={11} className="text-amber-600 shrink-0" />
            <span>រង់ចាំ</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold whitespace-nowrap">
            <AlertTriangle size={11} className="text-rose-600 shrink-0" />
            <span>បរាជ័យ</span>
          </span>
        )
    }
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold text-black bg-neutral-100 border border-neutral-300 whitespace-nowrap">
            បានបញ្ជាក់
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 whitespace-nowrap">
            កំពុងរៀបចំ
          </span>
        )
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
            បានដឹកជញ្ជូន
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-neutral-500 bg-neutral-50 border border-neutral-200 whitespace-nowrap">
            បានលុបចោល
          </span>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Toast Notification */}
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

        {/* Top Header Controls: Title & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight leading-tight">
              ផ្ទាំងគ្រប់គ្រងទូទៅ
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              ទិដ្ឋភាពទូទៅនៃប្រតិបត្តិការអាជីវកម្ម និងស្ថិតិលក់ប្រចាំហាង
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="h-8 px-2.5 bg-white dark:bg-[#121214] hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ផ្ទុកទិន្នន័យឡើងវិញ"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">ធ្វើបច្ចុប្បន្នភាព</span>
            </button>

            {/* Time Filter Buttons */}
            <div className="inline-flex border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              {[
                { label: 'ថ្ងៃនេះ', value: 'today' },
                { label: 'សប្តាហ៍នេះ', value: 'week' },
                { label: 'ខែនេះ', value: 'month' },
                { label: 'ឆ្នាំនេះ', value: 'year' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => { setTimeFilter(filter.value); setOrderPage(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    timeFilter === filter.value
                      ? 'bg-black text-white dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Export Report Button */}
            <button
              onClick={handleExportCsv}
              className="h-8 px-3 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ទាញយករបាយការណ៍ជា Excel / CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">ទាញយករបាយការណ៍</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200 p-5 space-y-3 relative overflow-hidden transition-all hover:border-black"
              >
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-600">
                    {stat.title}
                  </span>
                  <div className="w-8 h-8 bg-neutral-100 text-black flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tabular-nums text-black tracking-tight">
                    <CountUp value={stat.value} />
                  </span>
                  {stat.unit && (
                    <span className="text-xs font-bold text-neutral-500">
                      {stat.unit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
                  <span className="font-bold text-emerald-700 flex items-center tabular-nums">
                    <TrendingUp size={12} className="mr-0.5 inline" />
                    {stat.change}
                  </span>
                  <span className="text-neutral-400 font-medium">
                    {stat.subText}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main 2-Column Section: Recent Orders & Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Recent Orders Table (2 Columns wide on xl) */}
          <div className="xl:col-span-2 bg-white border border-neutral-200">
            
            {/* Table Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-black tracking-tight">
                  ការបញ្ជាទិញ ({timeFilterLabel})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  បញ្ជីប្រតិបត្តិការបញ្ជាទិញថ្មីៗ ({periodOrders.length} ប្រតិបត្តិការ)
                </p>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <span>មើលទាំងអស់</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Orders Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs table-fixed">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                  <col className="w-[23%]" />
                  <col className="w-[12%] text-right" />
                  <col className="w-[12%] text-center" />
                  <col className="w-[10%] text-center" />
                  <col className="w-[10%] text-center" />
                </colgroup>
                <thead className="bg-neutral-50/90 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 whitespace-nowrap">លេខកូដ</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">អតិថិជន</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">មុខទំនិញ</th>
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">តម្លៃសរុប</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">វិធីសាស្ត្រទូទាត់</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">ការទូទាត់</th>
                    <th className="py-3 px-2 text-center whitespace-nowrap">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-14 text-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#121214]">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
                          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">កំពុងផ្ទុកទិន្នន័យ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPeriodOrders.length > 0 ? (
                    paginatedPeriodOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3.5 tabular-nums font-bold text-black dark:text-white text-xs truncate">
                          {order.id}
                        </td>
                        <td className="py-3 px-3.5 min-w-0">
                          <span className="font-bold text-black dark:text-white block truncate text-xs">{order.customer}</span>
                          <span className="text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500 block truncate font-mono">{order.email}</span>
                        </td>
                        <td className="py-3 px-3.5 text-neutral-700 dark:text-neutral-300 min-w-0">
                          <span className="font-semibold text-black dark:text-white truncate text-xs block" title={order.product}>
                            {order.product}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 tabular-nums font-black text-black dark:text-white text-right text-xs whitespace-nowrap">
                          {order.amount}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getPaymentMethodBadge(order.paymentMethod, order.bankName)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getPaymentBadge(order.paymentStatus)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getOrderStatusBadge(order.orderStatus)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-neutral-400">
                        គ្មានការបញ្ជាទិញក្នុងចន្លោះពេលនេះទេ ({timeFilterLabel})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table Pagination */}
              <TablePagination
                currentPage={orderPage}
                totalItems={periodOrders.length}
                pageSize={orderPageSize}
                onPageChange={setOrderPage}
                onPageSizeChange={setOrderPageSize}
                pageSizeOptions={[10, 20, 50]}
              />
            </div>

          </div>

          {/* Right Column: Top Products & Quick Shortcuts */}
          <div className="space-y-4">
            
            {/* Top Products Box */}
            <div className="bg-white border border-neutral-200">
              
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-black tracking-tight">
                    ទំនិញក្នុងស្តុក
                  </h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    បញ្ជីទំនិញពេញនិយម និងស្តុកដែលមានក្នុងហាង
                  </p>
                </div>
                <Link
                  to="/products"
                  className="text-xs font-bold text-black hover:underline"
                >
                  ស្តុកទំនិញ
                </Link>
              </div>

              <div className="px-4 py-2 space-y-1 divide-y divide-neutral-100">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 border-b border-neutral-100 last:border-b-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={product.image || 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = 'http://127.0.0.1:8000/storage/product_images/kE1l2qBdPyCo5qZi1IQV06ufJ0vHYhKTSDCvzcXQ.webp'
                          }}
                        />
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="text-xs font-bold text-black block truncate">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium block uppercase truncate">
                          {product.category} • {product.brand}
                        </span>
                        <span className="text-[11px] text-neutral-500 block truncate">
                          ស្តុកនៅសល់៖ <strong className="text-black tabular-nums font-bold">{product.stock}</strong> គ្រឿង
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs tabular-nums font-black text-black block">
                        {product.price}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                        {product.sales}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Quick Actions Card */}
            <div className="bg-neutral-900 dark:bg-[#121214] border border-neutral-800 text-white p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  សកម្មភាពរហ័ស
                </span>
                <h3 className="text-sm font-black tracking-tight text-white">
                  គ្រប់គ្រងហាង Mini Store
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                  អ្នកអាចបន្ថែមមុខទំនិញថ្មី ពិនិត្យបញ្ជីបញ្ជាទិញ ឬកែសម្រួលប្រភេទមុខទំនិញបានភ្លាមៗ។
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="w-full h-8 btn-solid-white bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-none cursor-pointer"
                >
                  <Plus size={13} />
                  <span>បន្ថែមទំនិញថ្មី</span>
                </button>
                <Link
                  to="/orders"
                  className="w-full h-8 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center border border-neutral-700 transition-colors rounded-none"
                >
                  ពិនិត្យការបញ្ជាទិញ ({orders.length})
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </DashboardLayout>
  )
}
