import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import useRecipeStore from '../store/recipeStore';
import { calculateCOGS, calculatePrimeCost, suggestPrice } from '../services/calculations';
import { useSettings } from '../context/SettingsContext';
import VoiceRecipeBtn from './VoiceRecipeBtn';

export default function RecipeForm({ recipeToEdit = null, onClose }) {
    const { addRecipe, updateRecipe, masterIngredients } = useRecipeStore();
    const { settings } = useSettings(); // ← Usar settings dinámicos

    const [formData, setFormData] = useState(recipeToEdit || {
        name: '',
        category: 'principal',
        servings: 1,
        prepTimeMinutes: 0,
        laborCostPerHour: 12,
        ingredients: [],
        sellingPrice: '',  // Precio de venta real (vacío usa sugerido)
        estimatedMonthlySales: 0, // Ventas estimadas mensuales
    });

    // Estado para el nuevo ingrediente
    const [selectedMasterId, setSelectedMasterId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('g');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar ingredientes maestros
    const filteredMasterIngredients = masterIngredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Añadir ingrediente a la lista
    const handleAddIngredient = () => {
        if (!selectedMasterId || !quantity) {
            alert('Selecciona un ingrediente y especifica la cantidad');
            return;
        }

        const masterIng = masterIngredients.find(ing => ing.id === selectedMasterId);
        if (!masterIng) return;

        const ingredient = {
            id: Date.now().toString(),
            masterId: masterIng.id,
            name: masterIng.name, // Guardamos nombre por si se borra el maestro (snapshot)
            quantity: parseFloat(quantity),
            unit: unit,
            // Guardamos datos del maestro para cálculos históricos (snapshot)
            purchasePrice: masterIng.purchasePrice,
            purchaseUnit: masterIng.purchaseUnit,
            wastePercentage: masterIng.wastePercentage
        };

        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, ingredient],
        });

        // Resetear campos
        setSelectedMasterId('');
        setQuantity('');
        setUnit('g');
        setSearchTerm('');
    };

    // Eliminar ingrediente
    const handleRemoveIngredient = (id) => {
        setFormData({
            ...formData,
            ingredients: formData.ingredients.filter((ing) => ing.id !== id),
        });
    };

    // Calcular costos en tiempo real usando settings dinámicos
    const cogs = calculateCOGS(formData.ingredients);
    const primeCost = calculatePrimeCost(cogs, formData.prepTimeMinutes, settings);
    const pricing = suggestPrice(primeCost, settings, formData.servings || 1);

    // Calcular margen real con el precio de venta del usuario
    const realSellingPrice = parseFloat(formData.sellingPrice) || pricing.suggestedPrice;
    const primeCostPerServing = primeCost / (formData.servings || 1);
    const realMarginPercent = realSellingPrice > 0
        ? ((realSellingPrice - primeCostPerServing) / realSellingPrice) * 100
        : 0;

    // Determinar color del margen según comparación con objetivo
    const getMarginColor = () => {
        if (realMarginPercent >= settings.targetMarginPercent) return 'text-green-400';
        if (realMarginPercent >= 50) return 'text-orange-400';
        return 'text-red-400';
    };

    // Handler para datos de IA (Chef Mode)
    const handleVoiceRecipe = (aiData) => {
        console.log('🤖 AI Recipe Data received:', aiData);

        // 1. Actualizar campos básicos
        setFormData(prev => ({
            ...prev,
            name: aiData.name,
            prepTimeMinutes: aiData.prepTime,
            servings: aiData.servings
        }));

        // 2. Mapear ingredientes de IA al inventario maestro
        const mappedIngredients = aiData.ingredients.map(aiIng => {
            // Buscar coincidencia en masterIngredients (fuzzy match)
            const masterIng = masterIngredients.find(m =>
                m.name.toLowerCase().includes(aiIng.name.toLowerCase()) ||
                aiIng.name.toLowerCase().includes(m.name.toLowerCase())
            );

            if (masterIng) {
                // Ingrediente encontrado en inventario maestro
                console.log(`✅ Matched "${aiIng.name}" to master "${masterIng.name}"`);
                return {
                    id: Date.now().toString() + Math.random(),
                    masterId: masterIng.id,
                    name: masterIng.name,
                    quantity: aiIng.quantity,
                    unit: aiIng.unit,
                    purchasePrice: masterIng.purchasePrice,
                    purchaseUnit: masterIng.purchaseUnit,
                    wastePercentage: masterIng.wastePercentage || 0
                };
            } else {
                // Ingrediente NO encontrado - crear entrada temporal sin datos
                console.warn(`⚠️ Ingredient "${aiIng.name}" not found in master inventory`);
                return {
                    id: Date.now().toString() + Math.random(),
                    masterId: null,
                    name: aiIng.name + ' ⚠️ (añadir al inventario)',
                    quantity: aiIng.quantity,
                    unit: aiIng.unit,
                    purchasePrice: 0,
                    purchaseUnit: aiIng.unit,
                    wastePercentage: 0
                };
            }
        });

        // 3. Añadir ingredientes mapeados al formulario
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, ...mappedIngredients]
        }));

        console.log('✅ Voice recipe loaded successfully');
    };

    // Guardar receta
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || formData.ingredients.length === 0) {
            alert('Completa al menos el nombre y un ingrediente');
            return;
        }

        // 1. Calcular valores finales para persistencia
        const finalSellingPrice = parseFloat(formData.sellingPrice) || pricing.suggestedPrice;
        const finalCostPerServing = primeCost / (formData.servings || 1);

        let finalMargin = 0;
        if (finalSellingPrice > 0) {
            finalMargin = ((finalSellingPrice - finalCostPerServing) / finalSellingPrice) * 100;
        }

        const profit = finalSellingPrice - finalCostPerServing;

        const recipeData = {
            ...formData,
            totalCost: parseFloat(cogs.toFixed(2)),
            primeCost: parseFloat(primeCost.toFixed(2)),
            costPerServing: parseFloat(finalCostPerServing.toFixed(2)),
            sellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
            margin: parseFloat(finalMargin.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            suggestedPrice: parseFloat(pricing.suggestedPrice.toFixed(2)),
        };

        if (recipeToEdit) {
            updateRecipe(recipeToEdit.id, recipeData);
        } else {
            addRecipe(recipeData);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl my-4 sm:my-8 shadow-2xl border border-gray-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 sm:p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {recipeToEdit ? 'Editar Receta' : 'Nueva Receta'}
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* Chef Mode Button */}
                        {!recipeToEdit && (
                            <VoiceRecipeBtn
                                onRecipeExtracted={handleVoiceRecipe}
                                disabled={masterIngredients.length === 0}
                            />
                        )}
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Información básica */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Nombre de la Receta *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Ej: Empanadas de Carne"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Categoría
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                            >
                                <option value="entrante">Entrante</option>
                                <option value="principal">Principal</option>
                                <option value="postre">Postre</option>
                                <option value="bebida">Bebida</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Número de Raciones *
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.servings}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, servings: parseInt(value) || 1 });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="1"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Tiempo Preparación (min)
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={formData.prepTimeMinutes}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setFormData({ ...formData, prepTimeMinutes: parseFloat(value) || 0 });
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="30"
                            />
                        </div>
                    </div>

                    {/* Sección de Ingredientes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Ingredientes</h3>

                        {masterIngredients.length === 0 ? (
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <h4 className="text-yellow-500 font-medium">No hay ingredientes en el inventario</h4>
                                    <p className="text-yellow-400/80 text-sm mt-1">
                                        Ve a la pestaña "Inventario" para crear tus ingredientes maestros antes de añadirlos a la receta.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700 space-y-4">
                                <div className="grid md:grid-cols-12 gap-3">
                                    <div className="md:col-span-5">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Ingrediente</label>
                                        <select
                                            value={selectedMasterId}
                                            onChange={(e) => setSelectedMasterId(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {filteredMasterIngredients.map((ing) => (
                                                <option key={ing.id} value={ing.id}>
                                                    {ing.name} ({Number(ing.purchasePrice).toFixed(2)}€/{ing.purchaseUnit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Cantidad</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={quantity}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                                setQuantity(value);
                                            }}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Unidad</label>
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                            <option value="ml">ml</option>
                                            <option value="l">l</option>
                                            <option value="unidad">unidad</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleAddIngredient}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Añadir
                                        </button>
                                    </div>
                                </div>

                                {/* Lista de ingredientes añadidos */}
                                {formData.ingredients.length > 0 && (
                                    <div className="mt-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-600">
                                                    <th className="text-left py-2 text-xs font-medium text-gray-400">Ingrediente</th>
                                                    <th className="text-left py-2 text-xs font-medium text-gray-400">Cantidad</th>
                                                    <th className="text-right py-2 text-xs font-medium text-gray-400">€/Ud</th>
                                                    <th className="w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.ingredients.map((ing) => (
                                                    <tr key={ing.id} className="border-b border-gray-700/50">
                                                        <td className="py-3 text-gray-300">
                                                            {ing.name}
                                                            {ing.wastePercentage > 0 && (
                                                                <span className="text-xs text-gray-500 ml-1">
                                                                    ({ing.wastePercentage}% merma)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-gray-300">
                                                            {ing.quantity} {ing.unit}
                                                        </td>
                                                        <td className="py-3 text-right text-xs text-gray-400">
                                                            {Number(ing.purchasePrice || 0).toFixed(2)} €/{ing.purchaseUnit || 'ud'}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveIngredient(ing.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Resumen Financiero */}
                    {formData.ingredients.length > 0 && (
                        <div className="bg-gradient-to-br from-primary-900/20 to-gray-900/20 border border-primary-700/30 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                💰 Análisis Financiero
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">COGS (Por Ración)</p>
                                    <p className="text-2xl font-bold text-white">{(cogs / formData.servings).toFixed(2)}€</p>
                                    <p className="text-xs text-gray-500">Batch: {cogs.toFixed(2)}€</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Costo Primo (Por Ración)</p>
                                    <p className="text-2xl font-bold text-blue-400">{(primeCost / formData.servings).toFixed(2)}€</p>
                                    <p className="text-xs text-gray-500">Batch: {primeCost.toFixed(2)}€</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">P.V.P Sugerido</p>
                                    <p className="text-2xl font-bold text-green-400">{pricing.suggestedPrice.toFixed(2)}€</p>
                                    <p className="text-xs text-gray-500">Por ración · Margen {settings.targetMarginPercent}%</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Beneficio Neto</p>
                                    <p className="text-2xl font-bold text-green-500">
                                        {(pricing.suggestedPrice - (primeCost / formData.servings)).toFixed(2)}€
                                    </p>
                                    <p className="text-xs text-gray-500">Por ración</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección de Datos de Venta y Rentabilidad */}
                    {formData.ingredients.length > 0 && (
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                📊 Datos de Venta y Rentabilidad
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Precio de Venta Real */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Precio de Venta Real (€)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.sellingPrice}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9.]/g, '');
                                            setFormData({ ...formData, sellingPrice: value });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder={`Sugerido: ${pricing.suggestedPrice.toFixed(2)}€`}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Dejar vacío para usar precio sugerido
                                    </p>
                                </div>

                                {/* Ventas Mensuales Estimadas */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Ventas Mensuales Estimadas (unidades)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={formData.estimatedMonthlySales}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setFormData({ ...formData, estimatedMonthlySales: parseInt(value) || 0 });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Ej: 30"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Para análisis de rentabilidad y popularidad
                                    </p>
                                </div>

                                {/* Display de Margen Real */}
                                <div className="md:col-span-2 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Margen de Beneficio Real:</span>
                                        <span className={`text-lg font-bold ${getMarginColor()}`}>
                                            {realMarginPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                    {realMarginPercent < settings.targetMarginPercent && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-orange-400">
                                            <span>⚠️</span>
                                            <span>
                                                Por debajo del objetivo ({settings.targetMarginPercent}%).
                                                Considera ajustar el precio o reducir costes.
                                            </span>
                                        </div>
                                    )}
                                    {realMarginPercent >= settings.targetMarginPercent && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                                            <span>✅</span>
                                            <span>Margen saludable alcanzado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {recipeToEdit ? 'Actualizar Receta' : 'Guardar Receta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
