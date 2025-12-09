import { db } from './firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import Logger from '../utils/Logger';

export const MOVEMENT_TYPES = {
    PURCHASE: 'IN',       // Compra / Entrada
    SALE: 'OUT',          // Venta / Salida
    WASTE: 'OUT',         // Merma / Desperdicio
    ADJUST: 'ADJUST'      // Corrección de inventario
};

export const stockService = {
    /**
     * Registra un movimiento de stock y actualiza el inventario del ingrediente
     * @param {string} userId 
     * @param {object} movement { ingredientId, quantity, type, reason, cost? }
     */
    addMovement: async (userId, movement) => {
        const ingredientRef = doc(db, 'users', userId, 'masterIngredients', movement.ingredientId);
        const movementsRef = collection(db, 'users', userId, 'stockMovements');

        try {
            await runTransaction(db, async (transaction) => {
                const ingredientDoc = await transaction.get(ingredientRef);
                if (!ingredientDoc.exists()) {
                    throw new Error("Ingrediente no encontrado");
                }
                const currentStock = ingredientDoc.data().currentStock || 0;
                let newStock = currentStock;
                const quantity = parseFloat(movement.quantity);

                // Calcular nuevo stock según el tipo de movimiento
                if (movement.type === MOVEMENT_TYPES.PURCHASE) {
                    newStock += quantity;
                } else if (movement.type === MOVEMENT_TYPES.SALE || movement.type === MOVEMENT_TYPES.WASTE) {
                    newStock -= quantity;
                } else if (movement.type === MOVEMENT_TYPES.ADJUST) {
                    // En ajuste, quantity es el nuevo valor absoluto o la diferencia?
                    // Asumiremos que 'quantity' en ADJUST es la DIFERENCIA (+ o -)
                    // O podría ser el valor final. Para simplificar, usaremos diferencia por ahora.
                    newStock += quantity;
                }

                // 1. Actualizar el ingrediente
                transaction.update(ingredientRef, {
                    currentStock: newStock,
                    lastUpdated: serverTimestamp()
                });

                // 2. Crear registro de movimiento
                transaction.set(doc(movementsRef), {
                    ...movement,
                    quantity: quantity, // Guardar valor positivo
                    previousStock: currentStock,
                    newStock: newStock,
                    date: serverTimestamp()
                });
            });

            Logger.success(`Stock updated for ${movement.ingredientId}: ${movement.type} ${movement.quantity}`);
            return true;
        } catch (error) {
            Logger.error("Error en movimiento de stock:", error);
            throw error;
        }
    },

    /**
     * Registra una venta de receta y descuenta todos sus ingredientes
     * @param {string} userId 
     * @param {object} recipe Receta completa con sus ingredientes
     * @param {number} quantity Cantidad de recetas vendidas
     */
    registerSale: async (userId, recipe, quantity) => {
        const movementsRef = collection(db, 'users', userId, 'stockMovements');

        try {
            await runTransaction(db, async (transaction) => {
                // Iterar sobre cada ingrediente de la receta
                for (const ing of recipe.ingredients) {
                    // Buscar el ingrediente maestro correspondiente
                    // NOTA: Esto asume que recipe.ingredients tiene una referencia al ID del ingrediente maestro
                    // Si la receta solo guarda nombre, esto es un problema. 
                    // Necesitamos asegurar que recipe.ingredients tenga 'masterIngredientId' o buscar por nombre (menos seguro).

                    // Asumiendo que ing tiene masterIngredientId o id
                    const masterId = ing.masterIngredientId || ing.id;
                    if (!masterId) continue; // Si es un ingrediente ad-hoc sin link, lo saltamos

                    const ingredientRef = doc(db, 'users', userId, 'masterIngredients', masterId);
                    const ingredientDoc = await transaction.get(ingredientRef);

                    if (!ingredientDoc.exists()) continue;

                    const currentStock = ingredientDoc.data().currentStock || 0;

                    // Calcular consumo: (cantidad por receta * recetas vendidas)
                    // Asegurar conversión de unidades si es necesario (pendiente para fase avanzada)
                    // Por ahora asumimos que la unidad de receta y stock son compatibles o el usuario lo gestiona
                    const amountToDeduct = (parseFloat(ing.quantity) * quantity);

                    const newStock = currentStock - amountToDeduct;

                    // 1. Actualizar stock
                    transaction.update(ingredientRef, {
                        currentStock: newStock,
                        lastUpdated: serverTimestamp()
                    });

                    // 2. Registrar movimiento
                    const movementDoc = doc(movementsRef);
                    transaction.set(movementDoc, {
                        ingredientId: masterId,
                        ingredientName: ing.name,
                        type: MOVEMENT_TYPES.SALE,
                        quantity: amountToDeduct,
                        reason: `Venta: ${quantity}x ${recipe.name}`,
                        recipeId: recipe.id,
                        date: serverTimestamp(),
                        previousStock: currentStock,
                        newStock: newStock
                    });
                }
            });

            Logger.success(`Venta registrada: ${quantity}x ${recipe.name}`);
            return true;
        } catch (error) {
            Logger.error("Error registrando venta:", error);
            throw error;
        }
    }
};
