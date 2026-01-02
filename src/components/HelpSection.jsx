import React from 'react';
import { Book, DollarSign, Mic, Users, Package, ShoppingCart, Calculator, AlertTriangle, MessageCircle, Sparkles, ArrowRight, Cpu } from 'lucide-react';

export default function HelpSection() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Centro de Ayuda</h2>
                <p className="text-white/60">Guía completa para dominar FreeCooking</p>
            </div>

            {/* 🚀 FLUJO DE USO COMPLETO */}
            <section className="bg-gradient-to-br from-primary-500/10 to-emerald-500/10 backdrop-blur-xl border border-primary-400/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary-500/20 rounded-lg">
                        <ArrowRight className="h-6 w-6 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">🚀 Flujo de Uso Paso a Paso</h3>
                </div>

                <div className="space-y-6">
                    {/* Paso 1 */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-lg font-bold text-primary-400 mb-2">
                            <span className="bg-primary-500/20 px-2 py-1 rounded mr-2 font-mono">1</span>
                            Configura tu Inventario
                        </h4>
                        <p className="text-white/80 ml-10">
                            Ve a <strong>"Ingredientes"</strong> → Click <strong>"+ Nuevo Ingrediente"</strong> →
                            Añade tus ingredientes maestros con precios de compra y stock inicial.
                        </p>
                    </div>

                    {/* Paso 2 */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-lg font-bold text-emerald-400 mb-2">
                            <span className="bg-emerald-500/20 px-2 py-1 rounded mr-2 font-mono">2</span>
                            Crea tu Primera Receta (2 métodos)
                        </h4>
                        <div className="ml-10 space-y-3">
                            <div className="flex items-start gap-3">
                                <Mic className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <strong className="text-white">Método IA (Rápido):</strong>
                                    <p className="text-white/80">
                                        Click <strong>"+ Nueva Receta"</strong> → Mantén presionado el botón verde del micrófono →
                                        Di: <em>"Quiero tortilla de patata con 400g de patatas, 6 huevos y sal"</em> →
                                        La IA auto-completa ingredientes y cantidades ✨
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Book className="h-5 w-5 text-sky-400 flex-shrink-0 mt-1" />
                                <div>
                                    <strong className="text-white">Método Manual:</strong>
                                    <p className="text-white/80">
                                        Completa el formulario manualmente, selecciona ingredientes de tu inventario,
                                        define cantidades y precio de venta.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Paso 3 */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-lg font-bold text-amber-400 mb-2">
                            <span className="bg-amber-500/20 px-2 py-1 rounded mr-2 font-mono">3</span>
                            Analiza tus Números
                        </h4>
                        <p className="text-white/80 ml-10">
                            El sistema calcula automáticamente: <strong>Costo por Ración</strong>, <strong>Prime Cost</strong>
                            (materia prima + mano obra), <strong>Margen Real</strong> y <strong>Precio Sugerido</strong>.
                            Ver en tarjeta de receta con margen gigante a la derecha 📊
                        </p>
                    </div>

                    {/* Paso 4 */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-lg font-bold text-sky-400 mb-2">
                            <span className="bg-sky-500/20 px-2 py-1 rounded mr-2 font-mono">4</span>
                            Registra Ventas
                        </h4>
                        <p className="text-white/80 ml-10">
                            <strong>Dashboard</strong> → <strong>"Registrar Venta"</strong> → Elige receta y cantidad →
                            El sistema descuenta automáticamente ingredientes del inventario 🎯
                        </p>
                    </div>

                    {/* Paso 5 */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-lg font-bold text-purple-400 mb-2">
                            <span className="bg-purple-500/20 px-2 py-1 rounded mr-2 font-mono">5</span>
                            Monitorea Dashboard
                        </h4>
                        <p className="text-white/80 ml-10">
                            Ve estadísticas en tiempo real: recetas más rentables, ingredientes con stock bajo,
                            uso de ingredientes, beneficio promedio.
                        </p>
                    </div>
                </div>
            </section>

            {/* 🤖 SECCIÓN DE IA */}
            <section className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl border border-violet-400/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-violet-500/20 rounded-lg">
                        <Sparkles className="h-6 w-6 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">🤖 Inteligencia Artificial Integrada</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Asistente de Voz */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <Mic className="h-6 w-6 text-emerald-400" />
                            <h4 className="text-lg font-bold text-white">Voz a Receta</h4>
                        </div>
                        <p className="text-white/80 mb-3 text-sm">
                            Dicta ingredientes y cantidades en lenguaje natural. La IA extrae automáticamente:
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Nombre de ingredientes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Cantidades (400g, 2 cucharadas, etc.)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Unidades de medida</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Estimación de costos aproximados</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <p className="text-xs text-emerald-300 font-mono">
                                <strong>Ejemplo:</strong> "Gazpacho con 500g tomate, 200g pepino, 100g pimiento verde"
                            </p>
                        </div>
                    </div>

                    {/* Chatbot */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <MessageCircle className="h-6 w-6 text-sky-400" />
                            <h4 className="text-lg font-bold text-white">Asistente Conversacional</h4>
                        </div>
                        <p className="text-white/80 mb-3 text-sm">
                            Chatbot flotante (botón verde 💬) que puede:
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-sky-400">✓</span>
                                <span><strong>Crear recetas</strong> desde conversación</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-400">✓</span>
                                <span><strong>Consultar stock</strong> de ingredientes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-400">✓</span>
                                <span><strong>Actualizar inventario</strong> por comando</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-400">✓</span>
                                <span><strong>Responder preguntas</strong> sobre uso</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <p className="text-xs text-sky-300 font-mono">
                                <strong>Ejemplo:</strong> "¿Cuánto stock tengo de harina?"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tecnología */}
                <div className="mt-6 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-violet-400" />
                        <h5 className="font-semibold text-white">Tecnología OpenAI</h5>
                    </div>
                    <p className="text-sm text-white/70">
                        Powered by <strong>Whisper</strong> (transcripción 96% accuracy en español) +
                        <strong> GPT-4o-mini</strong> (extracción inteligente + function calling).
                        Procesamiento serverless en la nube.
                    </p>
                </div>
            </section>

            {/* FUNCIONALIDADES PRINCIPALES */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Gestión de Inventario */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/15 rounded-lg">
                            <Package className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Gestión de Inventario</h3>
                    </div>
                    <ul className="space-y-3 text-white/80">
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Stock Automático:</strong> Compras (IN) y Ventas (OUT)
                                actualizan stock en tiempo real.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Alertas Inteligentes:</strong> Ingredientes con stock
                                por debajo del mínimo se marcan en rojo en Dashboard.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Historial:</strong> Ve todas las entradas/salidas
                                de cada ingrediente.
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Multi-usuario */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/15 rounded-lg">
                            <Users className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Tu Espacio Privado</h3>
                    </div>
                    <p className="text-white/80 mb-4">
                        Cada usuario tiene su propia base de datos en la nube. Privado y seguro.
                    </p>
                    <ul className="space-y-2 text-white/60 text-sm">
                        <li>• Inicia sesión desde cualquier dispositivo</li>
                        <li>• Sincronización automática en tiempo real</li>
                        <li>• Modo offline (cambios se guardan al reconectar)</li>
                    </ul>
                </div>

                {/* Finanzas */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-500/15 rounded-lg">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Inteligencia Financiera</h3>
                    </div>
                    <ul className="space-y-3 text-white/80">
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span><strong className="text-white">Cálculos Automáticos:</strong> COGS, Prime Cost,
                                Margen Real (post-impuestos)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span><strong className="text-white">Precio Sugerido:</strong> Basado en tu margen
                                objetivo + pricing psicológico (.50, .90, .95)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span><strong className="text-white">Mermas Correctas:</strong> Usa fórmula profesional
                                (Costo / (1 - %Merma))</span>
                        </li>
                    </ul>
                </div>

                {/* Ventas */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-amber-500/15 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Registro de Ventas</h3>
                    </div>
                    <p className="text-white/80 mb-3">
                        Sistema de TPV simplificado para controlar inventario:
                    </p>
                    <ul className="space-y-2 text-white/60 text-sm">
                        <li>• Registra ventas por receta y cantidad</li>
                        <li>• Descuenta ingredientes automáticamente</li>
                        <li>• Historial de todas las transacciones</li>
                    </ul>
                </div>
            </div>

            {/* CONCEPTOS CLAVE */}
            <div className="space-y-8 mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Conceptos Clave</h2>
                </div>

                {/* Fórmulas Financieras */}
                <section className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-500/15 p-2 rounded-lg">
                            <Calculator className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Matemáticas tras bambalinas</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-white border-b border-white/20 pb-1">1. Mermas y Rendimiento (Yield)</h4>
                            <p className="text-sm text-white/60">
                                Muchos cocineros calculan mal la merma sumando un porcentaje. La forma correcta es dividir por el rendimiento.
                            </p>
                            <div className="bg-black/30 p-3 rounded text-xs font-mono text-emerald-300 border border-emerald-500/20">
                                Costo Real = Costo Teórico / (1 - %Merma)
                            </div>
                            <p className="text-xs text-white/40 italic">
                                Ejemplo: Pescado a 10€/kg con 40% merma → Costo real: 16.66€/kg (no 14€)
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-white border-b border-white/20 pb-1">2. Costo Primo (Prime Cost)</h4>
                            <p className="text-sm text-white/60">
                                Coste real de poner el plato en la mesa: materia prima + mano de obra directa.
                            </p>
                            <div className="bg-black/30 p-3 rounded text-xs font-mono text-sky-300 border border-sky-500/20">
                                Prime Cost = COGS + (Horas × Tarifa × 1.30)
                            </div>
                            <p className="text-xs text-white/40 italic">
                                +30% extra cubre Seguridad Social y vacaciones
                            </p>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-200/90">
                        <strong>Nota Importante:</strong> Esta app es una herramienta de estimación.
                        Los precios de mercado fluctúan. Úsala como guía, no como ley absoluta.
                    </p>
                </div>
            </div>
        </div>
    );
}
