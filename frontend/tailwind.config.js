/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colors referencing CSS variables
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        simon: {
          green: 'var(--simon-green)',
          'green-dim': 'var(--simon-green-dim)',
          red: 'var(--simon-red)',
          'red-dim': 'var(--simon-red-dim)',
          yellow: 'var(--simon-yellow)',
          'yellow-dim': 'var(--simon-yellow-dim)',
          blue: 'var(--simon-blue)',
          'blue-dim': 'var(--simon-blue-dim)',
        },
        surface: {
          success: 'var(--surface-success)',
          error: 'var(--surface-error)',
          warning: 'var(--surface-warning)',
          info: 'var(--surface-info)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          emphasis: 'var(--border-emphasis)',
        },
      },
      // Font families
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      // Font sizes with line heights
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '1.5' }],
        'sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'base': ['var(--text-base)', { lineHeight: '1.5' }],
        'lg': ['var(--text-lg)', { lineHeight: '1.4' }],
        'xl': ['var(--text-xl)', { lineHeight: '1.3' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.25' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.2' }],
        '4xl': ['var(--text-4xl)', { lineHeight: '1.1' }],
        '5xl': ['var(--text-5xl)', { lineHeight: '1.1' }],
      },
      // Spacing using 8pt grid
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      // Border radius
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      // Box shadows
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'glow-green': 'var(--glow-green)',
        'glow-red': 'var(--glow-red)',
        'glow-yellow': 'var(--glow-yellow)',
        'glow-blue': 'var(--glow-blue)',
      },
      // Animation durations
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
      },
      // Custom easing
      transitionTimingFunction: {
        'default': 'var(--ease-default)',
        'spring': 'var(--ease-spring)',
      },
      // Keyframe animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-slide-up': 'fade-slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
