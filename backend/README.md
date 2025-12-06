# 🔐 FreeCooking Backend API

Backend API para FreeCooking - Servicio Node.js/Express que maneja autenticación avanzada (WebAuthn/Passkeys) y gestión de credenciales.

## 📋 Descripción

Este backend proporciona endpoints API para:
- 🔑 **Autenticación WebAuthn** (Passkeys/biometría)
- 🔐 **Gestión de credenciales** via Firebase Admin SDK
- ✅ **Verificación de tokens** Firebase

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Autenticación:** @simplewebauthn/server
- **Base de datos:** Firebase Firestore (via firebase-admin)
- **Deployment:** Render.com

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración Firebase Admin SDK
│   ├── controllers/
│   │   └── authController.js    # Controladores de autenticación
│   ├── middleware/
│   │   └── authMiddleware.js    # Middleware de verificación
│   ├── routes/
│   │   └── authRoutes.js        # Rutas de API
│   └── services/
│       └── webAuthnService.js   # Lógica de WebAuthn
├── index.js                      # Punto de entrada del servidor
├── package.json                  # Dependencias
└── render.yaml                   # Configuración de Render
```

## 🚀 API Endpoints

### Autenticación WebAuthn

- **POST** `/auth/register/options` - Genera opciones para registro de passkey
- **POST** `/auth/register/verify` - Verifica y guarda nueva credencial
- **POST** `/auth/login/options` - Genera opciones para login con passkey
- **POST** `/auth/login/verify` - Verifica credencial y autentica usuario

## ⚙️ Variables de Entorno

Las siguientes variables deben configurarse en Render:

```env
# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID=your-project-id

# WebAuthn
RP_NAME=FreeCooking
RP_ID=your-domain.com                    # Dominio sin protocolo
ORIGIN=https://your-frontend-url.com      # URL completa del frontend

# Server
PORT=3000                                 # Puerto (Render lo asigna automáticamente)
NODE_ENV=production
```

## 🔧 Instalación Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env basado en las variables anteriores

# Iniciar servidor
npm start

# El servidor estará disponible en http://localhost:3000
```

## 📦 Deployment en Render

El archivo `render.yaml` ya está configurado. Pasos:

1. Conectar repositorio en Render Dashboard
2. Seleccionar rama `backend`
3. Configurar variables de entorno en Render
4. Deploy automático al hacer push

**Build Command:** `npm install`  
**Start Command:** `npm start`

## 🔒 Seguridad

- ✅ Credenciales de Firebase via variables de entorno (nunca en código)
- ✅ CORS configurado para permitir solo frontend autorizado
- ✅ Verificación de tokens Firebase en endpoints protegidos
- ✅ Challenge criptográfico único por cada operación WebAuthn

## 🧪 Health Check

```bash
curl https://your-backend-url.com/
# Respuesta: "FreeCooking Backend is Living! 👨‍🍳"
```

## 📝 Notas

- Este backend complementa el frontend de FreeCooking desplegado en Netlify
- WebAuthn requiere HTTPS en producción
- Las credenciales se almacenan en Firestore bajo la colección `users/{uid}/credentials`

---

**Desarrollador:** [@AndreSaul16](https://github.com/AndreSaul16)  
**Licencia:** MIT
