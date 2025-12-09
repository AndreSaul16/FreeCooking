# Sistema de Logging

Este backend implementa un sistema de logging profesional usando **Winston** para capturar y registrar todos los eventos importantes, errores y requests.

## 📝 Características

- ✅ Logging centralizado con Winston
- ✅ Rotación diaria de archivos (mantiene últimos 14 días)
- ✅ Diferentes niveles: error, warn, info, debug
- ✅ Extracción automática de archivo fuente desde stack traces
- ✅ Logging de todos los HTTP requests con timing
- ✅ Endpoint para recibir logs del frontend
- ✅ Formato colorizado en consola y estructurado en archivos

## 📂 Archivos de Log

Los logs se guardan en el directorio `logs/`:

```
logs/
├── combined-YYYY-MM-DD.log  # Todos los logs
├── error-YYYY-MM-DD.log     # Solo errores
└── *.audit.json             # Metadatos de rotación
```

**Nota**: En Render (producción), los archivos de log son efímeros pero los logs se muestran en la consola.

## 🎯 Uso

### En el Código del Backend

```javascript
import logger from './src/utils/logger.js';

// Info logging
logger.info('Server started successfully', { sourceFile: 'index.js' });

// Error logging (con stack trace automático)
logger.error('Failed to connect to database', error);

// Warning
logger.warn('API rate limit approaching', { userId: '123' });

// Debug (solo visible si LOG_LEVEL=debug)
logger.debug('Processing request', { data: {...} });
```

### Desde el Frontend

Envía logs del cliente al backend:

**Endpoint**: `POST http://localhost:3000/logs/client`

**Payload**:
```json
{
  "level": "error",
  "message": "Failed to load user profile",
  "context": {
    "page": "ProfilePage",
    "userId": "abc123",
    "errorCode": "NETWORK_ERROR"
  }
}
```

**Niveles válidos**: `error`, `warn`, `info`, `debug`

**Ejemplo en JavaScript**:
```javascript
async function sendClientLog(level, message, context = {}) {
    try {
        await fetch('http://localhost:3000/logs/client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, message, context })
        });
    } catch (err) {
        console.error('Failed to send log to backend:', err);
    }
}

// Uso
sendClientLog('error', 'Login failed', {
    page: 'LoginPage',
    reason: 'Invalid credentials'
});
```

## ⚙️ Configuración

### Variable de Entorno

```bash
# Nivel de logging (default: info)
LOG_LEVEL=debug  # debug | info | warn | error
```

### Niveles de Log

| Nivel | Descripción | Cuándo usar |
|-------|-------------|-------------|
| `error` | Errores críticos | Fallos que requieren atención inmediata |
| `warn` | Advertencias | Situaciones anómalas pero no críticas |
| `info` | Información | Eventos importantes del sistema |
| `debug` | Depuración | Información detallada para debugging |

## 🔍 Formato de Logs

### En Consola (con colores)
```
[2025-12-06 02:25:03] [INFO] [firebase.js] 🔥 Firebase Admin Configured!
[2025-12-06 02:25:03] [INFO] [index.js] 🚀 Server running on http://localhost:3000
[2025-12-06 02:25:05] [ERROR] [authController.js:45] Failed to verify token
Error: Invalid token
    at verifyToken (authController.js:45:10)
    ...
```

### En Archivos
```
[2025-12-06 02:25:03] [INFO] [firebase.js] 🔥 Firebase Admin Configured!
[2025-12-06 02:25:03] [INFO] [index.js] 🚀 Server running on http://localhost:3000
[2025-12-06 02:25:10] [INFO] [requestLogger.js] GET /auth/login-challenge - 200 - 45ms
[2025-12-06 02:25:15] [ERROR] [authController.js:45] Failed to verify token
Error: Invalid token
    at verifyToken (authController.js:45:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

## 🛠️ Middleware

### Request Logger
Registra automáticamente todas las peticiones HTTP:
- Método, ruta, código de estado
- Tiempo de respuesta en milisegundos
- IP del cliente

### Error Handler
Captura todos los errores no manejados:
- Stack trace completo
- Información de la petición
- Respuesta JSON apropiada (oculta detalles en producción)

## 📊 Logs del Cliente

Los logs enviados desde el frontend se marcan con el prefijo `[CLIENT]`:

```
[2025-12-06 02:30:15] [ERROR] [CLIENT] Failed to load user profile
```

Incluyen información adicional:
- IP del cliente
- User Agent
- Contexto personalizado (página, componente, etc.)

## 🚀 En Producción (Render)

En Render, los logs se muestran en la consola del servicio:
1. Ve a tu servicio en Render Dashboard
2. Click en "Logs" en el menú lateral
3. Verás todos los logs en tiempo real con colores

**Tip**: Usa filtros de Render para buscar errores específicos:
- Busca `[ERROR]` para ver solo errores
- Busca `[CLIENT]` para logs del frontend

## 📁 Archivos del Sistema

```
src/
├── utils/
│   └── logger.js              # Configuración Winston y métodos helper
├── middleware/
│   ├── errorMiddleware.js     # Error handler global
│   └── requestLogger.js       # Request logging middleware
├── controllers/
│   └── logsController.js      # Controlador de logs del cliente
└── routes/
    └── logsRoutes.js          # Rutas de logging
```

## 🔧 Troubleshooting

### No se crean archivos de log

Verifica que el directorio `logs/` existe y tiene permisos de escritura:
```bash
mkdir logs
```

### Logs muy verbosos

Cambia el nivel de log:
```bash
export LOG_LEVEL=warn  # Solo warn y error
```

### Ver logs en tiempo real (local)

```bash
# Combined logs
tail -f logs/combined-2025-12-06.log

# Solo errores
tail -f logs/error-2025-12-06.log
```

## 🎯 Mejoras Futuras

Para producción a largo plazo, considera integrar:
- **Sentry** para error tracking avanzado
- **Logtail** o **Papertrail** para logs centralizados persistentes
- **DataDog** o **New Relic** para APM completo
