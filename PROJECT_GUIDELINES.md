# 📱 Directrices Maestras del Proyecto - Catálogo Móvil Claymorphism

Este documento define la arquitectura, diseño visual, contratos de datos, analíticas, seguridad y reglas de desarrollo para mantener el enfoque y la consistencia en el proyecto.

---

## 🎯 1. Propósito y Alcance
- **Objetivo:** Aplicación web mobile-first de catálogo de productos con diseño **Claymorphism** en modo claro (Blanco, Azul Metálico y Negro carbón), visualización de precios multidivisa (Dólares USD, Pesos Colombianos COP y Bolívares VES), métricas de visitantes en tiempo real en el panel admin, selección múltiple para cotización directa en WhatsApp, y panel de administración oculto con CRUD integral y gestión en la nube (NeonDB PostgreSQL y Cloudinary).
- **Entorno de Despliegue:** Netlify (vía GitHub: `https://github.com/BurgosDeveloper/chatbot-im.git`).
- **Filosofía de Datos:** **100% SQL en PostgreSQL (NeonDB)**. No se utilizan archivos JSON locales de prueba ni mocks temporales.

---

## 🎨 2. Sistema de Diseño: Claymorphism Móvil

### Paleta de Colores (Modo Claro Exclusivo)
- **Fondo Primario:** `#F0F4F8` / `#FFFFFF` (Blanco puro y blanco humo arcilloso).
- **Acento Metálico:** `#1E40AF` (Azul Rey Profundo), `#2563EB` (Azul Eléctrico), `#38BDF8` (Brillo Metálico / Cyan Sheen).
- **Superficie de Tarjetas (Clay):** `#FFFFFF` con degradados sutiles hacia `#F1F5F9`.
- **Textos y Contraste:** `#0F172A` (Slate 900) para títulos y `#334155` (Slate 700) para descripciones y metadatos.
- **Estados de Stock:** Verde esmeralda `#10B981` (Disponible) y Rojo carmesí `#EF4444` (Agotado).

---

## 🗄️ 3. Base de Datos: Esquema Estricto PostgreSQL (NeonDB)

### Cadena de Conexión
`postgresql://neondb_owner:npg_fsJdkqw56uTg@ep-wispy-tooth-aw0dcu0b-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Tablas
```sql
-- 1. Categorías
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Productos (con soporte multidivisa)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    image_public_id VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Usuarios Administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ajustes Generales y Tasas de Cambio
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 5. Métricas y Analíticas de Visitas
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL DEFAULT '/',
    user_agent TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
```

---

## 📊 4. Sistema de Métricas y Analíticas
- **Seguimiento Automático:** Cada usuario que accede o navega por el catálogo activa un registro anónimo en `page_views`.
- **Métricas en Dashboard Admin:**
  - Visitantes únicos totales e históricos.
  - Vistas / Scrolls totales acumulados.
  - Visitantes y vistas del día de hoy.
  - Gráfico interactivo con desglose de actividad de los últimos 7 días.
  - Registro cronológico de últimos accesos con tipo de dispositivo (Android, iPhone, Windows, Mac).

---

## ☁️ 5. Reglas de Integración con Cloudinary

- **Cloud Name:** `dhqskqkeb`
- **API Key:** `372917197797679`
- **API Secret:** `HckeHLZNi7IZnca8kaxGTVmUQbs`
- **Regla de Oro de Limpieza:**
  1. Al **crear** un producto: Subir a Cloudinary (`chatbot_im_products`) y persistir `image_url` y `image_public_id` en PostgreSQL.
  2. Al **eliminar** un producto: Obtener `image_public_id` y ejecutar `cloudinary.v2.uploader.destroy(public_id)` antes de borrar el registro en PostgreSQL.
  3. Al **actualizar** la imagen de un producto: Eliminar la imagen anterior en Cloudinary vía `destroy(old_public_id)` y subir la nueva imagen.

---

## 🔐 6. Seguridad y Autenticación del Administrador

- **Ruta Secreta:** `/admin/login` (sin enlaces públicos).
- **Panel:** `/admin/dashboard`.
- **Sesión:**
  - Token JWT en Cookie `admin_token` con atributos `HttpOnly`, `SameSite=Lax`, `Secure`.
  - Temporizador de inactividad de 15 minutos en el cliente con auto-logout preventivo.

---

## 🚀 7. Guía Paso a Paso para Despliegue en Producción (Netlify)

1. Ingresa a **[Netlify](https://app.netlify.com/)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en el botón azul **"Add new site"** y selecciona **"Import an existing project"**.
3. Selecciona **GitHub** como proveedor Git y autoriza el acceso a tu repositorio **`BurgosDeveloper/chatbot-im`**.
4. En la pantalla de configuración de despliegue:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Haz clic en **"Environment variables" (Variables de entorno)** y añade exactamente estas variables:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_fsJdkqw56uTg@ep-wispy-tooth-aw0dcu0b-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - `CLOUDINARY_CLOUD_NAME` = `dhqskqkeb`
   - `CLOUDINARY_API_KEY` = `372917197797679`
   - `CLOUDINARY_API_SECRET` = `HckeHLZNi7IZnca8kaxGTVmUQbs`
   - `JWT_SECRET` = `chatbot_im_jwt_secret_key_super_secure_2026_x89a`
   - `ADMIN_INITIAL_USER` = `admin`
   - `ADMIN_INITIAL_PASS` = `admin2026!`
   - `DEFAULT_WHATSAPP_NUMBER` = `584120000000`
6. Haz clic en **"Deploy chatbot-im"**.
7. ¡Listo! Netlify compilará el proyecto y en 1 minuto te entregará tu URL de producción con HTTPS activo.
