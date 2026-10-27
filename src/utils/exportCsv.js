/**
 * Utility to export data to CSV and trigger browser download
 */
export function exportOrdersToCsv(orders, filename = 'mini-store-orders.csv') {
  if (!orders || orders.length === 0) return

  const headers = ['Order ID', 'Customer', 'Email', 'Product', 'Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Date']
  
  const rows = orders.map((o) => [
    `"${o.id || ''}"`,
    `"${(o.customer || '').replace(/"/g, '""')}"`,
    `"${o.email || ''}"`,
    `"${(o.product || '').replace(/"/g, '""')}"`,
    `"${o.amount || ''}"`,
    `"${o.paymentMethod || 'QR'}"`,
    `"${o.paymentStatus || ''}"`,
    `"${o.orderStatus || ''}"`,
    `"${o.date || ''}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

