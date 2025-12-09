import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-red-500/50 rounded-xl p-8 max-w-lg w-full shadow-2xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">¡Ups! Algo salió mal</h1>
                        <p className="text-gray-300 mb-4">
                            Ha ocurrido un error inesperado en la aplicación.
                        </p>

                        {this.state.error && this.state.error.code === 'auth/invalid-api-key' && (
                            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-4">
                                <h3 className="font-bold text-red-400 mb-2">Error de Configuración Detectado</h3>
                                <p className="text-sm text-gray-300">
                                    Parece que faltan las claves de configuración de Firebase.
                                    Si eres el administrador, por favor verifica las variables de entorno en Netlify.
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-48 mb-6 border border-gray-700">
                            <code className="text-xs text-red-400 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
