import { useEffect, useRef } from 'react'

export default function CountUp({ value, duration = 900, prefix = '', suffix = '' }) {
  const spanRef = useRef(null)

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    const strVal = String(value ?? 0)
    const isCurrency = strVal.includes('$') || prefix === '$'
    const hasDecimal = strVal.includes('.')

    const cleanNum = parseFloat(strVal.replace(/[^0-9.-]/g, ''))
    if (isNaN(cleanNum)) {
      el.textContent = `${strVal}${suffix}`
      return
    }

    const formatNumber = (val) => {
      if (isCurrency || hasDecimal) {
        const pfx = prefix || (isCurrency ? '$' : '')
        return `${pfx}${val.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}${suffix}`
      }
      return `${Math.round(val).toLocaleString('en-US')}${suffix}`
    }

    const startVal = 0
    const endVal = cleanNum
    const startTime = performance.now()
    let frameId

    // Smooth cubic easing: fast initial tick, gentle deceleration
    const easeOutCubic = (t) => {
      const p = t - 1
      return p * p * p + 1
    }

    const update = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const current = startVal + (endVal - startVal) * easedProgress

      el.textContent = formatNumber(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(update)
      } else {
        el.textContent = formatNumber(endVal)
      }
    }

    frameId = requestAnimationFrame(update)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [value, duration, prefix, suffix])

  const initialStr = String(value ?? 0)
  const isCurrency = initialStr.includes('$') || prefix === '$'
  const initialDisplay = isCurrency ? '$0.00' : '0'

  return <span ref={spanRef}>{initialDisplay}{suffix}</span>
}
