import OpenAI from 'openai';
import Busboy from 'busboy';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT_RECIPE = `Eres un asistente especializado en extraer información estructurada de recetas dictadas por chefs.

Tu tarea es analizar la transcripción de una receta y extraer los siguientes datos en formato JSON:

{
  "name": "Nombre del plato (inferido del contexto)",
  "prepTime": número (minutos de preparación),
  "servings": número (raciones, estima si no se menciona),
  "ingredients": [
    {
      "name": "nombre del ingrediente (sin artículos)",
      "quantity": número,
      "unit": "unidad (g, kg, ml, l, ud, unidad)"
    }
  ],
  "steps": "Descripción de los pasos si se mencionan"
}

REGLAS CRÍTICAS:
1. name: NUNCA vacío, inferir del contexto o tipo de preparación
2. prepTime: Si no se menciona, estima basándote en complejidad (default: 30)
3. servings: Si no se menciona, estima (default: 4)
4. ingredients: SIEMPRE array, mínimo 1 ingrediente
5. quantity: SIEMPRE número, nunca string
6. unit: Normalizar a: g, kg, ml, l, ud, unidad
7. steps: Puede ser string vacío si no se mencionan pasos

Ejemplos de normalización:
- "medio kilo de patatas" → {"name": "patatas", "quantity": 500, "unit": "g"}
- "5 huevos" → {"name": "huevos", "quantity": 5, "unit": "ud"}
- "100 mililitros de aceite" → {"name": "aceite", "quantity": 100, "unit": "ml"}
- "un litro de leche" → {"name": "leche", "quantity": 1, "unit": "l"}
- "200 gramos de azúcar" → {"name": "azúcar", "quantity": 200, "unit": "g"}

IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional ni markdown.`;

const SYSTEM_PROMPT_INGREDIENT = `Eres un asistente especializado en extraer información de ingredientes de cocina para inventario.

Tu tarea es analizar la transcripción y extraer los datos de UN ingrediente en formato JSON:

{
  "name": "Nombre del ingrediente (singular, capitalizado)",
  "purchasePrice": número (precio total pagado),
  "purchaseUnit": "unidad de compra (kg, l, unidad)",
  "wastePercentage": número (porcentaje de merma, 0 si no se menciona)
}

REGLAS CRÍTICAS:
1. name: Ejemplo "Tomate", "Harina de Trigo", "Aceite de Oliva"
2. purchasePrice: Extraer el valor numérico del precio mencionado.
3. purchaseUnit: Normalizar a 'kg', 'l', o 'unidad'. Si dicen "botella de litro", es 'l'. Si dicen "paquete de kilo", es 'kg'.
4. wastePercentage: Si dicen "merma del 10%", es 10. Si no dicen nada, es 0.

Ejemplos:
- "Compré tomates a 5 euros el kilo" → {"name": "Tomate", "purchasePrice": 5, "purchaseUnit": "kg", "wastePercentage": 0}
- "Una botella de aceite de oliva de un litro por 12 euros" → {"name": "Aceite de Oliva", "purchasePrice": 12, "purchaseUnit": "l", "wastePercentage": 0}
- "Alcachofas a 3 euros la unidad con 40% de merma" → {"name": "Alcachofa", "purchasePrice": 3, "purchaseUnit": "unidad", "wastePercentage": 40}

IMPORTANTE: Devuelve SOLO el JSON válido.`;

// Helper para parsear multipart/form-data
function parseMultipartForm(event) {
    return new Promise((resolve, reject) => {
        const busboy = Busboy({
            headers: {
                'content-type': event.headers['content-type'] || event.headers['Content-Type']
            }
        });

        let fileData = null;
        let fileName = null;

        busboy.on('file', (fieldname, file, info) => {
            fileName = info.filename;
            const chunks = [];

            file.on('data', (chunk) => {
                chunks.push(chunk);
            });

            file.on('end', () => {
                fileData = Buffer.concat(chunks);
            });
        });

        busboy.on('finish', () => {
            if (!fileData) {
                reject(new Error('No file uploaded'));
                return;
            }
            resolve({ buffer: fileData, filename: fileName });
        });

        busboy.on('error', reject);

        // Decodificar base64 si es necesario
        const body = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64')
            : event.body;

        busboy.write(body);
        busboy.end();
    });
}

export const handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        console.log('🎤 Starting voice-to-recipe processing...');

        // Verificar API key
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        // 1. Parsear multipart/form-data para obtener el audio
        console.log('📦 Parsing multipart form data...');
        const { buffer, filename } = await parseMultipartForm(event);
        console.log(`✅ File received: ${filename}, size: ${buffer.length} bytes`);

        // Crear File object compatible con OpenAI SDK
        const audioFile = new File([buffer], filename || 'recording.webm', {
            type: 'audio/webm'
        });

        // 2. PASO A: Transcribir con Whisper-1
        console.log('🎧 Transcribing with Whisper-1...');
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'es',
            response_format: 'text'
        });

        console.log(`✅ Transcription: "${transcription}"`);

        if (!transcription || transcription.trim().length === 0) {
            throw new Error('Empty transcription received');
        }

        // 3. Extraer datos con GPT-4o-mini
        const mode = event.queryStringParameters?.mode || 'recipe';
        const systemPrompt = mode === 'ingredient' ? SYSTEM_PROMPT_INGREDIENT : SYSTEM_PROMPT_RECIPE;

        console.log(`🧠 Processing with GPT-4o-mini (Mode: ${mode})...`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: transcription }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1
        });

        const jsonResponse = completion.choices[0].message.content;
        console.log(`✅ GPT-4 response: ${jsonResponse}`);

        // 4. Parsear y validar JSON
        const parsedData = JSON.parse(jsonResponse);

        if (mode === 'recipe') {
            // Validación básica para receta
            if (!parsedData.name || !parsedData.ingredients || parsedData.ingredients.length === 0) {
                throw new Error('Invalid recipe data structure');
            }
            // Asegurar tipos correctos
            parsedData.prepTime = parseInt(parsedData.prepTime) || 30;
            parsedData.servings = parseInt(parsedData.servings) || 4;
            parsedData.steps = parsedData.steps || '';
        } else {
            // Validación básica para ingrediente
            if (!parsedData.name || !parsedData.purchaseUnit) {
                throw new Error('Invalid ingredient data structure');
            }
        }

        console.log('✅ Data validated successfully');

        // 5. Devolver datos estructurados
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                transcription: transcription,
                recipe: parsedData // Mantenemos key 'recipe' por compatibilidad, aunque sea ingrediente
            })
        };

    } catch (error) {
        console.error('❌ Error processing request:', error);

        // Log detallado de errores de OpenAI
        if (error.response) {
            console.error('OpenAI API Error Data:', error.response.data);
            console.error('OpenAI API Error Status:', error.response.status);
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error processing request',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
