import React from 'react';
import { Book, DollarSign, BarChart2, Mic, Users, Package, ShoppingCart, BookOpen, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

export default function HelpSection() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Centro de Ayuda</h2>
                <p className="text-gray-400">Guía rápida para sacar el máximo partido a FreeCooking</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Gestión de Inventario (NUEVO) */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-900/30 rounded-lg">
                            <Package className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Gestión de Inventario</h3>
                    </div>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Stock Inicial:</strong> Ve a "Ingredientes" y usa el botón <Package className="h-4 w-4 inline mx-1" /> para añadir tus compras (Entradas).
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Venta Automática:</strong> Usa el botón "Registrar Venta" en el Dashboard. Al vender un plato, el sistema descuenta automáticamente los ingredientes de tu stock.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>
                                <strong className="text-white">Alertas:</strong> Los ingredientes con stock bajo se marcarán en rojo en la lista.
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Multi-usuario */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-900/30 rounded-lg">
                            <Users className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Tu Espacio Privado</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                        Ahora cada usuario tiene su propia base de datos. Tus recetas e ingredientes son privados y seguros en la nube.
                    </p>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li>• Inicia sesión desde cualquier dispositivo.</li>
                        <li>• Tus datos se sincronizan automáticamente.</li>
                        <li>• Modo offline disponible (los cambios se guardan al reconectar).</li>
                    </ul>
                </div>

                {/* Recetas */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary-900/30 rounded-lg">
                            <Book className="h-6 w-6 text-primary-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Creación de Recetas</h3>
                    </div>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex gap-2">
                            <span className="text-primary-400 font-bold">•</span>
                            <span>Usa el micrófono <Mic className="h-4 w-4 inline" /> para dictar recetas completas.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-400 font-bold">•</span>
                            <span>Añade ingredientes desde tu lista maestra para cálculos exactos.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-400 font-bold">•</span>
                            <span>Define el precio de venta para ver tu margen real.</span>
                        </li>
                    </ul>
                </div>

                {/* Finanzas */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-900/30 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Inteligencia Financiera</h3>
                    </div>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex gap-2">
                            <span className="text-green-400 font-bold">•</span>
                            <span><strong className="text-white">Prime Cost:</strong> Suma del coste de materia prima (COGS) + 10% estimado de costes variables.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-400 font-bold">•</span>
                            <span><strong className="text-white">Margen Real:</strong> Beneficio neto después de impuestos (10% IVA).</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-400 font-bold">•</span>
                            <span><strong className="text-white">Precios Psicológicos:</strong> El sistema sugiere precios terminados en .50, .90 o .95.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Sección de Conceptos (Mantenida) */}
            <div className="space-y-8 mt-12 pt-8 border-t border-gray-700">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Conceptos Clave</h2>
                </div>

                {/* 2. Fórmulas Financieras */}
                <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-900/50 p-2 rounded-lg">
                            <Calculator className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Matemáticas tras bambalinas</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-white border-b border-gray-700 pb-1">1. Mermas y Rendimiento (Yield)</h4>
                            <p className="text-sm text-gray-400">
                                Muchos cocineros calculan mal la merma sumando un porcentaje. La forma correcta es dividir por el rendimiento.
                            </p>
                            <div className="bg-gray-900 p-3 rounded text-xs font-mono text-blue-300">
                                Costo Real = Costo Teórico / (1 - %Merma)
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                Ejemplo: Si compras pescado a 10€/kg y pierdes el 40% en limpieza, el costo real de la carne limpia no es 14€, ¡es 16.66€!
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-white border-b border-gray-700 pb-1">2. Costo Primo (Prime Cost)</h4>
                            <p className="text-sm text-gray-400">
                                Es el coste real de poner el plato en la mesa. Suma la materia prima (COGS) y la mano de obra directa.
                            </p>
                            <div className="bg-gray-900 p-3 rounded text-xs font-mono text-blue-300">
                                Prime Cost = COGS + (Horas x Tarifa x 1.30)
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                Añadimos un 30% extra a la tarifa horaria para cubrir Seguridad Social y vacaciones.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-sm text-yellow-200/80">
                        <strong>Nota Importante:</strong> Esta aplicación es una herramienta de estimación. Los precios de mercado fluctúan y los tiempos de preparación reales pueden variar. Úsala como guía, no como ley absoluta.
                    </p>
                </div>
            </div>
        </div>
    );
}
