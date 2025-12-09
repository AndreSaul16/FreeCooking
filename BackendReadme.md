# 🔐 FreeCooking Backend API

Backend API para FreeCooking - Servicio Node.js/Express con autenticación avanzada (WebAuthn/Passkeys), gestión de credenciales y sistema de logging profesional.

## 📋 Descripción

Este backend proporciona endpoints API para:
- 🔑 **Autenticación WebAuthn** (Passkeys/biometría)
- 🔐 **Gestión de credenciales** vía Firebase Admin SDK
- ✅ **Verificación de tokens** Firebase
- 📝 **Sistema de logging profesional** con Winston
- 📊 **Status dashboard** en tiempo real
- 🌐 **Endpoint para logs del frontend**

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Autenticación:** @simplewebauthn/server
- **Base de datos:** Firebase Firestore (vía firebase-admin)
- **Logging:** Winston + winston-daily-rotate-file
- **Deployment:** Render.com

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js              # Configuración Firebase Admin SDK
│   ├── controllers/
│   │   ├── authController.js        # Controladores de autenticación  
│   │   ├── logsController.js        # Controlador de logs del cliente
│   │   └── statusController.js      # Dashboard de estado
│   ├── middleware/
│   │   ├── authMiddleware.js        # Verificación de tokens
│   │   ├── errorMiddleware.js       # Error handling global
│   │   └── requestLogger.js         # Logging de requests HTTP
│   ├── routes/
│   │   ├── authRoutes.js            # Rutas de autenticación
│   │   └── logsRoutes.js            # Rutas de logging
│   ├── services/
│   │   └── webAuthnService.js       # Lógica de WebAuthn
│   └── utils/
│       └── logger.js                # Logger centralizado (Winston)
├── logs/                             # Archivos de log (ignorado por git)
├── index.js                          # Punto de entrada del servidor
├── package.json                      # Dependencias
├── render.yaml                       # Configuración de Render
├── LOGGING.md                        # Documentación del sistema de logs
└── README.md                         # Este archivo
```

## 🚀 API Endpoints

### Status y Health

- **GET** `/` - Dashboard completo de estado (servidor, Firebase, configuración, endpoints)
- **GET** `/health` - Health check ligero para monitoring

### Autenticación WebAuthn

- **POST** `/auth/register-challenge` - Genera opciones para registro de passkey
- **POST** `/auth/register-verify` - Verifica y guarda nueva credencial
- **POST** `/auth/login-challenge` - Genera opciones para login con passkey
- **POST** `/auth/login-verify` - Verifica credencial y autentica usuario

### Logging

- **POST** `/logs/client` - Recibe logs desde el frontend

## ⚙️ Variables de Entorno

Las siguientes variables deben configurarse en Render:

```env
# Firebase Admin SDK (JSON completo en una línea)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# WebAuthn
RP_ID=freecooking.onrender.com         # Dominio sin protocolo (localhost en desarrollo)

# Server (opcional)
PORT=3000                               # Puerto (Render lo asigna automáticamente)
LOG_LEVEL=info                          # Nivel de logs: debug | info | warn | error
NODE_ENV=production                     # Entorno: production | development
```

### Variables de Entorno Locales

Para desarrollo local, crea un archivo `.env` (ver `.env.example`):

```env
PORT=3000
RP_ID=localhost
LOG_LEVEL=debug
# FIREBASE_SERVICE_ACCOUNT se omite en local (usa FIREBASE-PRIVATE-KEY.json)
```

## 🔧 Instalación Local

```bash
# Instalar dependencias
npm install

# Configurar credenciales de Firebase
# Opción 1: Archivo local (recomendado para desarrollo)
# - Coloca tu archivo JSON de Firebase Admin SDK como FIREBASE-PRIVATE-KEY.json

# Opción 2: Variable de entorno
# - Configura FIREBASE_SERVICE_ACCOUNT en .env

# Iniciar servidor
npm start

# El servidor estará disponible en http://localhost:3000
```

### Verificar Instalación

```bash
# Ver status dashboard
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health
```

## 📦 Deployment en Render

### Configuración Inicial

1. **Conectar repositorio** en Render Dashboard
2. **Seleccionar rama** `backend`
3. **Configurar variables de entorno**:
   - `RP_ID` = `freecooking.onrender.com`
   - `FIREBASE_SERVICE_ACCOUNT` = (JSON completo)
4. **Deploy automático** al hacer push

### Build y Start Commands

El archivo `render.yaml` ya incluye la configuración, pero manualmente:

**Build Command:** `npm install`  
**Start Command:** `npm start`

### Verificar Deploy

Visita: `https://freecooking.onrender.com/`

