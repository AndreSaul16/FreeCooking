import React, { useState } from 'react';
import useRecipeStore from '../store/recipeStore';
import { TrendingUp, DollarSign, Utensils, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalesRegister from './SalesRegister';

export default function Dashboard() {
    const { recipes, getStats, masterIngredients } = useRecipeStore();
    const stats = getStats();
    const [salesModalOpen, setSalesModalOpen] = useState(false);

    // Identificar ingredientes más usados (Top 5)
    const getTopIngredients = () => {
        const usage = {};
        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                usage[ing.name] = (usage[ing.name] || 0) + 1;
            });
        });
        return Object.entries(usage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    // Identificar recetas por rentabilidad
    const getProfitability = () => {
        return recipes
            .map(r => ({
                name: r.name,
                margin: r.sellingPrice ? ((r.sellingPrice - r.primeCost) / r.sellingPrice) * 100 : 0
            }))
            .sort((a, b) => b.margin - a.margin)
            .slice(0, 5);
    };

    // Alertas de Stock Bajo
    const getLowStockIngredients = () => {
        return masterIngredients.filter(ing =>
            (ing.currentStock || 0) <= (ing.minStock || 0) && (ing.minStock > 0)
        );
    };

    const lowStock = getLowStockIngredients();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Panel de Control</h2>
                <button
                    onClick={() => setSalesModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl"
                    style={{ boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}
                >
                    <ShoppingCart className="h-5 w-5" />
                    Registrar Venta
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/15 rounded-lg">
                            <Utensils className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Total Recetas</p>
                            <p className="text-2xl font-bold text-white">{stats.totalRecipes}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/15 rounded-lg">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Beneficio Promedio</p>
                            <p className="text-2xl font-bold text-white">
                                {stats.avgPrimeCost > 0 ? ((1 - (stats.avgPrimeCost / (stats.avgCost * 3))) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/15 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-sky-400" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Ingredientes</p>
                            <p className="text-2xl font-bold text-white">{stats.totalIngredients}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/15 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Alertas Stock</p>
                            <p className="text-2xl font-bold text-white">{lowStock.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                {lowStock.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-red-500/30 shadow-lg lg:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            Alertas de Stock Bajo
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {lowStock.map(ing => (
                                <div key={ing.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-white font-medium">{ing.name}</span>
                                    <div className="text-right">
                                        <p className="text-red-400 font-bold">{ing.currentStock} {ing.purchaseUnit}</p>
                                        <p className="text-xs text-white/40">Min: {ing.minStock}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Ingredients */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Ingredientes Más Usados</h3>
                    <div className="space-y-4">
                        {getTopIngredients().map(([name, count], index) => (
                            <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-white/40 font-mono">#{index + 1}</span>
                                    <span className="text-white">{name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${(count / recipes.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-white/60">{count} recetas</span>
                                </div>
                            </div>
                        ))}
                        {recipes.length === 0 && (
                            <p className="text-white/40 text-center py-4">No hay datos suficientes</p>
                        )}
                    </div>
                </div>

                {/* Profitability */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Top Rentabilidad</h3>
                    <div className="space-y-4">
                        {getProfitability().map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-white">{item.name}</span>
                                <span className={`font-bold ${item.margin >= 70 ? 'text-emerald-400' :
                                    item.margin >= 50 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {Number(item.margin).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                        {recipes.length === 0 && (
                            <p className="text-white/40 text-center py-4">No hay datos suficientes</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sales Register Modal */}
            <AnimatePresence>
                {salesModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <SalesRegister onClose={() => setSalesModalOpen(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
