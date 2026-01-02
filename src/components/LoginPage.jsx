import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBiometrics, setShowBiometrics] = useState(false);
    const {
        login, signup, googleLogin,
        loginWithBiometrics, checkBiometrics, registerBiometrics
    } = useAuth();

    React.useEffect(() => {
        checkBiometrics().then(available => {
            if (available) setShowBiometrics(true);
        });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                if (showBiometrics) {
                    registerBiometrics(email, password).catch(e => console.log("Bio register skipped", e));
                }
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error(err);
            let msg = 'Error al iniciar sesión';
            if (err.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
            if (err.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
            if (err.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado';
            if (err.code === 'auth/weak-password') msg = 'La contraseña es muy débil';
            setError(msg);
        }

        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await googleLogin();
        } catch (err) {
            console.error(err);
            setError('Error al iniciar con Google');
            setLoading(false);
        }
    }

    async function handleBiometricLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithBiometrics();
        } catch (err) {
            console.error(err);
            setError('No se pudo iniciar con biometría. Usa tu contraseña.');
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Video Fullscreen Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/FoodVideoHD.mp4" type="video/mp4" />
                </video>
                {/* Dark overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
            </div>

            {/* Login Modal - Liquid Glass Effect */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Logo Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-block p-4 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 mb-6">
                            <ChefHat className="h-14 w-14 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-3 tracking-tight drop-shadow-2xl">
                            FreeCooking
                        </h1>
                        <p className="text-white/90 text-lg font-light drop-shadow-lg">
                            Tu cocina, tus costos, <span className="text-primary-300 font-semibold">bajo control</span>
                        </p>
                    </motion.div>

                    {/* Liquid Glass Card - Más Cristalino */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                        className="relative backdrop-blur-xl bg-white/5 border border-white/30 rounded-3xl p-8 shadow-2xl"
                        style={{
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Toggle Tabs */}
                            <div className="flex justify-center mb-8 bg-white/5 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin
                                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                        : 'text-white/60 hover:text-white/90'
                                        }`}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin
                                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                        : 'text-white/60 hover:text-white/90'
                                        }`}
                                >
                                    Registrarse
                                </button>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-6 flex items-start gap-3 text-white"
                                    >
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-sm font-semibold text-white/90 ml-1 block mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                                            placeholder="chef@restaurante.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-white/90 ml-1 block mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 hover:border-white/40 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Entrar' : 'Crear Cuenta'}
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="mt-8 mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white/5 backdrop-blur-sm text-white/70 font-medium rounded-full">
                                            O continúa con
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Login */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white hover:bg-white/95 text-gray-900 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>

                            {/* Biometric Login */}
                            {showBiometrics && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleBiometricLogin}
                                    disabled={loading}
                                    className="mt-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-white/20 disabled:opacity-50 hover:border-white/30"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                                    </svg>
                                    Huella / Face ID
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Footer hint */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-white/50 text-sm mt-6"
                    >
                        Sistema de gestión de costes profesional
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
