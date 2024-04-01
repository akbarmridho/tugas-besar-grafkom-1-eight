/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--tp-base-background-color)',
        secondary: 'var(--tp-container-background-color)',
        tertiary: 'var(--tp-monitor-background-color)',
        input: 'var(--tp-input-background-color)',
        'input-active': 'var(--tp-input-background-color-active)',
        'input-hover': 'var(--tp-input-background-color-hover)',
        'input-fg': 'var(--tp-input-foreground-color)',
        'primary-fg': 'var(--tp-container-foreground-color)'
      }
    }
  },
  plugins: []
};
