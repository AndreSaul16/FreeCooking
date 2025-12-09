import React from 'react';
import { ChefHat, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import useRecipeStore from '../store/recipeStore';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const RecipeList = ({ onEdit }) => {
    const { recipes, deleteRecipe } = useRecipeStore();

    const handleDelete = (id) => {
        if (confirm('¿Seguro que quieres eliminar esta receta?')) {
            deleteRecipe(id);
        }
    };

    if (recipes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
                    <ChefHat className="h-10 w-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    No hay recetas aún
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Comienza creando tu primera receta para calcular costos y optimizar tus precios
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {recipes.map((recipe) => (
                <motion.div key={recipe.id} variants={item}>
                    <RecipeCard
                        recipe={recipe}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default RecipeList;
