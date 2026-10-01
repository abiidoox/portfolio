/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Digital laboratory palette — deep, cool, with warm signal accent.
        ink: {
          950: '#05070c',
          900: '#080b12',
          850: '#0b0f18',
          800: '#0f141f',
          700: '#161d2b',
          600: '#1e2738',
          500: '#2a3547'
        },
        signal: {
          DEFAULT: '#ff5e3a',
          soft: '#ff8c66',
          deep: '#d43f1c',
          glow: 'rgba(255, 94, 58, 0.45)'
        },
        ion: {
          DEFAULT: '#38bdf8',
          soft: '#7dd3fc',
          deep: '#0284c7'
        },
        plasma: '#c084fc',
        mint: '#4ade80'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.75rem, 3.4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }]
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem'
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,.04) inset, 0 24px 60px -24px rgba(0,0,0,.75)',
        'signal-glow': '0 18px 44px -16px rgba(255,94,58,.5)',
        'ion-glow': '0 18px 44px -16px rgba(56,189,248,.42)',
        lift: '0 34px 70px -28px rgba(0,0,0,.85)'
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(8,11,18,0) 0%, rgba(8,11,18,.85) 70%, #080b12 100%)',
        'signal-sweep': 'linear-gradient(100deg, #ff5e3a 0%, #ff8c66 45%, #38bdf8 100%)',
        // Filled surfaces that carry white label text. The vivid sweep above is
        // 2.1:1 to 3.2:1 against white, so anything with text on it needs this
        // deeper range (5.2:1 to 7.3:1) to clear WCAG AA.
        'signal-sweep-deep': 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)',
        'ion-sweep': 'linear-gradient(100deg, #38bdf8 0%, #7dd3fc 50%, #c084fc 100%)'
      },
      transitionTimingFunction: {
        // Signature easing family: decelerate on entrance, gentle settle on hover.
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        float: 'cubic-bezier(0.4, 0, 0.2, 1)',
        swift: 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 28px, 0)' },
          '100%': { opacity: '1', transform: 'none' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'none' }
        },
        'slide-left': {
          '0%': { opacity: '0', transform: 'translate3d(-32px, 0, 0)' },
          '100%': { opacity: '1', transform: 'none' }
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translate3d(32px, 0, 0)' },
          '100%': { opacity: '1', transform: 'none' }
        },
        // Ambient: slow, low-amplitude, GPU-friendly (transform + opacity only).
        'grid-drift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(0, 56px, 0)' }
        },
        'float-soft': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: '1' },
          '25%': { transform: 'translate3d(3px, -9px, 0) rotate(-1deg)', opacity: '0.96' },
          '50%': { transform: 'translate3d(0, -14px, 0) rotate(0deg)', opacity: '0.92' },
          '75%': { transform: 'translate3d(-3px, -9px, 0) rotate(1deg)', opacity: '0.96' }
        },
        // Reduced-motion ambient: 4px drift, slow breath, no large travel.
        'float-calm': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translate3d(0, -4px, 0) rotate(0deg)', opacity: '0.88' }
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' }
        },
        'blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        },
        'marquee-x': {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' }
        },
        'shine': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' }
        },
        'caret': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.35)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'slide-left': 'slide-left 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right': 'slide-right 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'grid-drift': 'grid-drift 24s linear infinite',
        'float-soft': 'float-soft var(--chip-dur, 4.4s) cubic-bezier(0.4,0,0.2,1) var(--chip-delay, 0s) infinite',
        'float-calm': 'float-calm 9s cubic-bezier(0.4,0,0.2,1) var(--chip-delay, 0s) infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        blink: 'blink 1.1s step-end infinite',
        'marquee-x': 'marquee-x 38s linear infinite',
        shine: 'shine 0.85s cubic-bezier(0.4,0,0.2,1)',
        caret: 'caret 1.1s step-end infinite',
        'pulse-soft': 'pulse-soft 2.2s cubic-bezier(0.4,0,0.2,1) infinite'
      },
      maxWidth: {
        shell: '78rem'
      }
    }
  },
  plugins: []
};
