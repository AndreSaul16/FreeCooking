import React, { useState } from 'react';
import { Search, Plus, Save, AlertTriangle, Package, Edit2, Trash2, X, ArrowDown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRecipeStore from '../store/recipeStore';
import Logger from '../utils/Logger';

export default function MasterIngredientsManager() {
    const { masterIngredients, addMasterIngredient, updateMasterIngredient, deleteMasterIngredient, addStockMovement } = useRecipeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    // Form states
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        purchasePrice: '',
        purchaseUnit: 'kg',
        wastePercentage: '0',
        minStock: '0',
        currentStock: '0'
    });

    const [stockForm, setStockForm] = useState({
        type: 'IN',
        quantity: '',
        reason: ''
    });

    const filteredIngredients = masterIngredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const ingredientData = {
                name: newIngredient.name,
                purchasePrice: parseFloat(newIngredient.purchasePrice),
                purchaseUnit: newIngredient.purchaseUnit,
                wastePercentage: parseFloat(newIngredient.wastePercentage),
                minStock: parseFloat(newIngredient.minStock) || 0,
                currentStock: parseFloat(newIngredient.currentStock) || 0,
            };

            if (editingId) {
                await updateMasterIngredient(editingId, ingredientData);
                setEditingId(null);
                setIsAdding(false);
            } else {
                await addMasterIngredient(ingredientData);
                setIsAdding(false);
            }

            setNewIngredient({ name: '', purchasePrice: '', purchaseUnit: 'kg', wastePercentage: '0', minStock: '0', currentStock: '0' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = (id) => {
        const ingredient = masterIngredients.find(i => i.id === id);
        if (ingredient) {
            setNewIngredient({
                name: ingredient.name,
                purchasePrice: ingredient.purchasePrice,
                purchaseUnit: ingredient.purchaseUnit,
                wastePercentage: ingredient.wastePercentage,
                minStock: ingredient.minStock,
                currentStock: ingredient.currentStock
            });
            setEditingId(id);
            setIsAdding(true);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este ingrediente?')) {
            await deleteMasterIngredient(id);
        }
    };

    const openStockModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setStockForm({ type: 'IN', quantity: '', reason: '' });
        setStockModalOpen(true);
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIngredient) return;

        try {
            await addStockMovement({
                ingredientId: selectedIngredient.id,
                ingredientName: selectedIngredient.name,
                type: stockForm.type,
                quantity: parseFloat(stockForm.quantity),
                reason: stockForm.reason || (stockForm.type === 'IN' ? 'Compra' : 'Ajuste manual')
            });
            setStockModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                        type="text"
                        placeholder="Buscar ingredientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewIngredient({ name: '', purchasePrice: '', purchaseUnit: 'kg', wastePercentage: '0', minStock: '0', currentStock: '0' });
                        setIsAdding(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 btn-glass-primary hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg shadow-primary-600/20"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Ingrediente
                </button>
            </div>

            {/* Add Ingredient Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAdd}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6 space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-white/60 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={newIngredient.name}
                                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                    placeholder="Ej: Tomate Triturado"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Precio Compra (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newIngredient.purchasePrice}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                                            val = val.slice(1);
                                        }
                                        setNewIngredient({ ...newIngredient, purchasePrice: val });
                                    }}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Unidad</label>
                                <select
                                    value={newIngredient.purchaseUnit}
                                    onChange={(e) => setNewIngredient({ ...newIngredient, purchaseUnit: e.target.value })}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                >
                                    <option value="kg">Kilogramo (kg)</option>
                                    <option value="l">Litro (l)</option>
                                    <option value="ud">Unidad (ud)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Merma (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newIngredient.wastePercentage}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                                            val = val.slice(1);
                                        }
                                        setNewIngredient({ ...newIngredient, wastePercentage: val });
                                    }}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Stock Mínimo</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newIngredient.minStock}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                                            val = val.slice(1);
                                        }
                                        setNewIngredient({ ...newIngredient, minStock: val });
                                    }}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Stock Actual</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newIngredient.currentStock}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                                            val = val.slice(1);
                                        }
                                        setNewIngredient({ ...newIngredient, currentStock: val });
                                    }}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setNewIngredient({ name: '', purchasePrice: '', purchaseUnit: 'kg', wastePercentage: '0', minStock: '0', currentStock: '0' });
                                }}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 btn-glass-primary hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Guardar
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Ingredients Table */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20/50 border-b border-white/20 shadow-lg">
                                <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Ingrediente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Precio / Unidad</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Merma</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Stock Actual</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredIngredients.map((ing) => {
                                const isLowStock = (ing.currentStock || 0) <= (ing.minStock || 0);
                                return (
                                    <tr key={ing.id} className="hover:bg-white/5/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{ing.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/80">
                                            {ing.purchasePrice}€ / {ing.purchaseUnit}
                                        </td>
                                        <td className="px-6 py-4 text-white/80">
                                            {ing.wastePercentage}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-mono font-medium ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
                                                    {Number(ing.currentStock || 0).toFixed(2)} {ing.purchaseUnit}
                                                </span>
                                                {isLowStock && (
                                                    <div className="group/tooltip relative">
                                                        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-900 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                                                            Stock Bajo (Min: {ing.minStock || 0})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openStockModal(ing)}
                                                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Gestionar Stock"
                                                >
                                                    <Package className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(ing.id)}
                                                    className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ing.id)}
                                                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredIngredients.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron ingredientes.
                    </div>
                )}
            </div>

            {/* Stock Management Modal */}
            <AnimatePresence>
                {stockModalOpen && selectedIngredient && (
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
                            className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    Gestionar Stock: <span className="text-primary-400">{selectedIngredient.name}</span>
                                </h3>
                                <button onClick={() => setStockModalOpen(false)} className="text-white/60 hover:text-white">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-black/20/50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-white/60 uppercase">Stock Actual</p>
                                    <p className="text-2xl font-mono font-bold text-white">
                                        {selectedIngredient.currentStock || 0} <span className="text-sm text-gray-500">{selectedIngredient.purchaseUnit}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/60 uppercase">Mínimo</p>
                                    <p className="text-lg font-mono font-medium text-white/80">
                                        {selectedIngredient.minStock || 0} <span className="text-sm text-gray-500">{selectedIngredient.purchaseUnit}</span>
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleStockSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStockForm({ ...stockForm, type: 'IN' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${stockForm.type === 'IN'
                                            ? 'bg-green-900/20 border-green-500 text-green-400'
                                            : 'bg-black/20/50 border-white/20 shadow-lg text-white/60 hover:border-gray-500'
                                            }`}
                                    >
                                        <ArrowDown className="h-6 w-6" />
                                        <span className="font-medium">Entrada (Compra)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStockForm({ ...stockForm, type: 'OUT' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${stockForm.type === 'OUT'
                                            ? 'bg-red-900/20 border-red-500 text-red-400'
                                            : 'bg-black/20/50 border-white/20 shadow-lg text-white/60 hover:border-gray-500'
                                            }`}
                                    >
                                        <ArrowUp className="h-6 w-6" />
                                        <span className="font-medium">Salida (Merma)</span>
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">
                                        Cantidad ({selectedIngredient.purchaseUnit})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        min="0"
                                        value={stockForm.quantity}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                                                val = val.slice(1);
                                            }
                                            setStockForm({ ...stockForm, quantity: val });
                                        }}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-primary-400 text-lg font-mono"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Motivo (Opcional)</label>
                                    <input
                                        type="text"
                                        value={stockForm.reason}
                                        onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-400"
                                        placeholder={stockForm.type === 'IN' ? "Ej: Compra Makro" : "Ej: Caducado"}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 btn-glass-primary hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-600/20 mt-4"
                                >
                                    Confirmar Movimiento
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

