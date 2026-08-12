# Delivery Tracker — Registro

Página pública de alta para negocios interesados en [DeliveryTracker-Template](../DeliveryTracker-Template) — junta los datos de contacto y arranca el mes de prueba. Es intencionalmente simple: no cobra nada todavía (ver "Sobre el cobro" más abajo), la idea es tener algo funcionando ya, y conectar Mercado Pago más adelante, cuando el producto esté por salir a producción de verdad.

## Cómo funciona

1. El negocio completa el formulario (`public/index.html`) con nombre del negocio, contacto, email, celular y una nota opcional.
2. `POST /api/signup` guarda la fila en Supabase (tabla `signups`, ver `schema.sql`) con `status: 'trialing'` y `trial_ends_at` = hoy + 30 días.
3. Alejandro revisa los registros nuevos directo en el **Table Editor de Supabase** (no hace falta un panel de administración propio para este volumen) y se contacta a mano con cada uno para coordinar la puesta en marcha — que hoy significa desplegar una instancia nueva a partir de `DeliveryTracker-Template`.

## Sobre el cobro (Mercado Pago)

**No está conectado todavía, a propósito** — se deja para cuando el producto esté por salir a producción de verdad. El punto exacto donde se engancharía está marcado con un comentario `// TODO Mercado Pago` en `server.js`, dentro de `POST /api/signup`: ahí es donde se crearía la suscripción (preapproval) con `free_trial` de 30 días usando la Checkout API de Mercado Pago, y se guardaría el id de esa suscripción en la fila de `signups` para poder consultar su estado después vía webhook.

Mientras tanto, `status` se actualiza a mano desde Supabase (`trialing` → `active` cuando el negocio empieza a pagar, `expired`/`cancelled` según corresponda).

## Puesta en marcha

### 1. Supabase

Un proyecto de Supabase propio para esto (separado del de cualquier negocio cliente — esto es la lista de leads de Alejandro, no datos de un negocio). Corré `schema.sql` en el SQL Editor.

### 2. Variables de entorno

Copiá `.env.example` a `.env`:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
PORT=3100
```

### 3. Correrlo

```bash
npm install
npm start
```

Abrí `http://localhost:3100`.

### 4. Desplegar

Render.com o Railway.app, igual que el template — conectá el repo de GitHub, configurá las mismas variables de entorno.
