/**
 * Constantes de conversión a unidades base
 */
const UNIT_CONVERSIONS = {
    kg: 1000,     // a gramos
    g: 1,
    l: 1000,      // a mililitros
    ml: 1,
    unidades: 1,
    unidad: 1
};

/**
 * Calcula el costo real de un ingrediente aplicando merma y conversión de unidades
 * @param {number} quantityUsed - Cantidad usada en la receta
 * @param {string} unitUsed - Unidad usada en la receta (g, kg, ml, l, unidades)
 * @param {number} purchasePrice - Precio de compra por unidad de compra
 * @param {string} purchaseUnit - Unidad de compra (kg, l, unidades)
 * @param {number} wastePercentage - Porcentaje de merma (0-100)
 * @returns {number} - Costo real del ingrediente
 */
export function calculateIngredientCost(quantityUsed, unitUsed, purchasePrice, purchaseUnit, wastePercentage = 0) {
    // 1. Normalizar unidades (manejar plurales/singulares básicos)
    const normUnitUsed = unitUsed.toLowerCase().replace(/s$/, '');
    const normPurchaseUnit = purchaseUnit.toLowerCase().replace(/s$/, '');

    // 2. Obtener factores de conversión
    // Si la unidad no está en el mapa, asumimos 1 (riesgoso pero fallback)
    const quantityFactor = UNIT_CONVERSIONS[normUnitUsed] || UNIT_CONVERSIONS[unitUsed] || 1;
    const purchaseFactor = UNIT_CONVERSIONS[normPurchaseUnit] || UNIT_CONVERSIONS[purchaseUnit] || 1;

    // 3. Convertir cantidad usada a unidad base (g, ml, unidad)
    const quantityInBase = quantityUsed * quantityFactor;

    // 4. Calcular precio por unidad base
    // Ejemplo: 12€ / 1kg (1000g) = 0.012€/g
    const pricePerBaseUnit = purchasePrice / purchaseFactor;

    // 5. Calcular costo teórico (sin merma)
    const theoreticalCost = quantityInBase * pricePerBaseUnit;

    // 6. Aplicar merma (Yield Formula: Costo Real = Costo Teórico / (1 - %Merma))
    // Si waste es 10% (0.1), el rendimiento es 90% (0.9).
    const yieldFactor = 1 - (wastePercentage / 100);

    // Evitar división por cero o negativa
    if (yieldFactor <= 0.01) return theoreticalCost * 100; // Fallback de seguridad

    return theoreticalCost / yieldFactor;
}

/**
 * Cálculo de Costo de Bienes Vendidos (COGS)
 * @param {Array} ingredients - Array de ingredientes. 
 *                               Debe contener { quantity, unit, purchasePrice, purchaseUnit, wastePercentage } 
 *                               o estructura antigua { quantity, costPerUnit, wastePercentage }
 * @returns {number} - Costo total en euros
 */
export function calculateCOGS(ingredients) {
    return ingredients.reduce((total, ing) => {
        // Detectar si es estructura nueva (tiene purchasePrice)
        if (ing.purchasePrice !== undefined && ing.purchaseUnit) {
            return total + calculateIngredientCost(
                parseFloat(ing.quantity || ing.quantityUsed || 0),
                ing.unit || ing.unitUsed || 'g',
                parseFloat(ing.purchasePrice || 0),
                ing.purchaseUnit || 'kg',
                parseFloat(ing.wastePercentage || 0)
            );
        }

        // Fallback estructura antigua
        const baseCost = (parseFloat(ing.quantity) || 0) * (parseFloat(ing.costPerUnit) || 0);
        // Antigua fórmula de merma (incorrecta pero mantenida para compatibilidad legacy si fuera necesario, 
        // aunque idealmente migraremos todo)
        // La antigua era: base * (1 + waste). La nueva es base / (1 - waste).
        // Usaremos la NUEVA fórmula incluso para datos viejos si es posible, 
        // pero como costPerUnit ya venía "calculado" o "estimado", mejor respetamos la lógica simple anterior
        // para no romper precios viejos drásticamente sin migración.
        // PERO el usuario pidió corregir la fórmula. Así que aplicaremos la fórmula correcta si hay waste.

        const waste = parseFloat(ing.wastePercentage || 0);
        const yieldFactor = 1 - (waste / 100);
        const realCost = yieldFactor > 0 ? baseCost / yieldFactor : baseCost;

        return total + realCost;
    }, 0);
}

/**
 * Cálculo de Costo Primo (COGS + Mano de Obra)
 * @param {number} cogs - Costo de ingredientes
 * @param {number} prepTimeMinutes - Tiempo de preparación en minutos
 * @param {object} settings - Configuración del negocio (laborCostPerHour, socialSecurityPercent)
 * @returns {number} - Costo Primo en euros
 */
export function calculatePrimeCost(cogs, prepTimeMinutes, settings) {
    // Usar valores de settings o defaults por compatibilidad
    const hourlyRate = settings?.laborCostPerHour || 12;
    const socialSecurityPercent = settings?.socialSecurityPercent || 30;

    // Labor con overhead de seguridad social/impuestos
    const laborRateWithOverhead = hourlyRate * (1 + socialSecurityPercent / 100);
    const laborCost = (prepTimeMinutes / 60) * laborRateWithOverhead;
    return cogs + laborCost;
}

/**
 * Recomienda precio de venta basado en margen objetivo
 * @param {number} primeCost - Costo Primo (COGS + Labor) del batch completo
 * @param {object} settings - Configuración del negocio (targetMarginPercent, taxPercent, pricesIncludeTax, psychologicalPricing)
 * @param {number} servings - Número de raciones que produce la receta (default: 1)
 * @returns {object} - { suggestedPrice, markup, fcPercent }
 */
