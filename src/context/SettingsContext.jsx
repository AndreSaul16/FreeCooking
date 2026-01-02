import { createContext, useContext, useState, useEffect } from 'react';
import { applyTheme, applyDarkMode } from '../services/themeService';

// Valores por defecto de configuración
const DEFAULT_SETTINGS = {
    // Finanzas
    targetMarginPercent: 70,
    taxPercent: 10,
    pricesIncludeTax: false,
    psychologicalPricing: false, // Desactivado por defecto para precios exactos

    // Labor
    laborCostPerHour: 12,
    socialSecurityPercent: 30,

    // Apariencia
    theme: 'emerald', // 'emerald' | 'amber' | 'violet'
    darkMode: true
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        // Intentar cargar desde localStorage
        const saved = localStorage.getItem('freecooking-settings');
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error parsing saved settings:', e);
            }
        }
        return DEFAULT_SETTINGS;
    });

    // Aplicar tema y dark mode cuando cambian los settings
    useEffect(() => {
        applyTheme(settings.theme);
        applyDarkMode(settings.darkMode);
    }, [settings.theme, settings.darkMode]);

    // Guardar en localStorage cuando cambien los settings
    useEffect(() => {
        localStorage.setItem('freecooking-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    // Helpers para cálculos derivados
    const getRealLaborCost = () => {
        return settings.laborCostPerHour * (1 + settings.socialSecurityPercent / 100);
    };

    const getMarginMultiplier = () => {
        return 1 / (1 - settings.targetMarginPercent / 100);
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            updateSettings,
            resetToDefaults,
            getRealLaborCost,
            getMarginMultiplier
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export default SettingsContext;
