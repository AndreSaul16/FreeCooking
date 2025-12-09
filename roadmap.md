# Análisis del Proyecto FreeCooking

## Estado Actual
FreeCooking es una herramienta de **Inteligencia de Costos** para restauración. Su núcleo es sólido: permite crear recetas, calcular costos precisos (incluyendo mermas), y sugiere precios basados en márgenes objetivos. También incluye una clasificación básica de ingeniería de menús.

### Puntos Fuertes
1.  **Lógica de Costos Robusta**: El archivo [calculations.js](file:///c:/Users/Saul/Documents/PROGRAMACION/FreeCooking/src/services/calculations.js) maneja correctamente conversiones de unidades, mermas (yield), COGS y Costo Primo.
2.  **Interfaz Moderna**: Uso de React + Tailwind con animaciones (Framer Motion) y un diseño limpio.
3.  **Arquitectura Modular**: Separación clara entre UI (`components`), Lógica (`services/utils`) y Estado (`store`).

### Áreas de Mejora (Para ser la "Solución Definitiva")
Para competir con software de gestión de restaurantes de alto nivel (como MarketMan, Xoco, o Recetario.net), faltan módulos críticos que van más allá del simple escandallo.

## Roadmap Propuesto

### 1. Gestión de Usuarios y Equipos (En Progreso)
-   **Multi-usuario real**: Cada chef/gerente tiene sus datos privados.
-   **Roles y Permisos**: (Futuro) Chef Ejecutivo (edita todo), Cocinero (solo ve recetas), Gerente (ve costos).

### 2. Gestión de Inventario Real
-   **Stock Actual**: No solo una lista de ingredientes maestros, sino cantidades reales en almacén.
-   **Movimientos de Stock**: Entradas (compras) y Salidas (ventas/mermas).
-   **Alertas de Stock Bajo**: Notificaciones cuando un ingrediente baja del mínimo.

### 3. Gestión de Proveedores y Compras
-   **Base de Datos de Proveedores**: Asociar ingredientes a proveedores.
-   **Órdenes de Compra**: Generar listas de compra automáticas basadas en stock bajo o planificación de producción.
-   **Comparativa de Precios**: Histórico de precios de ingredientes para detectar inflación.

### 4. Ingeniería de Menús Avanzada
-   **Simulación de Escenarios**: "¿Qué pasa con mi margen si el aguacate sube un 20%?".
-   **Diseño de Carta**: Exportar la carta en PDF/QR con alérgenos calculados automáticamente.

### 5. Integraciones y Exportación
-   **Exportación**: PDF, Excel de escandallos para imprimir en cocina.
-   **Importación**: Carga masiva de ingredientes desde Excel.

## Plan de Acción Inmediato (Fase 1)
1.  **Autenticación**: Implementar Login/Registro con Firebase Auth.
2.  **Segregación de Datos**: Asegurar que cada usuario vea solo sus recetas.
3.  **Corrección de Errores**: Ya realizada (RecipeCard crash).

¿Te gustaría priorizar alguno de los puntos del Roadmap después de la autenticación?
