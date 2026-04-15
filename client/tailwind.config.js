/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        header: 'var(--bg-header)',
        card: 'var(--bg-card)',
        input: 'var(--bg-input)',
        btn: 'var(--bg-btn)',
        'btn-hover': 'var(--bg-btn-hover)',
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        inverse: 'var(--text-inverse)',
        'border-soft': 'var(--border-soft)',
        'border-hard': 'var(--border-hard)',
        primary: 'var(--accent-primary)',
        'primary-hover': 'var(--accent-hover)',
      }
    },
  },
  plugins: [],
}