# Configuración de Supabase para la Aplicación VNTS

Este documento describe cómo configurar Supabase para la aplicación de Control de Ingresos.

## Paso 1: Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com/) y crea una cuenta o inicia sesión
2. Haz clic en "New Project"
3. Asigna el nombre "vnts-control-ingresos" (o el que prefieras)
4. Establece una contraseña segura para la base de datos
5. Selecciona la región más cercana a tus usuarios
6. Haz clic en "Create new project"

## Paso 2: Configurar la autenticación

1. Ve a Authentication > Providers
2. Habilita el proveedor "Email"
3. Para desarrollo, puedes desactivar "Confirm email" para evitar el proceso de confirmación por email
4. Guarda los cambios

## Paso 3: Crear la estructura de la base de datos

1. Ve a SQL Editor
2. Copia el contenido del archivo `database_schema.sql` de este proyecto
3. Pega el código en el editor SQL y haz clic en "Run"
4. Esto creará todas las tablas necesarias, funciones y políticas de seguridad

## Paso 4: Crear un usuario administrador

1. Ve a Authentication > Users
2. Haz clic en "Add User"
3. Ingresa email y contraseña para el administrador
4. Después de crear el usuario, copia su UUID (aparece en la lista de usuarios)
5. Ve a SQL Editor nuevamente
6. Abre el archivo `admin_setup.sql` de este proyecto
7. Reemplaza 'ID_DEL_USUARIO_DE_AUTH' con el UUID copiado
8. Ejecuta el script para:
   - Registrar al usuario en la tabla users (administradores)
   - Crear un vendedor de ejemplo con código 1234 y 5% de comisión
   - Crear algunos productos de ejemplo

## Paso 5: Obtener las credenciales de API

1. Ve a Project Settings > API
2. Copia la URL y la anon key (clave pública)
3. Abre el archivo `lib/supabase.ts` en el proyecto
4. Reemplaza los valores de SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales reales

## Paso 6: Probar la conexión

1. Ejecuta la aplicación con `npx expo start`
2. Intenta iniciar sesión con las credenciales del administrador que creaste
3. También puedes probar el acceso de vendedor usando el código "1234" (tendrá asignada una comisión del 5%)

## Consideraciones adicionales para producción

Para un entorno de producción, considera las siguientes mejoras:

1. **Seguridad mejorada para vendedores:**
   - Implementa JWT claims personalizados para los vendedores
   - Refina las políticas de Row Level Security para mayor precisión

2. **Respaldos de la base de datos:**
   - Configura respaldos periódicos desde el panel de Supabase

3. **Monitoreo:**
   - Configura alertas para monitorear el uso y posibles problemas
   - Revisa periódicamente los logs de API y autenticación

4. **Almacenamiento:**
   - Si planeas implementar imágenes de productos, configura el Storage de Supabase
   - Establece políticas de acceso adecuadas para los archivos

5. **Edge Functions:**
   - Considera usar Edge Functions de Supabase para lógica de servidor más compleja
   - Útil para integraciones con sistemas de pago, impresión de facturas, etc.