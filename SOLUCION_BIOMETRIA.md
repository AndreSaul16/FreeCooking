# Solución: Autenticación Biométrica Android - FreeCooking

## Problema Identificado

El usuario no podía iniciar sesión con huella dactilar en su Samsung debido a que faltaban los **permisos biométricos** en el archivo `AndroidManifest.xml`.

## Solución Aplicada

### Cambios en AndroidManifest.xml

Se agregaron los siguientes permisos al archivo `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Biometric Authentication Permissions -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

**Ubicación**: Después del permiso `INTERNET`, antes de cerrar `</manifest>`

## Permisos Explicados

- **`USE_BIOMETRIC`**: Permiso moderno para autenticación biométrica (API 28+)
  - Soporta: Huella dactilar, reconocimiento facial, iris
  - Recomendado para Android 9.0 (Pie) y superior

- **`USE_FINGERPRINT`**: Permiso legacy para huella dactilar (API 23-27)
  - Retrocompatibilidad con Android 6.0 (Marshmallow) hasta Android 8.1 (Oreo)

## Pasos para Aplicar la Corrección

### 1. Build y Deploy en tu Samsung

Desde Android Studio:

```bash
# Opción A: Abrir en Android Studio y rebuilar
npx cap open android
# Luego en Android Studio: Build > Rebuild Project

# Opción B: Desde terminal (requiere Gradle configurado)
cd android
./gradlew clean assembleDebug
```

### 2. Instalar en dispositivo

- **Desde Android Studio**: Click en "Run" (triángulo verde) con tu Samsung conectado
- **APK directo**: El APK estará en `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Probar la funcionalidad

1. **Primer uso - Registro de biometría**:
   - Inicia sesión con email y contraseña
   - La app debería automáticamente intentar registrar tu huella
   - Acepta el prompt biométrico

2. **Siguientes usos**:
   - En la pantalla de login, verás el botón de huella
   - Click en el botón
   - Usa tu huella para autenticarte

## Verificación

### ¿Qué botón deberías ver?

Dependiendo de la disponibilidad de WebAuthn en tu dispositivo:

- **Si ves**: "Usar Passkey (Huella / FaceID / PIN)" → Sistema WebAuthn (requiere backend)
- **Si ves**: "Iniciar con Huella / FaceID" → Sistema NativeBiometric (sin backend)

### Si sigue sin funcionar

1. **Verifica que la huella esté registrada en Android**:
   - Configuración → Seguridad → Huella dactilar
   - Debe haber al menos una huella registrada

2. **Revisa los logs de Android**:
   ```bash
   adb logcat | grep -i biometric
   ```

3. **Limpia y rebuild**:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `android/app/src/main/AndroidManifest.xml` | ✅ Agregados permisos biométricos |

## Próximos Pasos

1. ✅ Rebuild la app desde Android Studio
2. ✅ Instalar en tu Samsung
3. ✅ Probar login con huella
4. Si funciona, considera actualizar la versión de la app en build.gradle
