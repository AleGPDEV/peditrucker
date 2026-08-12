-- ============================================================================
-- DeliveryTracker-Signup — schema.sql
-- ============================================================================
-- Una sola tabla: el alta de cada negocio que se registra desde la página
-- pública, con el mes de prueba calculado en el momento del alta. Corré esto
-- una vez en un proyecto de Supabase propio (SQL Editor -> paste -> Run).
--
-- Esto es intencionalmente chico: no hay usuarios/auth acá, es una lista de
-- interesados que Alejandro revisa a mano (Supabase Table Editor alcanza como
-- panel de administración por ahora -- no hace falta construir uno propio
-- para este volumen). `status` se actualiza a mano mientras no haya cobro
-- automático conectado (ver el TODO de Mercado Pago en server.js).
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

create table signups (
  id               uuid primary key default gen_random_uuid(),
  business_name    text not null,
  contact_name     text not null,
  email            text not null,
  phone            text not null,
  notes            text,
  -- 'trialing' (mes de prueba, sin cobro) -> 'active' (pagando, cuando se
  -- conecte Mercado Pago) -> 'expired' (se venció el mes y no se convirtió)
  -- -> 'cancelled'. Se actualiza a mano hasta que haya cobro automático.
  status           text not null default 'trialing',
  trial_started_at timestamptz not null default now(),
  trial_ends_at    timestamptz not null,
  created_at       timestamptz not null default now()
);
