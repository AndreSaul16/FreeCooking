import React from 'react';
import { Edit2, Trash2, Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
    const { settings } = useSettings();
    const targetMargin = settings?.targetMarginPercent || 70; // Fallback seguro

    // Helper para formatear números de forma segura
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
        if (val >= targetMargin) return 'text-green-400';
        if (val >= 50) return 'text-yellow-400'; // 50% como "medio" fijo o podría ser configurable
        return 'text-red-400';
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

    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-primary-500/50 transition-colors shadow-lg hover:shadow-primary-500/10"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{recipe.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            {recipe.category || 'General'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(recipe)}
                            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(recipe.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} raciones</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime} min</span>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Costo por ración</span>
                        <span className="text-white font-medium">
                            {formatCurrency(recipe.costPerServing)}€
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Precio Venta</span>
                        <span className="text-white font-medium">
                            {formatCurrency(recipe.sellingPrice)}€
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-400 text-sm">Margen</span>
                        </div>
                        <span className={`font-bold ${getMarginClass(margin)}`}>
                            {formatPercent(margin)}%
                        </span>
                    </div>
                </div>

                {/* Alerta de margen bajo */}
                {parseFloat(margin) < targetMargin && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-red-400 bg-red-900/20 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>El margen es bajo. Considera ajustar el precio o reducir costos.</p>
                    </div>
                )}

                {/* Ingredients count */}
                <div className="mt-3 text-xs text-gray-500">
                    {recipe.ingredients?.length || 0} ingrediente{recipe.ingredients?.length !== 1 && 's'} ·
                    {recipe.servings} ración{recipe.servings !== 1 && 'es'}
                </div>
            </div>
        </motion.div>
    );
};

export default RecipeCard;
