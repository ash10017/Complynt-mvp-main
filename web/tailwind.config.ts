import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#0071e3',
          dark:    '#0058b0',
          light:   '#e8f2ff',
          mid:     'rgba(0,113,227,0.08)',
        },
        text: {
          DEFAULT: '#1d1d1f',
          2:       '#6e6e73',
          3:       '#a1a1a6',
        },
        bg: {
          DEFAULT: '#ffffff',
          alt:     '#f5f5f7',
        },
        border: {
          DEFAULT: '#d2d2d7',
          lt:      '#e5e5ea',
        },
        green:  { DEFAULT: '#34c759', light: 'rgba(52,199,89,0.10)' },
        orange: '#ff9f0a',
        red:    '#ff3b30',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm:  '8px',
        md:  '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,.08)',
        md: '0 4px 16px rgba(0,0,0,.08)',
        lg: '0 8px 32px rgba(0,0,0,.10)',
      },
    },
  },
  plugins: [],
}

export default config
