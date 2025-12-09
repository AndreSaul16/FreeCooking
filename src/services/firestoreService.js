import { db } from './firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

// Helper para obtener referencias a colecciones de usuario
const getUserRecipesRef = (userId) => collection(db, 'users', userId, 'recipes');
const getUserIngredientsRef = (userId) => collection(db, 'users', userId, 'masterIngredients');

// ========== RECIPES ==========

export const recipeService = {
    /**
     * Escuchar cambios en tiempo real
     * @param {string} userId - ID del usuario
     * @param {Function} callback - Se llama cada vez que hay cambios
     * @returns {Function} Unsubscribe function
     */
    subscribe: (userId, callback) => {
        if (!userId) return () => { };
        
        return onSnapshot(
            query(getUserRecipesRef(userId), orderBy('createdAt', 'desc')),
            (snapshot) => {
                const recipes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(recipes);
            },
            (error) => {
                console.error('❌ Error in recipes subscription:', error);
                callback([]); 
            }
        );
    },

    /**
     * Crear nueva receta
     */
    create: async (userId, recipeData) => {
        if (!userId) throw new Error('User ID is required');
        
        const docRef = await addDoc(getUserRecipesRef(userId), {
            ...recipeData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...recipeData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    },

    /**
     * Actualizar receta existente
     */
    update: async (userId, recipeId, updates) => {
        if (!userId) throw new Error('User ID is required');
        
        const docRef = doc(db, 'users', userId, 'recipes', recipeId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Eliminar receta
     */
    delete: async (userId, recipeId) => {
        if (!userId) throw new Error('User ID is required');
        
        const docRef = doc(db, 'users', userId, 'recipes', recipeId);
        await deleteDoc(docRef);
    }
};

// ========== MASTER INGREDIENTS ==========

export const masterIngredientService = {
    /**
     * Escuchar cambios en tiempo real
     * @param {string} userId - ID del usuario
     * @param {Function} callback - Se llama cada vez que hay cambios
     * @returns {Function} Unsubscribe function
     */
    subscribe: (userId, callback) => {
        if (!userId) return () => { };

        return onSnapshot(
            query(getUserIngredientsRef(userId), orderBy('name')),
            (snapshot) => {
                const ingredients = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(ingredients);
            },
            (error) => {
                console.error('❌ Error in ingredients subscription:', error);
                callback([]);
            }
        );
    },

    /**
     * Crear nuevo ingrediente maestro
     */
    create: async (userId, ingredientData) => {
        if (!userId) throw new Error('User ID is required');

        const docRef = await addDoc(getUserIngredientsRef(userId), {
            ...ingredientData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...ingredientData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    },

    /**
     * Actualizar ingrediente existente
     */
    update: async (userId, ingredientId, updates) => {
        if (!userId) throw new Error('User ID is required');

        const docRef = doc(db, 'users', userId, 'masterIngredients', ingredientId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Eliminar ingrediente
     */
    delete: async (userId, ingredientId) => {
        if (!userId) throw new Error('User ID is required');

        const docRef = doc(db, 'users', userId, 'masterIngredients', ingredientId);
        await deleteDoc(docRef);
    }
};
