/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        bg: '#070b14',
        surface: 'rgba(16, 24, 45, 0.6)',
        primary: '#e2c97f',
        secondary: '#8b9dc3',
        accent: '#c77dff',
        text: '#f0e6d3',
        muted: '#6b7a9c',
        'card-bg': 'rgba(255, 255, 255, 0.03)',
        glow: 'rgba(226, 201, 127, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
        display: ['Cinzel Decorative', 'serif'],
      },
      borderRadius: {
        card: '12px',
        banner: '24px',
        pill: '100px',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'translateY(-50%) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-50%) scale(1.1)', opacity: '0.9' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulse: 'pulse 6s ease-in-out infinite',
        twinkle: 'twinkle 8s ease-in-out infinite',
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
      backgroundImage: {
        'hero-cover':
          "url('https://kimi-web-img.moonshot.cn/img/thumbs.dreamstime.com/632bbbec09a4fd8e33e19ef0f398239abcbe8838.jpg')",
        'featured-cover':
          "url('https://kimi-web-img.moonshot.cn/img/wallpapersok.com/d7adfa8227f805e9ff8c287de2a755f3d6b6c7eb.jpg')",
        starfield:
          'radial-gradient(2px 2px at 20px 30px, rgba(226,201,127,0.3), transparent), radial-gradient(2px 2px at 40px 70px, rgba(139,157,195,0.2), transparent), radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.2), transparent), radial-gradient(2px 2px at 160px 120px, rgba(226,201,127,0.2), transparent), radial-gradient(1px 1px at 230px 80px, rgba(255,255,255,0.15), transparent), radial-gradient(2px 2px at 300px 200px, rgba(139,157,195,0.15), transparent), radial-gradient(1px 1px at 400px 50px, rgba(255,255,255,0.1), transparent), radial-gradient(2px 2px at 500px 300px, rgba(226,201,127,0.15), transparent)',
      },
    },
  },
  plugins: [],
};
