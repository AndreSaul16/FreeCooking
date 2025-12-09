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
    const [showPasskey, setShowPasskey] = useState(false);
    const {
        login, signup, googleLogin,
        loginWithBiometrics, checkBiometrics, registerBiometrics,
        loginWithPasskey, checkWebAuthn, registerPasskey
    } = useAuth();

    React.useEffect(() => {
        // Verificar sistema antiguo (NativeBiometric)
        checkBiometrics().then(available => {
            if (available) setShowBiometrics(true);
        });

        // Verificar WebAuthn (Sistema nuevo)
        checkWebAuthn().then(available => {
            if (available) setShowPasskey(true);
        });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);

                // Después de login exitoso, ofrecer registro de passkey si está disponible
                if (showPasskey) {
                    // Intentar registrar passkey silenciosamente
                    // En producción, podrías mostrar un modal preguntando al usuario
                    registerPasskey().catch(e => console.log("Passkey register skipped", e));
                } else if (showBiometrics) {
                    // Fallback al sistema antiguo
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

    async function handlePasskeyLogin() {
        try {
            if (!email) {
                setError('Ingresa tu email para iniciar con passkey');
                return;
            }

            setError('');
            setLoading(true);
            await loginWithPasskey(email);
        } catch (err) {
            console.error(err);
            let msg = 'No se pudo iniciar con passkey. Usa tu contraseña.';
            if (err.message.includes('no encontró')) {
                msg = 'No tienes un passkey registrado. Inicia sesión con contraseña primero.';
            }
            setError(msg);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/20 mb-4">
                        <ChefHat className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">FreeCooking</h1>
                    <p className="text-gray-400">Tu cocina, tus costos, bajo control.</p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-xl"
                >
                    <div className="flex justify-center mb-6 bg-gray-900/50 p-1 rounded-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-400 text-sm"
                        >
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="chef@restaurante.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-500">O continúa con</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="mt-6 w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

                        {showPasskey && isLogin && (
                            <button
                                onClick={handlePasskeyLogin}
                                disabled={loading}
                                className="mt-3 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-primary-500 shadow-lg shadow-primary-600/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Usar Passkey (Huella / FaceID / PIN)
                            </button>
                        )}

                        {showBiometrics && !showPasskey && (
                            <button
                                onClick={handleBiometricLogin}
                                disabled={loading}
                                className="mt-3 w-full bg-gray-700 text-white hover:bg-gray-600 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                                </svg>
                                Iniciar con Huella / FaceID
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
