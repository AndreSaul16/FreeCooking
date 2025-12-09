# Notas sobre Gestión de Dependencias

## Cambio de Deno a npm

**Fecha**: 6 de diciembre de 2025

### Contexto

El proyecto FreeCooking originalmente tenía un archivo `deno.lock` que listaba dependencias npm, pero no tenía un `package.json`. Esto impedía la instalación de dependencias usando npm.

### Cambios Realizados

1. **Creación de `package.json`**
   - Se extrajeron todas las dependencias del `deno.lock`
   - Se creó un `package.json` estándar para proyectos Vite + React
   - Se configuraron los scripts de npm: `dev`, `build`, `preview`, `lint`

2. **Instalación de Dependencias**
   - Ejecutado `npm install` exitosamente (múltiples iteraciones)
   - Se descubrieron e instalaron dependencias faltantes durante el build:
     - Capacitor Core + módulos (autenticación, biométricos)
     - Axios para comunicación HTTP con backend
   - Creados `node_modules/` y `package-lock.json`
   - Total de 31 dependencias instaladas (13 producción + 18 desarrollo)
   - 12 vulnerabilidades moderadas detectadas (no críticas)

3. **Actualización de Documentación**
   - `README.md`: Actualizada sección de requisitos previos e instalación
   - `architecture.md`: Agregada sección sobre gestión de dependencias

### Dependencias Instaladas

#### Producción (13)
- react, react-dom, react-router-dom
- firebase
- zustand
- recharts
- framer-motion
- lucide-react
- workbox-window
- **@capacitor/core** - Plataforma para apps híbridas (Web + Android)
- **@capacitor-firebase/authentication** - Firebase Auth para Capacitor
- **capacitor-native-biometric** - Biometría nativa (huellas, Face ID)
- **axios** - Cliente HTTP para backend API

#### Desarrollo (18)
- vite, @vitejs/plugin-react
- tailwindcss, postcss, autoprefixer
- eslint + 3 plugins
- @types/react, @types/react-dom
- openai, busboy, dotenv
- vite-plugin-pwa

### Estado del Archivo deno.lock

El archivo `deno.lock` se ha mantenido por si el usuario desea conservarlo como referencia histórica. Puede eliminarse si ya no es necesario.

### Próximos Pasos

1. Configurar variables de entorno (`.env`) siguiendo `CONFIGURACION.md`
2. Ejecutar `npm run dev` para arrancar el servidor de desarrollo
3. Verificar que la aplicación cargue correctamente
