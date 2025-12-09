import React, { useEffect, useState } from 'react';
import { Plus, ChefHat, Calculator, Settings, List, BookOpen, Package, Menu, LogOut } from 'lucide-react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import Dashboard from './components/Dashboard';
import MasterIngredientsManager from './components/MasterIngredientsManager';
import SettingsPage from './components/SettingsPage';
import HelpSection from './components/HelpSection';
import LoginPage from './components/LoginPage';
import useRecipeStore from './store/recipeStore';
import Chatbot from './components/Chatbot';
import { initializeTheme } from './services/themeService';
import { AnimatePresence, motion } from 'framer-motion';

import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthenticatedApp() {
    const [currentView, setCurrentView] = useState('recipes');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const { recipes, initialize, cleanup, loading, error } = useRecipeStore();
    const { currentUser, logout } = useAuth();

    useEffect(() => {
        initializeTheme();
        if (currentUser) {
            initialize(currentUser.uid);
        }
        return () => cleanup();
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEdit = (recipe) => {
        setEditingRecipe(recipe);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRecipe(null);
    };

    const handleViewChange = (viewId) => {
        setCurrentView(viewId);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error logging out", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 animate-pulse">Cargando tu cocina...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Error de conexión</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const navItems = [
        { id: 'recipes', label: 'Recetas', icon: List, count: recipes.length },
        { id: 'dashboard', label: 'Dashboard', icon: Calculator },
        { id: 'inventory', label: 'Inventario', icon: Package },
        { id: 'settings', label: 'Configuración', icon: Settings },
        { id: 'help', label: 'Ayuda', icon: BookOpen }
    ];

    return (
        <SettingsProvider>
            <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-primary-500/30">
                {/* Header con Safe Area */}
                <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-md bg-opacity-80"
                    style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg shadow-lg shadow-primary-500/20">
                                    <ChefHat className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                        FreeCooking
                                    </h1>
                                    <p className="text-xs text-gray-400 font-medium">Cost Intelligence</p>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex space-x-1 items-center">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleViewChange(item.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative group ${currentView === item.id
                                            ? 'text-primary-400 bg-primary-500/10'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <item.icon className={`h-4 w-4 ${currentView === item.id ? 'text-primary-500' : ''}`} />
                                            {item.label}
                                            {item.count !== undefined && (
                                                <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                                                    {item.count}
                                                </span>
                                            )}
                                        </div>
                                        {currentView === item.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 mx-2 rounded-t-full"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                                <div className="h-6 w-px bg-gray-700 mx-2"></div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </nav>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700 active:bg-gray-600 transition-colors"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden border-t border-gray-700 bg-gray-800 overflow-hidden"
                            >
                                <div className="px-4 py-2 space-y-1">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleViewChange(item.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === item.id
                                                ? 'bg-primary-500/10 text-primary-400'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`h-5 w-5 ${currentView === item.id ? 'text-primary-500' : ''}`} />
                                                {item.label}
                                            </div>
                                            {item.count !== undefined && (
                                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                                    {item.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Main Content con Safe Area para Notch */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-safe relative z-0"
                    style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
                    <AnimatePresence mode="wait">
                        {currentView === 'recipes' && (
                            <motion.div
                                key="recipes"
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Mis Recetas</h2>
                                        <p className="text-gray-400">Gestiona tus escandallos y costos</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setEditingRecipe(null);
                                            setIsFormOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg shadow-primary-600/20"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Nueva Receta
                                    </motion.button>
                                </div>

                                <RecipeList onEdit={handleEdit} />
                            </motion.div>
                        )}

                        {currentView === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <Dashboard />
                            </motion.div>
                        )}

                        {currentView === 'inventory' && (
                            <motion.div
                                key="inventory"
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <MasterIngredientsManager />
                            </motion.div>
                        )}

                        {currentView === 'settings' && (
                            <motion.div
                                key="settings"
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <SettingsPage />
                            </motion.div>
                        )}

                        {currentView === 'help' && (
                            <motion.div
                                key="help"
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <HelpSection />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Recipe Form Modal */}
                <AnimatePresence>
                    {isFormOpen && (
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
                                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 rounded-2xl shadow-2xl border border-gray-700"
                            >
                                <RecipeForm
                                    onClose={handleCloseForm}
                                    recipeToEdit={editingRecipe}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Chatbot />
            </div>
        </SettingsProvider>
    );
}

function AppWrapper() {
    const { currentUser } = useAuth();
    return currentUser ? <AuthenticatedApp /> : <LoginPage />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppWrapper />
        </AuthProvider>
    );
}