Deberías ver el status dashboard con:
- ✅ Estado del servidor
- 🔥 Conexión con Firebase
- 📋 Lista de endpoints
- 🚀 Información de deployment

## 📝 Sistema de Logging

### Características

- ✅ Logging centralizado con Winston
- ✅ Rotación diaria de archivos (mantiene 14 días)
- ✅ Niveles: error, warn, info, debug
- ✅ Extracción automática de archivo fuente
- ✅ Logging de todos los requests HTTP
- ✅ Endpoint para recibir logs del frontend

### Archivos de Log (Local)

```
logs/
├── combined-YYYY-MM-DD.log   # Todos los logs
├── error-YYYY-MM-DD.log      # Solo errores
└── *.audit.json              # Metadatos de rotación
```

### Enviar Logs desde el Frontend

```javascript
fetch('https://freecooking.onrender.com/logs/client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        level: 'error',
        message: 'Login failed',
        context: {
            page: 'LoginPage',
            userId: 'abc123'
        }
    })
});
```

Ver [LOGGING.md](./LOGGING.md) para documentación completa.

## 📊 Status Dashboard

El endpoint raíz (`/`) proporciona información detallada:

```json
{
  "server": {
    "name": "FreeCooking Backend",
    "status": "✅ Running",
    "uptime": "2d 5h 30m",
    "environment": "production"
  },
  "services": {
    "firebase": {
      "status": "connected",
      "message": "✅ Firestore and Auth operational"
    }
  },
  "configuration": {
    "rpId": "freecooking.onrender.com",
    "logLevel": "info"
  },
  "endpoints": { ... },
  "health": {
    "overall": "healthy"
  }
}
```

## 🔒 Seguridad

- ✅ Credenciales de Firebase vía variables de entorno (nunca en código)
- ✅ CORS configurado
- ✅ Verificación de tokens Firebase en endpoints protegidos
- ✅ Challenge criptográfico único por cada operación WebAuthn
- ✅ Validación y sanitización de logs del cliente
- ✅ Stack traces solo en desarrollo (ocultos en producción)
- ✅ Error handling global con logging detallado

## 🧪 Testing

### Health Check

```bash
curl https://freecooking.onrender.com/health
# Respuesta: {"status":"ok","timestamp":"..."}
```

### Status Dashboard

```bash
curl https://freecooking.onrender.com/
# Respuesta: JSON completo con estado del servidor
```

### Test de Logging

```bash
curl -X POST https://freecooking.onrender.com/logs/client \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test from frontend","context":{"page":"test"}}'
# Respuesta: {"success":true}
```

## 📚 Documentación Adicional

- [LOGGING.md](./LOGGING.md) - Sistema de logging completo
- `.env.example` - Plantilla de variables de entorno

## 🚨 Troubleshooting

### Servidor no inicia

1. Verifica que `FIREBASE_SERVICE_ACCOUNT` está configurado correctamente
2. Revisa los logs en Render Dashboard
3. Confirma que el JSON de Firebase es válido

### Firebase no conecta

1. Verifica que el JSON contiene todos los campos obligatorios
2. Confirma que el proyecto de Firebase es correcto
3. Revisa el status dashboard: `GET /`

### Logs no aparecen

1. En Render: Revisa la consola (logs de archivos son efímeros)
2. En local: Verifica que existe la carpeta `logs/`
3. Ajusta `LOG_LEVEL` si es necesario

## 📝 Notas

- Este backend complementa el frontend de FreeCooking desplegado en Netlify
- WebAuthn requiere HTTPS en producción
- Las credenciales se almacenan en Firestore bajo `users/{uid}/credentials`
- Los archivos de log en Render son efímeros (usa logs de consola)
- El status dashboard verifica la conexión con Firebase en tiempo real

---

**Desarrollador:** [@AndreSaul16](https://github.com/AndreSaul16)  
**Repository:** [FreeCooking](https://github.com/AndreSaul16/FreeCooking/tree/backend)  
**Licencia:** MIT
