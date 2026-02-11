import { useState } from 'react';
import { User, Mail, Phone, Camera, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function UserProfile({ onClose }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phoneNumber || '',
        photoURL: currentUser?.photoURL || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Actualizar nombre y foto de perfil
            if (formData.displayName !== currentUser.displayName ||
                formData.photoURL !== currentUser.photoURL) {
                await updateProfile(auth.currentUser, {
                    displayName: formData.displayName,
                    photoURL: formData.photoURL
                });
            }

            // Actualizar email (requiere reautenticación reciente)
            if (formData.email !== currentUser.email) {
                try {
                    await updateEmail(auth.currentUser, formData.email);
                } catch (err) {
                    if (err.code === 'auth/requires-recent-login') {
                        setError('Para cambiar el email necesitas cerrar sesión y volver a entrar');
                    } else {
                        throw err;
                    }
                }
            }

            setSuccess('¡Perfil actualizado correctamente!');
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-white">Mi Perfil</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-white/60 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Avatar/Photo Section */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/20 shadow-lg">
                <div className="relative">
                    {formData.photoURL ? (
                        <img
                            src={formData.photoURL}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <User className="h-10 w-10 text-white" />
                        </div>
                    )}
                    <button
                        type="button"
                        className="absolute -bottom-1 -right-1 p-1 bg-primary-600 hover:bg-primary-700 rounded-full border-2 border-gray-900 transition-all shadow-md"
                        title="Cambiar foto"
                    >
                        <Camera className="h-3 w-3 text-white" />
                    </button>
                </div>
                <div>
                    <p className="text-white font-medium">{formData.displayName || 'Sin nombre'}</p>
                    <p className="text-sm text-white/60">{formData.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Usuario desde {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Nombre Completo
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => handleChange('displayName', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Tu nombre"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Cambiar el email requiere cerrar sesión y volver a entrar
                    </p>
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Teléfono (opcional)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="+34 600 000 000"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Nota: El campo de teléfono es solo informativo
                    </p>
                </div>

                {/* URL de Foto */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        URL de Foto de Perfil (opcional)
                    </label>
                    <input
                        type="url"
                        value={formData.photoURL}
                        onChange={(e) => handleChange('photoURL', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://..."
                    />
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-sm text-green-400">
                        {success}
                    </div>
                )}

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-glass-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 flex gap-2">
                <User className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200">
                    Tu información de perfil es privada y solo tú puedes verla. Los cambios se sincronizan automáticamente con Firebase Auth.
                </p>
            </div>
        </div>
    );
}

