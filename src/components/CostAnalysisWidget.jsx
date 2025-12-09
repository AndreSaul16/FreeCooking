import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateIngredientCost } from '../services/calculations';

export default function CostAnalysisWidget({ recipes }) {
    // Calcular gasto total por ingrediente
    const ingredientSpending = {};

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
            // Calcular el costo real de este ingrediente en esta receta
            const cost = calculateIngredientCost(
                ing.quantity,
                ing.unit,
                ing.purchasePrice,
                ing.purchaseUnit,
                ing.wastePercentage || 0
            );

            if (!ingredientSpending[ing.name]) {
                ingredientSpending[ing.name] = {
                    totalCost: 0,
                    usedIn: []
                };
            }

            ingredientSpending[ing.name].totalCost += cost;

            // Evitar duplicados en la lista de recetas
            if (!ingredientSpending[ing.name].usedIn.includes(recipe.name)) {
                ingredientSpending[ing.name].usedIn.push(recipe.name);
            }
        });
    });

    // Ordenar por gasto (mayor a menor) y tomar TOP 5
    const sortedIngredients = Object.entries(ingredientSpending)
        .map(([name, data]) => ({
            name,
            cost: data.totalCost,
            usedIn: data.usedIn,
            recipeCount: data.usedIn.length
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

    if (sortedIngredients.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    💰 Top 5: Donde se va el dinero
                </h3>
                <p className="text-gray-400 text-center py-8">
                    Crea recetas para ver el análisis de costes
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
                💰 Top 5: Donde se va el dinero
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                Análisis ABC/Pareto de ingredientes por gasto total
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedIngredients} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        label={{ value: '€', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="cost"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Info adicional */}
            <div className="mt-4 bg-gray-900/50 rounded-lg p-3 text-xs text-gray-400">
                <p>
                    💡 <strong>Tip:</strong> Estos son los ingredientes que más dinero representan en tus recetas.
                    Considera negociar mejores precios con proveedores o buscar alternativas.
                </p>
            </div>
        </div>
    );
}

// Tooltip personalizado
function CustomTooltip({ active, payload }) {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="font-bold text-white mb-1">{data.name}</p>
            <p className="text-green-400 font-semibold text-lg mb-2">
                {data.cost.toFixed(2)}€
            </p>
            <div className="border-t border-gray-700 pt-2 mt-2">
                <p className="text-xs text-gray-400 mb-1">
                    Usado en {data.recipeCount} receta{data.recipeCount !== 1 ? 's' : ''}:
                </p>
                <ul className="text-xs text-gray-300 max-h-32 overflow-y-auto">
                    {data.usedIn.map((recipeName, idx) => (
                        <li key={idx} className="truncate">• {recipeName}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
