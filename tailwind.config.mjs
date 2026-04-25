import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md}'],
  theme: {
    extend: {
      colors: {
        'ms-bg':               '#F7F6F1',
        'ms-card':             '#FFFFFF',
        'ms-text':             '#2C2C2C',
        'ms-muted':            '#6B6860',
        'ms-accent':           '#3B7A6A',
        'ms-accent-light':     '#E8F0ED',
        'ms-accent-hover':     '#2E6254',
        'ms-border':           '#E8E6DF',
        'ms-disclaimer-bg':    '#FDF6EC',
        'ms-disclaimer-border':'#E8D9C0',
        'ms-disclaimer-text':  '#7A6840',
      },
      fontFamily: {
        heading: ['Literata', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', '"Segoe UI"', 'sans-serif'],
      },
      maxWidth: {
        content: '860px',
      },
      borderRadius: {
        card: '12px',
      },
      screens: {
        'sm-ms': '560px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease both',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [typography()],
};
