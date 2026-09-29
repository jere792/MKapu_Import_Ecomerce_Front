# Auditoría de seguridad — MKapu Import (frontend + Supabase)

**Fecha:** 29-09-2026
**Alcance:** `mkapu-import` (Next.js 16 + Cloudflare Workers) y proyecto Supabase `kodmbciwlfscwtdaejen`.
**Metodología:** pruebas de caja negra con la anon key pública y con sesión real, más revisión de código e historia de git (`git show HEAD`). Sin escrituras destructivas: toda prueba de escritura fue o bien bloqueada por diseño, o bien un write de valor idéntico al actual, o bien un archivo de prueba creado y borrado con la misma sesión.

---

## 1. Resumen

| # | Vulnerabilidad | Criticidad | Estado |
|---|----------------|-----------|--------|
| 1 | RLS desactivado en todo el esquema `public` (lectura/escritura anónima total) | **Crítica** | ✅ Corregida |
| 2 | PII de `reclamaciones` legible por cualquier anónimo | **Crítica** | ✅ Corregida |
| 3 | Hashes bcrypt de `empleados` descargados por el login en el navegador | **Crítica** | ✅ Corregida |
| 4 | "Login" del panel sin autenticación real (guard solo en `localStorage`) | **Alta** | ✅ Corregida |
| 5 | `POST /api/empresa` sin autenticación (escritura de datos de la empresa) | **Alta** | ✅ Corregida |
| 6 | `POST /api/upload` sin autenticación (subida a Cloudinary) | **Alta** | ✅ Corregida |
| 7 | Bucket `imagenes` con política de subida pública `{public}` | **Alta** | ✅ Corregida |
| 8 | `GET /api/descargar-pdf` exponía PII por ticket sin sesión | **Media** | ✅ Corregida |
| 9 | Sin security headers (CSP, HSTS, XFO, XCTO, Referrer-Policy) + `x-powered-by` | **Media** | ⏳ Pendiente |
| 10 | Sin rate limiting en envío de correos (`notificar-contacto`/`notificar-ticket`) + HTML inyectado en el correo | **Media** | ⏳ Pendiente |
| 11 | Columna `password` de `empleados` legible con sesión admin | **Baja** | ⏳ Pendiente |
| 12 | CORS de Supabase refleja cualquier origen (por diseño de la anon key) | **Baja** | ℹ️ Informativo |
| 13 | Datos de contacto (WhatsApp/email) hardcodeados en el código | **Baja** (integridad) | ✅ Corregida (ahora BD) |

---

## 2. Vulnerabilidades antes de los fixes y soluciones aplicadas

### 1. RLS apagado en todo el esquema — Crítica
- **Antes:** ninguna tabla de `public` tenía row-level security. La anon key (pública, incrustada en el bundle) permitía `SELECT/INSERT/UPDATE/DELETE` libres. Fue el origen del incidente: un externo insertó datos en la base.
- **Evidencia:** en su momento `pg_class.relrowsecurity = false` en todas las tablas de `public`.
- **Solución:** RLS habilitado en las 21 tablas con políticas `admin_all` (rol admin) y `anon_read` (solo lectura de contenido público), más `anon_insert_reclamaciones` para el Libro de Reclamaciones.
- **Verificación hoy:** `select ... where not relrowsecurity` → **0 filas** (todas con RLS).

### 2. PII de reclamaciones expuesto — Crítica
- **Antes:** `GET /rest/v1/reclamaciones` con la anon key devolvía nombres, apellidos, DNI, teléfono, email, dirección, monto y descripción de reclamos de clientes reales.
- **Solución:** RLS con `admin_all` y sin política de lectura para anon.
- **Verificación hoy:** anon `GET /reclamaciones?select=id,ticket` → `[]`; con sesión admin → `200`.

### 3. Hashes de contraseñas descargados al navegador — Crítica
- **Antes:** `login/page.tsx` hacía `select("id, nombre, activo, password")` con la anon key y ejecutaba `bcrypt.compare` **en el cliente**: cualquier visitante podía descargar todos los hashes bcrypt de los empleados y hacer fuerza bruta offline. Además la sesión se quedaba en `localStorage.admin_id`.
- **Solución:** login migrado a **Supabase Auth** (`signInWithPassword`); los hashes viven solo en `auth.users` y nunca salen del servidor de Auth.
- **Verificación hoy:** anon `GET /empleados` → `[]`; login `marlon@gmail.com` → JWT con `app_metadata: {"role":"admin","empleado_id":8}`.

