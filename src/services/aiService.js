import Logger from '../utils/Logger';



const SYSTEM_PROMPT = `Eres un asistente experto en gestión de restaurantes y cocina para la aplicación FreeCooking.
Tu objetivo es ayudar al usuario a gestionar sus recetas e inventario.
Tienes acceso a herramientas para crear recetas, consultar stock y actualizar stock.

Reglas:
1. Si el usuario quiere crear una receta, pide los detalles necesarios SOLO si faltan datos críticos (nombre, ingredientes).
2. INFIERE las unidades si es posible (ej: "gramos" -> "g", "kilo" -> "kg", "litro" -> "l"). NO preguntes por unidades si son obvias.
3. Si el usuario proporciona precios o costes (ej: "a 3 euros el kg"), inclúyelos en la receta.
4. Si el usuario pregunta por stock, usa la herramienta getStock.
5. Si el usuario informa de una venta o compra, usa la herramienta updateStock.
6. Sé conciso y profesional.
7. Responde siempre en español.
`;

const TOOLS = [
    {
        type: "function",
        function: {
            name: "createRecipe",
            description: "Crea una nueva receta en el sistema",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Nombre de la receta" },
                    ingredients: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Nombre del ingrediente" },
                                quantity: { type: "number", description: "Cantidad necesaria" },
                                unit: { type: "string", description: "Unidad de medida (g, kg, l, ml, u)" },
                                cost: { type: "number", description: "Coste del ingrediente por unidad (opcional)" }
                            },
                            required: ["name", "quantity", "unit"]
                        }
                    },
                    instructions: { type: "string", description: "Instrucciones de preparación (opcional)" }
                },
                required: ["name", "ingredients"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getStock",
            description: "Consulta el stock actual de un ingrediente",
            parameters: {
                type: "object",
                properties: {
                    ingredientName: { type: "string", description: "Nombre del ingrediente a consultar" }
                },
                required: ["ingredientName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateStock",
            description: "Actualiza el stock de un ingrediente (venta, compra, merma)",
            parameters: {
                type: "object",
                properties: {
                    ingredientName: { type: "string", description: "Nombre del ingrediente" },
                    quantity: { type: "number", description: "Cantidad a sumar (compra) o restar (venta/merma)" },
                    reason: { type: "string", description: "Razón del movimiento (Venta, Compra, Merma)" }
                },
                required: ["ingredientName", "quantity", "reason"]
            }
        }
    }
];

export const aiService = {
    sendMessage: async (messages) => {
        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...messages
                    ],
                    tools: TOOLS,
                    tool_choice: "auto"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error de API: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message;

        } catch (error) {
            Logger.error("Error en aiService:", error);
            throw error;
        }
    }
};
