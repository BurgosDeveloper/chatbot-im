# 📱 Directrices Maestras del Proyecto - Catálogo Móvil Claymorphism

Este documento define la arquitectura, diseño visual, contratos de datos, seguridad y reglas de desarrollo para mantener el enfoque y la consistencia en el proyecto.

---

## 🎯 1. Propósito y Alcance
- **Objetivo:** Aplicación web mobile-first de catálogo de productos con diseño **Claymorphism** en modo claro (Blanco, Azul Metálico y Negro carbón), selección múltiple para cotización directa en WhatsApp, y panel de administración oculto con CRUD integral y gestión en la nube (NeonDB PostgreSQL y Cloudinary).
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

### Fórmulas de Sombras y Relieve Claymorphism
- **Clay Card:**
  ```css
  box-shadow: 
    8px 8px 18px rgba(163, 177, 198, 0.35),
    -8px -8px 18px rgba(255, 255, 255, 0.95),
    inset 2px 2px 4px rgba(255, 255, 255, 0.7);
  border-radius: 1.5rem; /* 24px */
  border: 1px solid rgba(255, 255, 255, 0.8);
  ```
- **Clay Metallic Button:**
  ```css
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
  box-shadow: 
    6px 6px 14px rgba(37, 99, 235, 0.35),
    -4px -4px 10px rgba(255, 255, 255, 0.8),
    inset 1px 1px 2px rgba(255, 255, 255, 0.4);
  ```
- **Clay Inset (Inputs y Filtros activos):**
  ```css
  box-shadow: 
    inset 4px 4px 8px rgba(163, 177, 198, 0.35),
    inset -4px -4px 8px rgba(255, 255, 255, 0.9);
  ```

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

-- 2. Productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    image_public_id VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
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

-- 4. Ajustes Generales
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);
```

---

## ☁️ 4. Reglas de Integración con Cloudinary

- **Cloud Name:** `dhqskqkeb`
- **API Key:** `37291779797679`
- **API Secret:** `HckeHLZNi7IZnca8kaxGTVmUQbs`
- **Regla de Oro de Limpieza:**
  1. Al **crear** un producto: Subir a Cloudinary (carpeta `chatbot_im_products`) y persistir `image_url` y `image_public_id` en PostgreSQL.
  2. Al **eliminar** un producto: Obtener `image_public_id` y ejecutar `cloudinary.v2.uploader.destroy(public_id)` antes de borrar el registro en PostgreSQL.
  3. Al **actualizar** la imagen de un producto: Eliminar la imagen anterior en Cloudinary vía `destroy(old_public_id)` y subir la nueva imagen.

---

## 🔐 5. Seguridad y Autenticación del Administrador

- **Ruta Secreta:** `/admin/login` (no accesible desde enlaces de la interfaz pública).
- **Panel:** `/admin/dashboard`.
- **Sesión:**
  - Token JWT firmado en el servidor con expiración de 2 horas.
  - Almacenamiento en Cookie `admin_token` con atributos `HttpOnly`, `SameSite=Lax`, `Secure`.
  - Temporizador de inactividad de 15 minutos en el cliente: si el usuario no interactúa (movimiento, clicks, teclas), se realiza auto-logout preventivo.

---

## 📲 6. Integración y Formato del Mensaje de WhatsApp

Al hacer click en **"Preguntar en WhatsApp"**:
1. Recolecta todos los productos seleccionados con cantidades > 0.
2. Construye un mensaje limpio y amigable:
   ```text
   👋 ¡Hola! Vengo de su catálogo web y deseo consultar la disponibilidad de los siguientes productos:

   📦 *PEDIDO DE CONSULTA:*
   1️⃣ [Cód: PROD-01] Nombre Producto 1 — Cantidad: 2
   2️⃣ [Cód: PROD-02] Nombre Producto 2 — Cantidad: 1

   ¿Tienen stock disponible y cuáles son los métodos de pago y entrega? ¡Muchas gracias!
   ```
3. Codifica la URL y redirige a: `https://wa.me/{WHATSAPP_NUMBER}?text={ENCODED_MESSAGE}`.

---

## 🚀 7. Guía de Ejecución y Despliegue

### Entorno Local y Red LAN (Móvil)
- Para probar desde un celular en la misma red WiFi:
  ```bash
  npm run dev -- -H 0.0.0.0 -p 3000
  ```
- Ingresar desde el navegador del celular a: `http://<TU_IP_LOCAL>:3000`.

### Despliegue en Netlify
1. Conectar el repositorio `https://github.com/BurgosDeveloper/chatbot-im.git` en Netlify.
2. Configurar variables de entorno en Netlify:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_fsJdkqw56uTg@ep-wispy-tooth-aw0dcu0b-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - `CLOUDINARY_CLOUD_NAME`: `dhqskqkeb`
   - `CLOUDINARY_API_KEY`: `37291779797679`
   - `CLOUDINARY_API_SECRET`: `HckeHLZNi7IZnca8kaxGTVmUQbs`
   - `JWT_SECRET`: Llave secreta para JWT.
3. Build command: `npm run build`
4. Publish directory: `.next`
