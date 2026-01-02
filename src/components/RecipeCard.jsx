import React from 'react';
import { Edit2, Trash2, Clock, Users, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { CategoryIcon, getCategoryConfig } from '../utils/categoryIcons.jsx';

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
    const { settings } = useSettings();
    const targetMargin = settings?.targetMarginPercent || 70;

    const formatCurrency = (val) => {
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const formatPercent = (val) => {
        const num = Number(val);
        return isNaN(num) ? '0.0' : num.toFixed(1);
    };

    const getMarginClass = (margin) => {
        const val = parseFloat(margin) || 0;
        if (val >= targetMargin) return 'text-emerald-400';
        if (val >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getMarginIcon = (margin) => {
        const val = parseFloat(margin) || 0;
        return val >= 50 ? ArrowUp : ArrowDown;
    };

    const cost = parseFloat(recipe.costPerServing) || 0;
    const price = parseFloat(recipe.sellingPrice) || 0;

    let margin = recipe.margin;
    if (margin === undefined || margin === null) {
        if (price > 0) {
            margin = ((price - cost) / price) * 100;
        } else {
            margin = 0;
        }
    }

    const categoryConfig = getCategoryConfig(recipe.category);
    const hasLowMargin = parseFloat(margin) < targetMargin;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={`
                bg-white/10 backdrop-blur-xl 
                border shadow-lg rounded-2xl p-6
                transition-all hover:shadow-2xl hover:border-white/30
                ${hasLowMargin ? 'border-red-500/40' : 'border-white/20'}
            `}
            style={{
                boxShadow: hasLowMargin
                    ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(239, 68, 68, 0.15)'
                    : '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
        >
            <div className="space-y-5">
                {/* Header con Icono Visual */}
                <div className="flex items-start gap-4">
                    {/* Icono de Categoría */}
                    <CategoryIcon category={recipe.category} size="md" />

                    {/* Título y Meta */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-2 truncate">
                            {recipe.name}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryConfig.tagBgClass} ${categoryConfig.tagTextClass}`}>
                            {categoryConfig.label}
                        </span>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => onEdit(recipe)}
                            className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 rounded-xl transition-all flex items-center justify-center"
                            title="Editar"
                        >
                            <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => onDelete(recipe.id)}
                            className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all flex items-center justify-center"
                            title="Eliminar"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Meta datos secundarios */}
                <div className="flex items-center gap-4 text-white/40 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} raciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime || 0} min</span>
                    </div>
                    <div className="text-white/30 text-xs">
                        {recipe.ingredients?.length || 0} ingrediente{recipe.ingredients?.length !== 1 && 's'}
                    </div>
                </div>

                {/* SECCIÓN FINANCIERA - Mini Dashboard */}
                <div className="pt-5 border-t border-white/10 bg-black/20 -mx-6 px-6 py-4 rounded-b-2xl">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Columna Izquierda: Datos Básicos */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs uppercase tracking-wider">Costo</span>
                                <span className="text-white font-semibold">
                                    {formatCurrency(recipe.costPerServing)}€
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs uppercase tracking-wider">Venta</span>
                                <span className="text-white font-semibold">
                                    {formatCurrency(recipe.sellingPrice)}€
                                </span>
                            </div>
                        </div>

                        {/* Columna Derecha: MARGEN HERO */}
                        <div className="flex flex-col items-end justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                {React.createElement(getMarginIcon(margin), {
                                    className: `h-5 w-5 ${getMarginClass(margin)}`
                                })}
                                <span className={`font-black text-4xl ${getMarginClass(margin)} tracking-tight`}>
                                    {formatPercent(margin)}%
                                </span>
                            </div>

                            {/* Barra de Progreso Visual */}
                            <div className="w-full max-w-[120px] h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${parseFloat(margin) >= targetMargin
                                        ? 'bg-emerald-400'
                                        : parseFloat(margin) >= 50
                                            ? 'bg-amber-400'
                                            : 'bg-red-400'
                                        }`}
                                    style={{ width: `${Math.min(100, margin)}%` }}
                                />
                            </div>
                            <span className="text-white/40 text-xs mt-1">Margen</span>
                        </div>
                    </div>
                </div>

                {/* Alerta Elegante (si margen bajo) */}
                {hasLowMargin && (
                    <div className="flex items-start gap-2 text-xs text-red-300/90 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>Margen bajo. Considera ajustar el precio o reducir costos.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RecipeCard;