### 4. Autenticación del panel solo en el navegador — Alta
- **Antes:** `admin/layout.tsx` validaba con `localStorage.admin_id` y una lectura de `empleados` hecha desde el cliente; no había `middleware.ts`. Con `localStorage.setItem("admin_id","8")` desde DevTools se entraba al panel, y las rutas API no validaban nada.
- **Solución:**
  - `src/middleware.ts` (nuevo): redirige `/admin/**` a `/login` si no hay sesión o el rol no es `admin`; devuelve **401** a `POST /api/empresa`, `POST /api/upload` y `GET /api/descargar-pdf`.
  - `src/app/admin/layout.tsx`: valida `getSession()` + `app_metadata.role === "admin"`.
  - `src/lib/auth.ts`: `getServerSession()` / `requireAdmin()` (cliente con cookies `@supabase/ssr`); eliminada la query a la tabla `profiles`, que no existe.
  - `src/lib/supabase.ts`: en el navegador usa `createBrowserClient` (sesión en cookies) para que el servidor pueda verificarla.
- **Verificación hoy:** `/admin/productos` sin sesión → **307 → /login**; con cookie admin → **200**; `POST /api/upload` sin sesión → **401**, con sesión admin → auth aceptado (llega a Cloudinary).

### 5. `POST /api/empresa` abierto — Alta
- **Antes:** cualquiera podía hacer `POST /api/empresa` con la anon key y sobrescribir WhatsApp, email, número de reclamos, RUC, dirección, logo, redes sociales (suplantación de identidad / phishing en la tienda).
- **Solución:** middleware (401) + `requireAdmin()` en la ruta + el upsert se hace con **el cliente autenticado del admin** (no con anon, que lo habría rechazado el RLS).
- **Verificación hoy:** sin sesión → `401`; con sesión admin y body `{"nombre":"MKAPU IMPORT"}` → `200` y los datos quedaron intactos.

### 6. `POST /api/upload` abierto — Alta
- **Antes:** cualquiera podía subir archivos a la cuenta Cloudinary de la tienda (costo, malware, suplantación de assets).
- **Solución:** middleware (401) + `requireAdmin()` en la ruta.
- **Verificación hoy:** sin sesión → `401`; con sesión admin → se autentica (500 sólo porque el body estaba vacío, sin archivo).

### 7. Bucket `imagenes` con subida pública — Alta
- **Antes:** política `allow upload to imagenes` con `roles = {public}` → cualquier persona con la anon key subía objetos al bucket de la tienda.
- **Solución:** eliminadas `allow upload to imagenes`, `Auth upload imagenes`, `Auth update imagenes`, `Auth delete imagenes`, `Allow upload videos`. Quedan: lecturas públicas (`Public read imagenes`, `allow read from imagenes`, `Allow read videos`) y las de admin (`admin_storage_insert/update/delete`, con `with_check/is_admin()`).
- **Verificación hoy:** subida anónima → `403 new row violates row-level security policy`; borrado anónimo → bloqueado; subida con sesión admin → `200`; borrado con sesión admin → `200` (archivo de prueba eliminado, bucket limpio).

### 8. `GET /api/descargar-pdf` sin sesión — Media
- **Antes:** con la ticket se descargaba el PDF con toda la PII de la reclamación sin autenticación.
- **Solución:** `requireAdmin()` en la ruta + middleware 401.
- **Verificación hoy:** sin sesión → `401`.

### 13. Datos de contacto hardcodeados — Baja (integridad)
- **Antes:** WhatsApp/email/número de reclamos estaban fijos en el código (ej. `51933864551`), lo que obligaba a un deploy por cada cambio y permitía divergencia entre páginas.
- **Solución:** única fuente de verdad en la tabla `empresa` (`whatsapp`, `whatsapp_soporte`, `numero_reclamos`, `email`) leída vía `getEmpresa()`; correos y PDFs usan esos valores con fallback.

---

## 3. Pruebas ejecutadas hoy (resultados)

