require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const TRIAL_DAYS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Alta pública: guarda el negocio interesado y arranca el mes de prueba.
// A propósito NO cobra nada todavía -- el status queda en 'trialing' y
// Alejandro hace el seguimiento a mano (contacta al negocio, arma su
// instancia con DeliveryTracker-Template, etc.) mientras no haya un cobro
// automático conectado.
app.post('/api/signup', async (req, res) => {
  const businessName = (req.body?.businessName || '').trim();
  const contactName = (req.body?.contactName || '').trim();
  const email = (req.body?.email || '').trim();
  const phone = (req.body?.phone || '').trim();
  const notes = (req.body?.notes || '').trim();

  const missing = [];
  if (!businessName) missing.push('Nombre del negocio');
  if (!contactName) missing.push('Tu nombre');
  if (!email) missing.push('Email');
  else if (!EMAIL_RE.test(email)) missing.push('Email (formato inválido)');
  if (!phone) missing.push('Celular');
  if (missing.length > 0) {
    return res.status(400).json({ error: `Falta completar: ${missing.join(', ')}.` });
  }

  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase.from('signups').insert({
    business_name: businessName.slice(0, 120),
    contact_name: contactName.slice(0, 120),
    email: email.slice(0, 200),
    phone: phone.slice(0, 30),
    notes: notes.slice(0, 1000),
    status: 'trialing',
    trial_started_at: trialStartedAt.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
  }).select('id').single();

  if (error) {
    console.error('Error guardando el alta en Supabase:', error.message);
    return res.status(500).json({ error: 'No se pudo guardar el registro. Probá de nuevo en un momento.' });
  }

  // TODO Mercado Pago: cuando se conecte el cobro real, acá es donde se
  // crearía la preapproval/suscripción de Mercado Pago (con free_trial de
  // TRIAL_DAYS días) usando MERCADOPAGO_ACCESS_TOKEN, y se guardaría el id
  // de esa suscripción en `signups` (agregar una columna, ej.
  // `mp_subscription_id`) para poder verificar su estado después via
  // webhook. Hasta entonces, el alta queda en 'trialing' sin ningún cobro.

  res.json({ ok: true, id: data.id, trialEndsAt: trialEndsAt.toISOString() });
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Registro de cuentas corriendo en http://localhost:${PORT}`);
});
