import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Check, AlertCircle } from 'lucide-react';

export default function VoiceRecipeBtn({ onRecipeExtracted, disabled = false, mode = 'recipe' }) {
    const [status, setStatus] = useState('idle'); // idle | recording | processing | success | error
    const [errorMessage, setErrorMessage] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    const startRecording = async () => {
        if (disabled || status === 'processing') return;

        try {
            console.log('🎤 Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('🛑 Recording stopped, processing audio...');
                setStatus('processing');

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log(`📦 Audio blob created: ${audioBlob.size} bytes`);

                // Detener el stream del micrófono
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                await sendToBackend(audioBlob);
            };

            mediaRecorder.start();
            setStatus('recording');
            setErrorMessage('');
            console.log('✅ Recording started');

        } catch (error) {
            console.error('❌ Error accessing microphone:', error);
            setStatus('error');
            setErrorMessage('No se pudo acceder al micrófono. Verifica los permisos.');

            // Limpiar stream si existe
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('🔴 Stopping recording...');
            mediaRecorderRef.current.stop();
        }
    };

    const sendToBackend = async (audioBlob) => {
        try {
            console.log('📤 Sending audio to backend...');

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            // Determinar URL según entorno
            const baseUrl = import.meta.env.DEV
                ? 'http://localhost:8888' // Netlify Dev local
                : ''; // Producción usa relative path

            const response = await fetch(`${baseUrl}/.netlify/functions/voice-to-recipe?mode=${mode}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Backend response:', data);

            if (data.success && data.recipe) {
                setStatus('success');
                onRecipeExtracted(data.recipe);

                // Reset a idle después de 2 segundos
                setTimeout(() => {
                    setStatus('idle');
                }, 2000);
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('❌ Error sending audio to backend:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Error al procesar el audio. Inténtalo de nuevo.');

            // Reset a idle después de 3 segundos
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 3000);
        }
    };

    const getButtonClass = () => {
        const baseClass = 'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all transform focus:outline-none focus:ring-2 focus:ring-primary-500';

        switch (status) {
            case 'recording':
                return `${baseClass} bg-red-600 hover:bg-red-700 text-white scale-105 shadow-lg shadow-red-500/50`;
            case 'processing':
                return `${baseClass} bg-blue-600 text-white cursor-wait opacity-75`;
            case 'success':
                return `${baseClass} bg-green-600 text-white`;
            case 'error':
                return `${baseClass} bg-red-600 text-white`;
            default:
                return `${baseClass} bg-primary-600 hover:bg-primary-700 text-white hover:scale-105`;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'recording':
                return 'Grabando... (suelta para enviar)';
            case 'processing':
                return 'Procesando con IA...';
            case 'success':
                return '¡Receta cargada!';
            case 'error':
                return 'Error';
            default:
                return 'Chef Mode ✨';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'recording':
                return <MicOff className="h-5 w-5 animate-pulse" />;
            case 'processing':
                return <Loader2 className="h-5 w-5 animate-spin" />;
            case 'success':
                return <Check className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Mic className="h-5 w-5" />;
        }
    };

    return (
        <div className="relative group">
            <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={() => {
                    if (status === 'recording') stopRecording();
                }}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                onContextMenu={(e) => e.preventDefault()}
                disabled={disabled || status === 'processing'}
                className={`${getButtonClass()} select-none touch-none relative overflow-hidden`}
                title="Mantén presionado y dicta tu receta"
            >
                {/* Pulse animation ring */}
                {status === 'recording' && (
                    <span className="absolute inset-0 rounded-lg animate-ping bg-red-500 opacity-75"></span>
                )}

                <div className="relative flex items-center gap-2">
                    {getIcon()}
                    <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
            </button>

            {errorMessage && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-red-900/90 border border-red-700/50 rounded-lg p-3 text-sm text-red-200 shadow-lg z-50 backdrop-blur-sm">
                    {errorMessage}
                </div>
            )}

            {/* Tooltip: Show on hover or if idle (but less intrusive) */}
            {status === 'idle' && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-900/90 border border-gray-700/50 rounded-lg p-3 text-xs text-gray-300 text-center shadow-xl backdrop-blur-sm">
                        {mode === 'ingredient'
                            ? '💡 Dicta: "Tomates a 5 euros el kilo con 10% de merma"'
                            : '💡 Mantén presionado y dicta: "Haz una tortilla con 5 huevos..."'
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
