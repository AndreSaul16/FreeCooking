/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Habilita dark mode con clase CSS
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
            },
            // Spacing premium para márgenes gigantes (diseño showcase)
            spacing: {
                '18': '4.5rem',   // 72px
                '22': '5.5rem',   // 88px
                '26': '6.5rem',   // 104px
                '30': '7.5rem',   // 120px
                '128': '32rem',   // 512px - márgenes gigantes
                '144': '36rem',   // 576px
                '160': '40rem',   // 640px
            },
            // Font families premium
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            // Custom easing curves (sensación premium)
            transitionTimingFunction: {
                'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
                'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
                'circ-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
            },
            // Custom animations
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'scale-in': 'scale-in 0.4s ease-out',
            },
        },
    },
    plugins: [],
}
