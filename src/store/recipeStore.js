import { create } from 'zustand';
import { recipeService, masterIngredientService } from '../services/firestoreService';
import { stockService } from '../services/stockService';
import Logger from '../utils/Logger';

const useRecipeStore = create((set, get) => ({
    // Estado
    recipes: [],
    masterIngredients: [],
    currentRecipe: null,
    loading: true,
    error: null,
    unsubscribe: null,
    userId: null,

    // Inicialización - Llamar al montar App
    initialize: async (userId) => {
        if (!userId) {
            set({ loading: false, error: null, recipes: [], masterIngredients: [] });
            return;
        }

        set({ loading: true, error: null, userId });

        try {
            Logger.info('🚀 Initializing Firestore listeners for user:', userId);

            // Suscribirse a cambios en tiempo real de recipes
            const unsubRecipes = recipeService.subscribe(userId, (recipes) => {
                Logger.debug(`📝 Recipes updated: ${recipes.length} total`);
                set({ recipes, loading: false });
            });

            // Suscribirse a cambios en tiempo real de masterIngredients
            const unsubIngredients = masterIngredientService.subscribe(userId, (ingredients) => {
                Logger.debug(`📦 Ingredients updated: ${ingredients.length} total`);
                set({ masterIngredients: ingredients });
            });

            // Guardar funciones de limpieza
            set({
                unsubscribe: () => {
                    Logger.info('🛑 Unsubscribing from Firestore listeners');
                    unsubRecipes();
                    unsubIngredients();
                }
            });

        } catch (error) {
            Logger.error('Error initializing store:', error);
            set({ error: error.message, loading: false });
        }
    },

    // Cleanup - Llamar al desmontar App
    cleanup: () => {
        const unsub = get().unsubscribe;
        if (unsub) {
            unsub();
            set({ unsubscribe: null });
        }
    },

    // ========== INGREDIENTES MAESTROS ==========

    addMasterIngredient: async (ingredient) => {
        try {
            Logger.info('➕ Adding master ingredient:', ingredient.name);
            const userId = get().userId;
            // Inicializar stock en 0 si no viene
            const ingredientWithStock = {
                ...ingredient,
                currentStock: ingredient.currentStock || 0,
                minStock: ingredient.minStock || 0
            };
            const newIng = await masterIngredientService.create(userId, ingredientWithStock);
            return newIng;
        } catch (error) {
            console.error('❌ Error adding ingredient:', error);
            set({ error: error.message });
            throw error;
        }
    },

    updateMasterIngredient: async (id, updates) => {
        try {
            Logger.info('✏️ Updating master ingredient:', id);
            const userId = get().userId;
            await masterIngredientService.update(userId, id, updates);
        } catch (error) {
            console.error('❌ Error updating ingredient:', error);
            set({ error: error.message });
            throw error;
        }
    },

    deleteMasterIngredient: async (id) => {
        try {
            Logger.info('🗑️ Deleting master ingredient:', id);
            const userId = get().userId;
            await masterIngredientService.delete(userId, id);
        } catch (error) {
            console.error('❌ Error deleting ingredient:', error);
            set({ error: error.message });
            throw error;
        }
    },

    // ========== STOCK & INVENTARIO ==========

    addStockMovement: async (movement) => {
        try {
            Logger.info('📦 Adding stock movement:', movement);
            const userId = get().userId;
            await stockService.addMovement(userId, movement);
        } catch (error) {
            console.error('❌ Error adding stock movement:', error);
            set({ error: error.message });
            throw error;
        }
    },

    registerRecipeSale: async (recipe, quantity) => {
        try {
            Logger.info('💰 Registering sale:', recipe.name, quantity);
            const userId = get().userId;
            await stockService.registerSale(userId, recipe, quantity);
        } catch (error) {
            console.error('❌ Error registering sale:', error);
            set({ error: error.message });
            throw error;
        }
    },

    // ========== RECETAS ==========

    addRecipe: async (recipe) => {
        try {
            Logger.info('➕ Adding recipe:', recipe.name);
            const userId = get().userId;

            // Asegurar que los campos financieros estén presentes
            const recipeData = {
                ...recipe,
                sellingPrice: parseFloat(recipe.sellingPrice || recipe.suggestedPrice || 0),
                costPerServing: parseFloat(recipe.costPerServing || 0),
                margin: parseFloat(recipe.margin || 0),
                profit: parseFloat(recipe.profit || 0),
                primeCost: parseFloat(recipe.primeCost || 0),
                totalCost: parseFloat(recipe.totalCost || 0),
                estimatedMonthlySales: parseInt(recipe.estimatedMonthlySales || 0)
            };

            const newRecipe = await recipeService.create(userId, recipeData);
            return newRecipe;
        } catch (error) {
            console.error('❌ Error adding recipe:', error);
            set({ error: error.message });
            throw error;
        }
    },

    updateRecipe: async (id, updates) => {
        try {
            Logger.info('✏️ Updating recipe:', id);
            const userId = get().userId;
            // Asegurar tipos numéricos en actualizaciones también
            const safeUpdates = { ...updates };
            ['sellingPrice', 'costPerServing', 'margin', 'profit', 'primeCost', 'totalCost'].forEach(field => {
                if (safeUpdates[field] !== undefined) {
                    safeUpdates[field] = parseFloat(safeUpdates[field]);
                }
            });
            if (safeUpdates.estimatedMonthlySales !== undefined) {
                safeUpdates.estimatedMonthlySales = parseInt(safeUpdates.estimatedMonthlySales);
            }

            await recipeService.update(userId, id, safeUpdates);
        } catch (error) {
            console.error('❌ Error updating recipe:', error);
            set({ error: error.message });
            throw error;
        }
    },

    deleteRecipe: async (id) => {
        try {
            Logger.info('🗑️ Deleting recipe:', id);
            const userId = get().userId;
            await recipeService.delete(userId, id);

            // Limpiar currentRecipe si es la que se eliminó
            if (get().currentRecipe?.id === id) {
                set({ currentRecipe: null });
            }
        } catch (error) {
            console.error('❌ Error deleting recipe:', error);
            set({ error: error.message });
            throw error;
        }
    },

    // ========== UTILIDADES ==========

    setCurrentRecipe: (recipe) => {
        set({ currentRecipe: recipe });
    },

    getRecipeById: (id) => {
        return get().recipes.find((recipe) => recipe.id === id);
    },

    getStats: () => {
        const recipes = get().recipes;
        const totalRecipes = recipes.length;
        const masterIngredients = get().masterIngredients;

        if (totalRecipes === 0) {
            return {
                totalRecipes: 0,
                avgCost: 0,
                avgPrimeCost: 0,
                totalIngredients: masterIngredients.length,
            };
        }

        const totalCost = recipes.reduce((sum, r) => sum + (r.totalCost || 0), 0);
        const totalPrimeCost = recipes.reduce((sum, r) => sum + (r.primeCost || 0), 0);

        return {
            totalRecipes,
            avgCost: totalCost / totalRecipes,
            avgPrimeCost: totalPrimeCost / totalRecipes,
            totalIngredients: masterIngredients.length,
        };
    },

    // Limpiar errores
    clearError: () => {
        set({ error: null });
    }
}));

export default useRecipeStore;
