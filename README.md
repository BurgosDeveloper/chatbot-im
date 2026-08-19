# 📱 Catálogo Móvil Claymorphism & Panel Admin

Aplicación web mobile-first optimizada para celulares con diseño visual **Claymorphism** en modo claro (Blanco, Azul Metálico y Negro), catálogo con selección múltiple para cotización directa en WhatsApp, precios multidivisa (USD, COP, VES), base de datos **PostgreSQL (NeonDB)** y almacenamiento multimedia en **Cloudinary**.

---

## ⚡ Inicio Rápido (1 Solo Comando)

Puedes iniciar todo el proyecto localmente de dos formas sencillas:

### Opción 1: Con el archivo ejecutable (Recomendado)
Simplemente haz **doble clic en `iniciar.bat`** o ejecuta en la terminal:
```bash
.\iniciar.bat
```

### Opción 2: Con NPM
```bash
npm run dev
```

El servidor quedará disponible de inmediato en:
- **Tu Computadora:** `http://localhost:3000`
- **Tu Teléfono Celular (misma red Wi-Fi):** `http://192.168.0.106:3000`
- **Panel Admin Oculto:** `http://192.168.0.106:3000/admin/login`
  - **Usuario:** `admin`
  - **Contraseña:** `admin2026!`

---

## 🌟 Características Principales

1. **Catálogo Interactivo Móvil:**
   - Filtro horizontal de categorías en píldoras arcillosas con conteo en vivo.
   - Buscador rápido por nombre, código o descripción.
   - Selector de cantidad integrado en cada tarjeta.
   - Modal de fotos en alta definición y detalle completo.
   - Precios mostrados simultáneamente en **Dólares ($)**, **Pesos ($ COP)** y **Bolívares (Bs. VES)**.

2. **Integración con WhatsApp:**
   - Barra flotante inferior con drawer interactivo.
   - Cálculo automático del total estimado del pedido en USD, COP y VES.
   - Botón táctil que abre WhatsApp con el mensaje estructurado de los productos seleccionados.

3. **Panel Administrativo Oculto (`/admin/login`):**
   - **Seguridad:** Cierre de sesión automático tras 15 minutos de inactividad.
   - **CRUD de Productos:** Crear, editar y eliminar productos con foto en Cloudinary.
   - **Limpieza de Cloudinary:** Al borrar o reemplazar la foto de un producto, la imagen anterior se elimina de Cloudinary automáticamente para evitar costos y almacenamiento residual.
   - **CRUD de Categorías:** Gestión completa de categorías.
   - **Ajustes:** Configuración del número de WhatsApp receptor y tasas de cambio en vivo (USD a COP y USD a VES).

4. **Base de Datos NeonDB (100% PostgreSQL):**
   - Esquema relacional con tablas `categories`, `products`, `admin_users` y `app_settings`.
