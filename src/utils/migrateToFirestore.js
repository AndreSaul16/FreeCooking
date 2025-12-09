import { recipeService, masterIngredientService } from '../services/firestoreService';

/**
 * Migrar datos de localStorage a Firestore
 * IMPORTANTE: Ejecutar solo UNA VEZ
 */
export async function migrateLocalDataToFirestore() {
    try {
        console.log('🚀 Starting migration from localStorage to Firestore...');
        console.log('');

        // 1. Leer datos de localStorage
        const localData = localStorage.getItem('freecooking-storage');

        if (!localData) {
            console.log('ℹ️  No local data found in localStorage');
            console.log('✅ Migration not needed');
            return {
                success: true,
                message: 'No data to migrate',
                migratedIngredients: 0,
                migratedRecipes: 0
            };
        }

        const { state } = JSON.parse(localData);
        const { recipes = [], masterIngredients = [] } = state;

        console.log(`📊 Found in localStorage:`);
        console.log(`   - ${masterIngredients.length} master ingredients`);
        console.log(`   - ${recipes.length} recipes`);
        console.log('');

        let migratedIngredients = 0;
        let migratedRecipes = 0;

        // 2. Migrar Master Ingredients
        if (masterIngredients.length > 0) {
            console.log('📦 Migrating master ingredients...');

            for (const ing of masterIngredients) {
                try {
                    // Remover campos que no queremos migrar
                    const { id, ...ingredientData } = ing;

                    await masterIngredientService.create(ingredientData);
                    migratedIngredients++;
                    console.log(`   ✓ Migrated: ${ingredientData.name}`);
                } catch (error) {
                    console.error(`   ✗ Failed to migrate ingredient:`, ing.name, error);
                }
            }

            console.log(`✅ ${migratedIngredients} ingredients migrated`);
            console.log('');
        }

        // 3. Migrar Recipes
        if (recipes.length > 0) {
            console.log('📝 Migrating recipes...');

            for (const recipe of recipes) {
                try {
                    // Remover campos que no queremos migrar
                    const { id, ...recipeData } = recipe;

                    await recipeService.create(recipeData);
                    migratedRecipes++;
                    console.log(`   ✓ Migrated: ${recipeData.name}`);
                } catch (error) {
                    console.error(`   ✗ Failed to migrate recipe:`, recipe.name, error);
                }
            }

            console.log(`✅ ${migratedRecipes} recipes migrated`);
            console.log('');
        }

        console.log('🎉 Migration completed successfully!');
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Verify data in Firebase Console');
        console.log('   2. Test app functionality');
        console.log('   3. Backup localStorage (optional)');
        console.log('   4. Clear localStorage: localStorage.removeItem("freecooking-storage")');
        console.log('');

        return {
            success: true,
            message: 'Migration completed',
            migratedIngredients,
            migratedRecipes
        };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('   1. Check Firebase configuration');
        console.error('   2. Verify Firestore rules allow writes');
        console.error('   3. Check network connection');
        console.error('');

        return {
            success: false,
            error: error.message,
            migratedIngredients: 0,
            migratedRecipes: 0
        };
    }
}

/**
 * Backup de localStorage a archivo JSON
 */
export function backupLocalStorage() {
    const localData = localStorage.getItem('freecooking-storage');

    if (!localData) {
        console.log('ℹ️  No data to backup');
        return null;
    }

    const data = JSON.parse(localData);
    const backup = {
        timestamp: new Date().toISOString(),
        version: data.version,
        data: data.state
    };

    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freecooking-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Backup downloaded');
    return backup;
}
