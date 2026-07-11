import { base44 } from '@/api/base44Client';

// Generate or retrieve a session ID
function getSessionId() {
  let sid = sessionStorage.getItem('reva_sid');
  if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem('reva_sid', sid); }
  return sid;
}

export async function trackActivity(event, extra = {}) {
  const device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  const referrer = document.referrer || '';
  const page = window.location.pathname + window.location.search;

  let user_email = '';
  try { const u = await base44.auth.me(); user_email = u?.email || ''; } catch {}

  base44.entities.UserActivity.create({
    event,
    page,
    session_id: getSessionId(),
    device,
    referrer,
    user_email,
    ...extra,
  }).catch(() => {});
}