| Prueba | Resultado |
|---|---|
| Login `marlon@gmail.com` → password grant | ✅ OK, `app_metadata.role=admin` |
| `GET /`, `GET /login`, `GET /api/empresa`, `GET /api/categorias` | ✅ 200 |
| `GET /admin`, `GET /admin/productos` sin sesión | ✅ 307 → `/login` |
| `POST /api/empresa`, `POST /api/upload`, `GET /api/descargar-pdf` sin sesión | ✅ 401 |
| `POST /api/empresa` y `/api/upload` con cookie admin | ✅ autenticados (200 / llegan a la lógica) |
| Anon `SELECT` en 22 tablas del código | ✅ contenido público 200; `empleados`, `reclamaciones` → `[]` |
| Anon subir/borrar objeto en `imagenes` | ✅ 403 RLS |
| Admin subir/borrar objeto de prueba | ✅ 200 / 200 (limpiado) |
| Admin `SELECT reclamaciones` | ✅ 200 (esperado) |
| OpenAPI de PostgREST | ✅ requiere `service_role` |
| Secretos en el bundle (`RESEND_API_KEY`, `EMAIL_PASSWORD`, `EMAILJS_*`, patrones `re_…`, `SG.…`) | ✅ no aparecen; el único JWT del bundle es la anon key (pública por diseño) |
| Sourcemaps (`/_next/static/chunks/*.js.map`) | ✅ 404 |
| `/.env`, `/.git/config` | ✅ 404 |
| CORS en la API propia con `Origin: https://evil.example` | ✅ sin cabeceras CORS (same-origin) |
| `notificar-contacto` con `{}` | ✅ 400, no envía correo |

---

## 4. Riesgos residuales y recomendaciones

**Pendientes (sin fix):**

1. **Security headers** (Media): no hay `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`; se expone `x-powered-by: Next.js`.
   - *Fix:* `poweredByHeader: false` en `next.config.ts` + CSP/HSTS vía Cloudflare Transform Rules en el worker.
2. **Rate limiting / abuso de correo** (Media): `POST /api/notificar-contacto` y `POST /api/notificar-ticket` no tienen límite de tasa ni CAPTCHA → un bot puede disparar envíos ilimitados a Resend (costo/cuota) y usar el asunto/cuerpo con entradas del usuario sin escapar (inyección de HTML en el correo).
   - *Fix:* CAPTCHA (Turnstile) + límite por IP (Cloudflare WAF o rule) + escapar HTML y sanitizar `subject`.
3. **Columna `password` de `empleados`** (Baja): sigue siendo legible con sesión admin (el login ya no la usa).
   - *Fix:* `revoke select(password) on public.empleados from authenticated;` o eliminar la columna una vez migrados los usuarios a Supabase Auth.
4. **Usuario Auth sin rol**: ✅ confirmado con SQL — `admin_all.qual = is_admin()`, así que un usuario autenticado sin `app_metadata.role='admin'` no obtiene ningún permiso (solo `anon_read` de contenido público). `anon_read.qual = true` aplica a `roles={public}`: lectura de contenido público para anon y autenticados, aceptable.
   - *Nota:* `anon_insert_reclamaciones` tiene `qual = null` para `roles={public}`: cualquier visitante puede crear reclamaciones (requisito legal del Libro de Reclamaciones). Riesgo aceptado pero sin límite de tasa → ver punto 2.
5. **Detalle de errores**: `notificar-ticket` devuelve `detalles: resendData` al cliente (posible fuga de información del proveedor); `POST /api/upload` devuelve 500 en vez de 400 cuando falta el archivo.

**Verificado como correcto (no requiere acción):**
- Sin secretos de servidor en el bundle; sourcemaps off; `.env`/`.git` no servidos.
- CORS de Supabase refleja orígenes arbitrarios: es el comportamiento esperado de la anon key y queda mitigado por RLS (solo lectura de contenido público).
- OpenAPI de PostgREST restringido a `service_role`.
- Todas las tablas con RLS activo.

---

## 5. Estado de despliegue

| Commit/versión | Contenido |
|---|---|
| `9a2ee56a` | Login con Supabase Auth, middleware, rutas API protegidas |
| `239d5992` (actual) | Upsert de empresa con cliente autenticado |

Última verificación: probes de producción OK sobre `https://mkapuecomercefront.solvegrades.workers.dev`.
