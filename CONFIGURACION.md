# Configuración de Variables de Entorno para FreeCooking

## 📋 Variables Necesarias

FreeCooking requiere configurar variables de entorno para Firebase (base de datos) y OpenAI (funcionalidad de dictado por voz Chef Mode).

### Variables de Firebase (Frontend)

Estas variables se usan en el **frontend** y deben tener el prefijo `VITE_`:

```
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Variable de OpenAI (Backend/Functions)

Esta variable se usa en las **Netlify Functions** y **NO** lleva prefijo `VITE_`:

```
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXX
```

---

## 🔧 Configuración en Netlify

### Paso 1: Acceder a las Variables de Entorno

1. Ve a tu dashboard de Netlify: https://app.netlify.com
2. Selecciona tu sitio FreeCooking
3. Ve a **Site settings** → **Environment variables**

### Paso 2: Añadir las Variables

Para cada variable:

1. Click en "Add a variable" o "Add environment variable"
2. **Key**: Nombre de la variable (ej: `VITE_FIREBASE_API_KEY`)
3. **Values**: 
   - **Scopes**: Selecciona "All scopes" o específicamente "Builds" y "Functions"
   - Pega el valor de tu variable
4. Click "Save"

### Variables a Configurar

#### Firebase (8 variables con prefijo VITE_)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

#### OpenAI (1 variable SIN prefijo)
- `OPENAI_API_KEY`

---

## 🔍 Cómo Obtener las Credenciales

### Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Project Settings** (ícono de engranaje)
4. En la sección "Your apps", busca tu app web
5. En "SDK setup and configuration", selecciona "Config"
6. Copia los valores de `firebaseConfig`

Ejemplo de lo que verás:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### OpenAI

1. Ve a [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Inicia sesión en tu cuenta
3. Click en "Create new secret key"
4. Copia la key (empieza con `sk-proj-`)
5. ⚠️ **IMPORTANTE**: Guárdala inmediatamente, no podrás verla después

---

## 🧪 Probar Localmente

### Desarrollo Local con Netlify Dev

1. Crea un archivo **.env** en la raíz del proyecto (NO lo subas a Git)
2. Añade todas las variables:

```bash
# Firebase (Frontend)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# OpenAI (Backend Functions)
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXX
```

3. Ejecuta con Netlify Dev:
```bash
netlify dev
```

Este comando:
- Levanta Vite en el puerto configurado
- Levanta las Functions en `/.netlify/functions/`
- Aplica las variables de entorno correctamente

---

## ✅ Verificar que Funciona

### 1. Verificar Firebase

1. Abre la app en producción
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Busca mensajes como:
   - `🚀 App mounted, initializing...`
   - `🔥 Firebase initialized successfully`
   - `📊 Firestore listeners initialized`

5. Crea un ingrediente en el **Inventario Maestro**
6. Ve a Firebase Console → Firestore Database
7. Verifica que aparezca en la colección `masterIngredients`

### 2. Verificar OpenAI (Chef Mode)

**IMPORTANTE**: Chef Mode solo se muestra si tienes ingredientes en el inventario maestro.

1. Crea al menos UN ingrediente en "Inventario Maestro" (ej: "Huevos")
2. Click en "+ Nueva Receta"
3. Deberías ver el botón **"Chef Mode ✨"** en el header del modal
4. Click y mantén presionado el botón
5. Dicta algo como: "Haz una tortilla con 5 huevos y 100 ml de aceite"
6. Suelta el botón
7. Deberías ver:
   - "Procesando con IA..."
   - "¡Receta cargada!"
   - Los campos se rellenan automáticamente

### 3. Verificar Logs en Netlify

Si algo falla:

1. Ve a Netlify Dashboard → **Functions**
2. Click en `voice-to-recipe`
3. Ve a **Function log**
4. Busca errores como:
   - `OPENAI_API_KEY not configured` → La variable no está configurada
   - `Invalid API key` → La key es incorrecta o expiró
   - `Error connecting to Firestore` → Problema con Firebase

---

## ❓ Problemas Comunes

### "No veo el botón Chef Mode"

**Causa**: El botón solo aparece si hay ingredientes en el inventario maestro.

**Solución**:
1. Ve a la pestaña "Inventario"
2. Crea al menos un ingrediente (ej: "Huevos", precio 2.50€/kg)
3. Vuelve a "+ Nueva Receta"
4. Ahora debería aparecer el botón

### "No se guardan datos en Firestore"

**Causas posibles**:
1. Variables `VITE_FIREBASE_*` mal configuradas
2. Reglas de seguridad de Firestore muy restrictivas
3. Proyecto de Firebase no activado

**Solución**:
1. Verifica las variables en Netlify
2. Ve a Firebase Console → Firestore Database → Rules
3. Para desarrollo, puedes usar (TEMPORALMENTE):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ Solo para desarrollo
    }
  }
}
```
4. Para producción, implementa reglas seguras

### "Error de CORS en Functions"

**Causa**: La función no tiene los headers CORS correctos.

**Solución**: Ya está implementado en `voice-to-recipe.js`, pero verifica que esté desplegada la última versión.

---

## 🔐 Seguridad

### ⚠️ NUNCA subas el archivo `.env` a Git

El archivo `.gitignore` ya lo incluye:
```
.env
.env.local
```

### ⚠️ Diferencia entre Frontend y Backend

- **Frontend (prefijo `VITE_`)**: Se embeben en el código JavaScript final. CUALQUIERA puede verlas.
- **Backend (sin prefijo)**: Solo disponibles en las Functions. Seguras.

Por eso `OPENAI_API_KEY` **NO** lleva prefijo `VITE_`.

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Revisa los logs del navegador (DevTools → Console)
2. Revisa los logs de Netlify Functions
3. Verifica que todas las variables están configuradas correctamente
4. Asegúrate de haber hecho un nuevo deploy después de añadir las variables
