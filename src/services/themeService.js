// Definición de temas disponibles
export const THEMES = {
    emerald: {
        name: 'Emerald',
        colors: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
        }
    },
    amber: {
        name: 'Amber',
        colors: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
        }
    },
    violet: {
        name: 'Violet',
        colors: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
        }
    }
};

/**
 * Aplica el tema seleccionado actualizando CSS variables
 */
export function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    const root = document.documentElement;

    // Aplicar colores del tema como CSS variables
    Object.entries(theme.colors).forEach(([shade, color]) => {
        root.style.setProperty(`--color-primary-${shade}`, color);
    });

    // Guardar tema en localStorage
    localStorage.setItem('theme', themeName);
}

/**
 * Aplica o remueve la clase 'dark' del HTML
 */
export function applyDarkMode(isDark) {
    const root = document.documentElement;

    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    // Guardar preferencia
    localStorage.setItem('darkMode', isDark.toString());
}

/**
 * Obtiene las preferencias guardadas
 */
export function getSavedPreferences() {
    return {
        theme: localStorage.getItem('theme') || 'emerald',
        darkMode: localStorage.getItem('darkMode') === 'true'
    };
}

/**
 * Inicializa el tema y dark mode desde localStorage
 */
export function initializeTheme() {
    const { theme, darkMode } = getSavedPreferences();
    applyTheme(theme);
    applyDarkMode(darkMode);
}
