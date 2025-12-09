import React, { useState } from 'react';
import useRecipeStore from '../store/recipeStore';
import { ShoppingCart, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SalesRegister({ onClose }) {
    const { recipes, registerRecipeSale } = useRecipeStore();
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

    const handleSale = async (e) => {
        e.preventDefault();
        if (!selectedRecipe) return;

        setLoading(true);
        setError('');
        try {
            await registerRecipeSale(selectedRecipe, quantity);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setQuantity(1);
                setSelectedRecipeId('');
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Error al registrar la venta. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary-500" />
                    Registrar Venta
                </h3>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <span className="sr-only">Cerrar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-center"
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">¡Venta Registrada!</h4>
                        <p className="text-gray-400">El stock se ha actualizado correctamente.</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSale} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Seleccionar Receta</label>
                            <select
                                value={selectedRecipeId}
                                onChange={(e) => setSelectedRecipeId(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                required
                            >
                                <option value="">-- Elige un plato --</option>
                                {recipes.map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>
                                        {recipe.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedRecipe && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Cantidad Vendida</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
                                        >
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <div className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold text-white">
                                            {quantity}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 rounded-xl p-4 text-sm">
                                    <p className="text-gray-400 mb-2">Resumen de ingredientes a descontar:</p>
                                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                                        {selectedRecipe.ingredients.map((ing, idx) => (
                                            <li key={idx} className="flex justify-between text-gray-300">
                                                <span>{ing.name}</span>
                                                <span className="font-mono text-gray-500">
                                                    -{(ing.quantity * quantity).toFixed(2)} {ing.unit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedRecipe || loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="h-6 w-6" />
                                    Confirmar Venta
                                </>
                            )}
                        </button>
                    </form>
                )}
            </AnimatePresence>
        </div>
    );
}
