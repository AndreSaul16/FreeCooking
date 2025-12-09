# 🍳 FreeCooking - Restaurant Cost Management System

Sistema de gestión de costes y análisis financiero para restaurantes, con capacidades de IA y sincronización en la nube.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)

## 🚀 Características

### 📊 Gestión de Recetas
- **Inventario Maestro**: Base de datos de ingredientes con precios y mermas
- **Cálculo Automático**: COGS, Costo Primo, Precio Sugerido
- **Análisis por Ración**: Sistema batch vs. servings para cálculos precisos
- **Datos Financieros**: Precio de venta real, ventas estimadas, márgenes (Persistentes y dinámicos)

### 💰 Business Intelligence
- **Dashboard Analítico**: Métricas clave en tiempo real
- **Análisis ABC/Pareto**: Identifica dónde se va el dinero
- **Visualizaciones**: Gráficos interactivos con Recharts
- **Análisis de Rentabilidad**: Feedback visual de márgenes vs. objetivos

### 🎤 Chef Mode (IA)
- **Dictado por Voz**: Crea recetas hablando
- **Whisper AI**: Transcripción precisa en español
- **GPT-4o-mini**: Extracción estructurada de ingredientes
- **Mapeo Inteligente**: Conecta con inventario maestro automáticamente

### ⚙️ Configuración de Negocio
- **Márgenes Personalizados**: Define tu objetivo de beneficio
- **Costes Laborales**: Configura salario y seguridad social
- **Impuestos**: Gestión de IVA y precios con/sin impuestos
- **Temas Visuales**: 3 paletas de colores + modo oscuro/claro

### ☁️ Cloud & Sync
- **Firestore**: Base de datos en tiempo real
- **Multi-dispositivo**: Acceso desde cualquier lugar
- **Offline-first**: Funciona sin conexión
- **Sincronización Automática**: Cambios instantáneos

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **Vite**
- **Zustand** para state management
- **TailwindCSS** para estilos
- **Lucide React** para iconos
- **Recharts** para visualizaciones

### Backend & Cloud
- **Firebase Firestore** - Base de datos
- **Netlify Functions** - Serverless backend
- **OpenAI API** - Whisper + GPT-4o-mini

### AI Features
- **Whisper-1**: Transcripción de audio
- **GPT-4o-mini**: Structured outputs para datos estructurados

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ (recomendado: v22.17.0 o superior)
- npm 8+ (incluido con Node.js)
- Cuenta de Firebase
- Cuenta de Netlify (para deployment)
- API Key de OpenAI (opcional, para Chef Mode)

### 1. Clonar Repositorio

```bash
git clone https://github.com/AndreSaul16/FreeCooking.git
cd FreeCooking
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- **Producción (13 paquetes)**: React, React Router, Firebase, Zustand, Recharts, Framer Motion, Lucide React, Workbox, Capacitor (Core + Firebase Auth + Biometric), Axios
- **Desarrollo (18 paquetes)**: Vite, TailwindCSS, PostCSS, ESLint, TypeScript types, OpenAI, Busboy

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` y rellena con tus credenciales:

```env
# Firebase Web App Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI (opcional - para Chef Mode)
OPENAI_API_KEY=sk-proj-your-key
```

### 4. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activa Firestore Database (modo test)
3. Copia las credenciales al `.env`

### 5. Ejecutar en Local

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## 🚀 Deployment en Netlify

### 1. Conectar Repositorio

1. Ve a [Netlify](https://app.netlify.com/)
2. "Add new site" → "Import an existing project"
3. Selecciona este repositorio

### 2. Configurar Build

Netlify detectará automáticamente la configuración de `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 3. Configurar Variables de Entorno

En Netlify Dashboard → Site settings → Environment variables, añade:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `OPENAI_API_KEY` (con scope "Functions")

### 4. Deploy

Click "Deploy site" y espera ~2-5 minutos.

## 📖 Uso

### Crear Ingrediente Maestro

1. Ve a "Inventario"
2. Click "Añadir Ingrediente"
3. Rellena: nombre, unidad, precio, % merma
4. Guarda

### Crear Receta

**Método 1: Manual**
1. Ve a "Recetas" → "Nueva Receta"
2. Rellena datos básicos
3. Añade ingredientes del inventario
4. El sistema calcula costes automáticamente

**Método 2: Chef Mode (IA)**
1. "Nueva Receta" → Botón "Chef Mode ✨"
2. Mantén presionado y dicta: "Haz una tortilla con 5 huevos y 500g de patatas..."
3. Suelta y espera ~15-30 segundos
4. La receta se llena automáticamente

### Configurar Negocio

1. Ve a "Configuración"
2. Ajusta:
   - Margen de beneficio objetivo
   - Costes laborales
   - IVA / Impuestos
   - Tema visual

## 📐 Arquitectura

Ver [architecture.md](./architecture.md) para detalles completos de la arquitectura del sistema.

### Estructura del Proyecto

```
FreeCooking/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.jsx
│   │   ├── RecipeForm.jsx
│   │   ├── VoiceRecipeBtn.jsx
│   │   └── ...
│   ├── services/            # Servicios y lógica de negocio
│   │   ├── firebase.js
│   │   ├── firestoreService.js
│   │   ├── calculations.js
│   │   └── themeService.js
│   ├── store/               # State management (Zustand)
│   │   └── recipeStore.js
│   ├── context/             # React Context
│   │   └── SettingsContext.jsx
│   └── utils/               # Utilidades
│       └── migrateToFirestore.js
├── netlify/
│   └── functions/           # Netlify Functions
│       └── voice-to-recipe.js
├── public/                  # Assets estáticos
└── ...
```

## 🔐 Seguridad

- ✅ Variables de entorno para secrets
- ✅ Firestore rules (configurar según necesidades)
- ✅ HTTPS obligatorio en producción
- ⚠️ **Importante**: Configurar reglas de Firestore para producción

### Reglas de Firestore Recomendadas (Futuro)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Costes Estimados

### Firebase (Plan Gratuito)
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día
- ✅ 1 GB almacenamiento

### Netlify (Plan Gratuito)
- ✅ 100 GB bandwidth/mes
- ✅ 300 min build/mes
- ✅ 125K function invocations/mes

### OpenAI API (Pay-as-you-go)
- Whisper: ~$0.006/min de audio
- GPT-4o-mini: ~$0.0001/request
- **Estimado**: <$5/mes para uso pequeño/mediano

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Autenticación de usuarios (Firebase Auth)
- [ ] Multi-tenancy (múltiples restaurantes)
- [ ] Ingeniería de menús (matriz Stars/Plows/Puzzles/Dogs)
- [ ] Exportación a PDF/Excel
- [ ] Análisis de tendencias temporales
- [ ] Integración con proveedores (APIs)
- [ ] App móvil nativa (React Native)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 👨‍💻 Autor

**André Saul**
- GitHub: [@AndreSaul16](https://github.com/AndreSaul16)

## 🙏 Agradecimientos

- OpenAI por Whisper y GPT-4
- Firebase por la infraestructura cloud
- Netlify por el hosting y functions
- Comunidad open source

---

**¿Tienes preguntas?** Abre un issue en GitHub.

**¿Te gusta el proyecto?** Dale una ⭐ en GitHub!
