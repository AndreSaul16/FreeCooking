import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Users, Palette, Save, RotateCcw, Sun, Moon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { THEMES } from '../services/themeService';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { FileText, Download, RefreshCw } from 'lucide-react';
import UserProfile from './UserProfile';

export default function SettingsPage() {
    const { settings, updateSettings, resetToDefaults, getRealLaborCost, getMarginMultiplier } = useSettings();
    const [hasChanges, setHasChanges] = useState(false);
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const isAdmin = currentUser?.email === 'andresaul16s@gmail.com';

    const fetchLogs = async () => {
        if (!isAdmin) return;
        setLoadingLogs(true);
        try {
            const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(fetchedLogs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const downloadLogs = () => {
        const text = logs.map(log =>
            `[${new Date(log.timestamp?.seconds * 1000).toLocaleString()}] [${log.level}] ${log.message} - ${JSON.stringify(log.details)}`
        ).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_logs_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleChange = (key, value) => {
        updateSettings({ [key]: value });
        setHasChanges(true);
    };

    const handleReset = () => {
        if (confirm('¿Restablecer toda la configuración a valores por defecto?')) {
            resetToDefaults();
            setHasChanges(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="h-7 w-7 text-primary-500" />
                        Configuración del Negocio
                    </h2>
                    <p className="text-white/60 mt-1">Personaliza los cálculos financieros y la apariencia</p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-xl rounded-lg transition-colors"
                >
                    <RotateCcw className="h-4 w-4" />
                    Restablecer
                </button>
            </div>

            {/* Sección Perfil de Usuario */}
            <UserProfile />

            {/* Sección Finanzas */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-white">Configuración Financiera</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Margen de Beneficio */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                            Margen de Beneficio Objetivo (%)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={settings.targetMarginPercent}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                const num = parseFloat(value) || 70;
                                if (num <= 95) handleChange('targetMarginPercent', num);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-gray-500">
                            Equivale a multiplicador: <span className="font-semibold text-primary-400">×{getMarginMultiplier().toFixed(2)}</span>
                        </p>
                    </div>

                    {/* IVA */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                            IVA / Impuestos (%)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={settings.taxPercent}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                const num = parseFloat(value) || 10;
                                if (num <= 50) handleChange('taxPercent', num);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Toggle Precios Incluyen IVA */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.pricesIncludeTax}
                                onChange={(e) => handleChange('pricesIncludeTax', e.target.checked)}
                                className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-white/80">¿Los precios de carta incluyen impuestos?</span>
                                <p className="text-xs text-gray-500">
                                    Si está activado, el precio sugerido YA incluirá el IVA
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Sección Mano de Obra */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-white">Costes de Mano de Obra</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Coste Hora */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                            Coste por Hora Promedio (€)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={settings.laborCostPerHour}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                handleChange('laborCostPerHour', parseFloat(value) || 12);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Seguridad Social */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                            % Seguridad Social / Coste Empresa
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={settings.socialSecurityPercent}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                const num = parseFloat(value) || 30;
                                if (num <= 60) handleChange('socialSecurityPercent', num);
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Display Coste Real */}
                    <div className="md:col-span-2 bg-gray-900/50 border border-white/20 shadow-lg rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Coste Real por Hora (con cargas):</span>
                            <span className="text-lg font-bold text-primary-400">{getRealLaborCost().toFixed(2)}€/h</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Por minuto: {(getRealLaborCost() / 60).toFixed(3)}€/min
                        </p>
                    </div>
                </div>
            </div>

            {/* Sección Apariencia */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-white">Apariencia</h3>
                </div>

                <div className="space-y-6">
                    {/* Dark/Light Mode Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Modo de Color</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleChange('darkMode', false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${!settings.darkMode
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                    : 'border-gray-600 text-white/60 hover:border-gray-500'
                                    }`}
                            >
                                <Sun className="h-5 w-5" />
                                Claro
                            </button>
                            <button
                                onClick={() => handleChange('darkMode', true)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${settings.darkMode
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                    : 'border-gray-600 text-white/60 hover:border-gray-500'
                                    }`}
                            >
                                <Moon className="h-5 w-5" />
                                Oscuro
                            </button>
                        </div>
                    </div>

                    {/* Selector de Tema */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Tema de Color</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.entries(THEMES).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() => handleChange('theme', key)}
                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center sm:block ${settings.theme === key
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: theme.colors[600] }}
                                        />
                                        <span className={`font-medium ${settings.theme === key ? 'text-primary-400' : 'text-white/80'}`}>
                                            {theme.name}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 w-full max-w-[120px]">
                                        {[600, 500, 400].map(shade => (
                                            <div
                                                key={shade}
                                                className="h-2 flex-1 rounded"
                                                style={{ backgroundColor: theme.colors[shade] }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 flex gap-3">
                <SettingsIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Configuración Persistente</p>
                    <p className="text-blue-300/80">
                        Los cambios se guardan automáticamente en tu navegador y se aplicarán a todos los cálculos futuros.
                    </p>
                </div>
            </div>

            {/* System Logs (Admin Only) */}
            {isAdmin && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            <h3 className="text-lg font-semibold text-white">Logs del Sistema</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchLogs}
                                className="p-2 text-white/60 hover:text-white hover:bg-gray-700 rounded-lg"
                                title="Recargar Logs"
                            >
                                <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                            </button>
                            {logs.length > 0 && (
                                <button
                                    onClick={downloadLogs}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar .txt
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-white/80 space-y-2">
                        {logs.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                {loadingLogs ? 'Cargando logs...' : 'No hay logs cargados. Pulsa recargar.'}
                            </div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="border-b border-gray-800 pb-2 last:border-0">
                                    <div className="flex gap-2 mb-1">
                                        <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-400' :
                                            log.level === 'WARN' ? 'text-yellow-400' : 'text-blue-400'
                                            }`}>[{log.level}]</span>
                                        <span className="text-gray-500">
                                            {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Pending...'}
                                        </span>
                                        <span className="text-gray-600">[{log.platform}]</span>
                                    </div>
                                    <p className="text-white break-words">{log.message}</p>
                                    {log.details && log.details.length > 0 && (
                                        <pre className="mt-1 text-gray-500 overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