export function suggestPrice(primeCost, settings, servings = 1) {
    // Usar valores de settings o defaults por compatibilidad
    const targetMarginPercent = settings?.targetMarginPercent || 70;
    const taxPercent = settings?.taxPercent || 10;
    const pricesIncludeTax = settings?.pricesIncludeTax || false;
    const psychologicalPricing = settings?.psychologicalPricing !== false; // Por defecto true

    // Calcular el costo primo por ración
    const primeCostPerServing = primeCost / servings;

    // Fórmula de Margen: Precio = Costo / (1 - %Margen)
    // Ejemplo: Costo 3€, Margen 70% -> 3 / 0.3 = 10€
    // Esto es equivalente al multiplicador x3.33

    const marginDecimal = targetMarginPercent / 100;

    // Evitar división por cero o márgenes imposibles (>= 100%)
    if (marginDecimal >= 0.99) return { suggestedPrice: 0, markup: 0, fcPercent: 0 };

    let suggestedPrice = primeCostPerServing / (1 - marginDecimal);

    // Aplicar IVA si los precios NO lo incluyen
    if (!pricesIncludeTax) {
        suggestedPrice *= (1 + taxPercent / 100);
    }

    // Aplicar redondeo psicológico solo si está activado
    if (psychologicalPricing) {
        suggestedPrice = roundToNearestPsychological(suggestedPrice);
    } else {
        // Redondeo simple a 2 decimales
        suggestedPrice = Math.round(suggestedPrice * 100) / 100;
    }

    // Markup = (Precio - Costo) / Costo
    // Ejemplo: Precio 10, Costo 3. Markup = 7/3 = 2.33 (233%)
    const markup = primeCostPerServing > 0 ? (suggestedPrice - primeCostPerServing) / primeCostPerServing : 0;

    // Food Cost % (o Prime Cost %) = Costo / Precio
    const fcPercent = suggestedPrice > 0 ? (primeCostPerServing / suggestedPrice) * 100 : 0;

    return {
        suggestedPrice: suggestedPrice,
        markup: parseFloat(markup.toFixed(2)),
        fcPercent: parseFloat(fcPercent.toFixed(1))
    };
}

/**
 * Redondea a precios psicológicos (.50, .95 o enteros)
 * Ahora más conservador para evitar redondear demasiado
 * @param {number} price - Precio a redondear
 * @returns {number} - Precio redondeado
 */
function roundToNearestPsychological(price) {
    // Solo redondear si el precio no es ya un número "bonito"
    const cents = (price % 1).toFixed(2);
    
    if (price < 5) {
        // Precios bajos: .95 o .50
        if (Math.abs(price - Math.floor(price) - 0.95) < 0.05) return Math.floor(price) + 0.95;
        if (Math.abs(price - Math.floor(price) - 0.50) < 0.05) return Math.floor(price) + 0.50;
        // Si ya está cerca de un número redondo, dejarlo
        if (price % 0.50 < 0.10) return Math.round(price * 2) / 2;
        return price; // No redondear si no está cerca
    } else if (price < 15) {
        // Precios medios: redondear solo a .00 o .50 si está muy cerca
        const rounded = Math.round(price * 2) / 2;
        // Solo redondear si la diferencia es menor a 0.25€
        if (Math.abs(rounded - price) < 0.25) return rounded;
        return Math.round(price * 100) / 100; // Redondear a 2 decimales
    } else {
        // Precios altos: enteros solo si está muy cerca
        if (Math.abs(Math.round(price) - price) < 0.30) return Math.round(price);
        return Math.round(price * 100) / 100; // Redondear a 2 decimales
    }
}

/**
 * Clasifica un plato en la Matriz de Ingeniería de Menús
 * @param {number} profitMargin - Margen de beneficio %
 * @param {number} monthlySales - Ventas mensuales (unidades)
 * @param {number} avgMargin - Margen promedio del menú
 * @param {number} avgSales - Ventas promedio del menú
 * @returns {string} - "star" | "plow" | "puzzle" | "dog"
 */
export function classifyMenuItem(profitMargin, monthlySales, avgMargin, avgSales) {
    const highProfit = profitMargin >= avgMargin;
    const highSales = monthlySales >= avgSales;

    if (highProfit && highSales) return 'star';
    if (!highProfit && highSales) return 'plow';
    if (highProfit && !highSales) return 'puzzle';
    return 'dog';
}

/**
 * Obtiene el nombre y descripción de la categoría de menú
 * @param {string} category - "star" | "plow" | "puzzle" | "dog"
 * @returns {object} - { name, description, action }
 */
export function getMenuCategoryInfo(category) {
    const categories = {
        star: {
            name: '⭐ Estrella',
            description: 'Alta rentabilidad + Alta popularidad',
            action: 'Mantener calidad estricta y promocionar',
            color: '#4CAF50'
        },
        plow: {
            name: '🐴 Caballo de Batalla',
            description: 'Baja rentabilidad + Alta popularidad',
            action: 'Reducir costos o subir precio gradualmente',
            color: '#FFC107'
        },
        puzzle: {
            name: '🧩 Puzzle',
            description: 'Alta rentabilidad + Baja popularidad',
            action: 'Investigar barreras de venta y promocionar',
            color: '#2196F3'
        },
        dog: {
            name: '🐕 Perro',
            description: 'Baja rentabilidad + Baja popularidad',
            action: 'Considerar eliminar del menú',
            color: '#F44336'
        }
    };

    return categories[category] || categories.dog;
}
