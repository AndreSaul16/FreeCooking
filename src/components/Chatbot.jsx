import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import useRecipeStore from '../store/recipeStore';
import Logger from '../utils/Logger';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Acceso al store
    const { addRecipe, masterIngredients, addStockMovement } = useRecipeStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Enviar historial de mensajes (limitado a los últimos 10 para contexto)
            const contextMessages = messages.slice(-10);
            const responseMessage = await aiService.sendMessage([...contextMessages, userMessage]);

            // Añadir respuesta del asistente
            setMessages(prev => [...prev, responseMessage]);

            // Manejar llamadas a herramientas
            if (responseMessage.tool_calls) {
                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    let toolResult = '';

                    Logger.info(`🤖 AI calling tool: ${functionName}`, args);

                    try {
                        if (functionName === 'createRecipe') {
                            // Validar y crear receta
                            // Mapear ingredientes de texto a IDs si es posible, o crear nuevos?
                            // Por simplicidad, intentaremos buscar ingredientes existentes por nombre
                            const processedIngredients = args.ingredients.map(ing => {
                                const existing = masterIngredients.find(mi => mi.name.toLowerCase() === ing.name.toLowerCase());
                                return {
                                    id: existing ? existing.id : Date.now().toString() + Math.random(), // ID temporal si no existe
                                    masterIngredientId: existing ? existing.id : null,
                                    name: ing.name,
                                    quantity: ing.quantity,
                                    unit: ing.unit,
                                    cost: ing.cost !== undefined ? ing.cost : (existing ? (existing.costPerUnit || 0) : 0) // Coste estimado o proporcionado
                                };
                            });

                            const newRecipe = {
                                name: args.name,
                                ingredients: processedIngredients,
                                instructions: args.instructions || '',
                                totalCost: 0, // Se calculará después
                                sellingPrice: 0
                            };

                            await addRecipe(newRecipe);
                            toolResult = `Receta "${args.name}" creada exitosamente.`;
                        }
                        else if (functionName === 'getStock') {
                            const ingredient = masterIngredients.find(mi => mi.name.toLowerCase() === args.ingredientName.toLowerCase());
                            if (ingredient) {
                                toolResult = `El stock actual de ${ingredient.name} es ${ingredient.currentStock} ${ingredient.unit}.`;
                            } else {
                                toolResult = `No encontré el ingrediente "${args.ingredientName}" en el inventario.`;
                            }
                        }
                        else if (functionName === 'updateStock') {
                            const ingredient = masterIngredients.find(mi => mi.name.toLowerCase() === args.ingredientName.toLowerCase());
                            if (ingredient) {
                                await addStockMovement({
                                    ingredientId: ingredient.id,
                                    ingredientName: ingredient.name,
                                    quantity: Math.abs(args.quantity),
                                    type: args.quantity >= 0 ? 'IN' : 'OUT', // Positivo = Compra, Negativo = Venta/Merma
                                    reason: args.reason || 'Actualización por IA'
                                });
                                toolResult = `Stock actualizado para ${ingredient.name}. Nuevo stock: ${ingredient.currentStock + args.quantity} ${ingredient.unit}.`;
                            } else {
                                toolResult = `No pude actualizar el stock porque no encontré el ingrediente "${args.ingredientName}".`;
                            }
                        }
                    } catch (err) {
                        Logger.error(`Error executing tool ${functionName}`, err);
                        toolResult = `Error al ejecutar la acción: ${err.message}`;
                    }

                    // Enviar resultado de la herramienta de vuelta a la IA
                    const toolMessage = {
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: toolResult
                    };
                    setMessages(prev => [...prev, toolMessage]);

                    // Obtener respuesta final de la IA tras la herramienta
                    const finalResponse = await aiService.sendMessage([...contextMessages, userMessage, responseMessage, toolMessage]);
                    setMessages(prev => [...prev, finalResponse]);
                }
            }

        } catch (error) {
            Logger.error("Error en chat:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu solicitud.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all z-50 flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Ventana de chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-white/5 backdrop-blur-lg border-b border-white/10 flex items-center gap-2">
                        <Bot className="text-emerald-500" size={20} />
                        <h3 className="font-semibold text-white">Asistente FreeCooking</h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">
                                <Bot className="mx-auto mb-2 opacity-50" size={48} />
                                <p>¡Hola! Soy tu asistente de cocina.</p>
                                <p className="text-sm">Puedo ayudarte a crear recetas o gestionar el stock.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            msg.role !== 'tool' && ( // No mostrar mensajes técnicos de herramientas
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white/5 backdrop-blur-lg text-white/90 rounded-bl-none'
                                        }`}>
                                        {msg.content || (msg.tool_calls ? <span className="italic text-sm opacity-75">Procesando solicitud...</span> : '')}
                                    </div>
                                </div>
                            )
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 backdrop-blur-lg p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                                    <Loader2 className="animate-spin text-emerald-500" size={16} />
                                    <span className="text-white/60 text-sm">Pensando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white/5 backdrop-blur-lg border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
