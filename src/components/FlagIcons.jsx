// Pixel-perfect SVG Flag Icons for Cambodia and English (UK / US)
// Designed for high-contrast crisp rendering on all operating systems (including Windows)

export function CambodiaFlag({ className = "w-5 h-3.5", ...props }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`shrink-0 overflow-hidden rounded-none ${className}`}
      aria-label="ទង់ជាតិកម្ពុជា"
      {...props}
    >
      {/* Top Blue Stripe (25%) */}
      <rect width="30" height="5" fill="#032ea6" />
      {/* Center Red Stripe (50%) */}
      <rect y="5" width="30" height="10" fill="#e00025" />
      {/* Bottom Blue Stripe (25%) */}
      <rect y="15" width="30" height="5" fill="#032ea6" />

      {/* Angkor Wat Silhouette in White */}
      <g fill="#ffffff">
        {/* Tiered Base Platforms */}
        <rect x="7" y="13.2" width="16" height="0.6" />
        <rect x="8" y="12.5" width="14" height="0.6" />
        <rect x="8.8" y="11.8" width="12.4" height="0.6" />

        {/* Central Tower */}
        <path d="M14.5 7.2 L15 6 L15.5 7.2 Z" />
        <path d="M14.2 8.2 L15 7.2 L15.8 8.2 Z" />
        <rect x="14.2" y="8.2" width="1.6" height="1.2" />
        <rect x="13.8" y="9.4" width="2.4" height="2.4" />

        {/* Left Tower */}
        <path d="M11 8.8 L11.4 7.8 L11.8 8.8 Z" />
        <path d="M10.7 9.8 L11.4 8.8 L12.1 9.8 Z" />
        <rect x="10.7" y="9.8" width="1.4" height="2" />

        {/* Right Tower */}
        <path d="M18.2 8.8 L18.6 7.8 L19 8.8 Z" />
        <path d="M17.9 9.8 L18.6 8.8 L19.3 9.8 Z" />
        <rect x="17.9" y="9.8" width="1.4" height="2" />

        {/* Connecting Galleries / Walls */}
        <rect x="12.1" y="10.6" width="1.7" height="1.2" />
        <rect x="16.2" y="10.6" width="1.7" height="1.2" />
        <rect x="9.5" y="11.2" width="1.2" height="0.6" />
        <rect x="19.3" y="11.2" width="1.2" height="0.6" />
      </g>
    </svg>
  )
}

export function UkFlag({ className = "w-5 h-3.5", ...props }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={`shrink-0 overflow-hidden rounded-none ${className}`}
      aria-label="UK Flag"
      {...props}
    >
      <clipPath id="uk-clip">
        <path d="M0 0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-diag">
        <path d="M30 15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        {/* Navy Blue Base */}
        <rect width="60" height="30" fill="#012169" />
        {/* White Diagonals */}
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" strokeWidth="6" />
        {/* Red Diagonals (Counterchanged) */}
        <path
          d="M0 0 L60 30 M60 0 L0 30"
          clipPath="url(#uk-diag)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        {/* White Central Cross */}
        <path d="M30 0 v30 M0 15 h60" stroke="#ffffff" strokeWidth="10" />
        {/* Red Central Cross */}
        <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

export function UsFlag({ className = "w-5 h-3.5", ...props }) {
  return (
    <svg
      viewBox="0 0 38 20"
      className={`shrink-0 overflow-hidden rounded-none ${className}`}
      aria-label="US Flag"
      {...props}
    >
      {/* 13 Stripes */}
      <rect width="38" height="20" fill="#B22234" />
      <path
        d="M0 1.54h38M0 4.62h38M0 7.69h38M0 10.77h38M0 13.85h38M0 16.92h38"
        stroke="#ffffff"
        strokeWidth="1.54"
      />
      {/* Blue Canton */}
      <rect width="15.2" height="10.77" fill="#3C3B6E" />
      {/* Stars representation */}
      <g fill="#ffffff">
        <circle cx="2.5" cy="2" r="0.6" />
        <circle cx="5.5" cy="2" r="0.6" />
        <circle cx="8.5" cy="2" r="0.6" />
        <circle cx="11.5" cy="2" r="0.6" />
        <circle cx="4" cy="4" r="0.6" />
        <circle cx="7" cy="4" r="0.6" />
        <circle cx="10" cy="4" r="0.6" />
        <circle cx="13" cy="4" r="0.6" />
        <circle cx="2.5" cy="6" r="0.6" />
        <circle cx="5.5" cy="6" r="0.6" />
        <circle cx="8.5" cy="6" r="0.6" />
        <circle cx="11.5" cy="6" r="0.6" />
        <circle cx="4" cy="8" r="0.6" />
        <circle cx="7" cy="8" r="0.6" />
        <circle cx="10" cy="8" r="0.6" />
        <circle cx="13" cy="8" r="0.6" />
      </g>
    </svg>
  )
}

export default CambodiaFlag
