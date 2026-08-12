const formWrapEl = document.getElementById('signup-form-wrap');
const confirmationEl = document.getElementById('confirmation');
const confirmationMsgEl = document.getElementById('confirmation-msg');
const businessNameEl = document.getElementById('business-name');
const contactNameEl = document.getElementById('contact-name');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const notesEl = document.getElementById('notes');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' });
}

submitBtn.addEventListener('click', async () => {
  statusEl.textContent = '';
  statusEl.className = 'status';
  submitBtn.disabled = true;

  const payload = {
    businessName: businessNameEl.value.trim(),
    contactName: contactNameEl.value.trim(),
    email: emailEl.value.trim(),
    phone: phoneEl.value.trim(),
    notes: notesEl.value.trim(),
  };

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      statusEl.textContent = data.error || 'No se pudo enviar el registro.';
      statusEl.className = 'status error';
      submitBtn.disabled = false;
      return;
    }
    formWrapEl.style.display = 'none';
    confirmationEl.style.display = 'block';
    confirmationMsgEl.textContent = `Tu mes de prueba gratis vence el ${fmtDate(data.trialEndsAt)}. Te contactamos por email o WhatsApp para coordinar la puesta en marcha.`;
  } catch (e) {
    statusEl.textContent = 'No se pudo conectar con el servidor. Probá de nuevo en un momento.';
    statusEl.className = 'status error';
    submitBtn.disabled = false;
  }
});
