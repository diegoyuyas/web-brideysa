// Función serverless de Vercel: valida admin y guarda cambios en GitHub (Vercel republica solo).
const crypto = require('crypto');
const repo = process.env.GITHUB_REPO, branch = process.env.GITHUB_BRANCH || 'main', token = process.env.GITHUB_TOKEN;
const AUTH = 'api/_auth.json';
const gh = (p, o = {}) => fetch(`https://api.github.com/repos/${repo}/contents/${p}` + (o.method === 'PUT' ? '' : `?ref=${branch}`), {
  ...o, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'brideysa-admin', 'Content-Type': 'application/json' } });
async function getFile(p) {
  const r = await gh(p); if (r.status === 404) return null;
  if (!r.ok) throw new Error('GitHub ' + r.status + ' (revisa GITHUB_TOKEN/GITHUB_REPO)');
  const j = await r.json(); return { sha: j.sha, text: j.content ? Buffer.from(j.content, 'base64').toString('utf8') : '' };
}
async function putFile(p, text, sha, message) {
  const r = await gh(p, { method: 'PUT', body: JSON.stringify({ message, content: Buffer.from(text).toString('base64'), branch, sha: sha || undefined }) });
  if (!r.ok) throw new Error('GitHub ' + r.status + ': ' + (await r.text()).slice(0, 200));
}
const hash = (pw, salt) => crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256').toString('hex');
const eq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });
  if (!token || !repo) return res.status(500).json({ ok: false, error: 'Falta configurar GITHUB_TOKEN y GITHUB_REPO en Vercel' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const auth = await getFile(AUTH);
    let ok = false;
    if (b.user === 'admin' && typeof b.password === 'string') {
      if (auth && auth.text) { const a = JSON.parse(auth.text); ok = eq(hash(b.password, a.salt), a.hash); }
      else ok = eq(b.password, '123123'); // contraseña por defecto
    }
    if (!ok) { await new Promise(r => setTimeout(r, 1000)); return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' }); }
    if (b.action === 'login') return res.json({ ok: true });
    if (b.action === 'password') {
      if (typeof b.newPassword !== 'string' || b.newPassword.length < 6) return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
      const salt = crypto.randomBytes(16).toString('hex');
      await putFile(AUTH, JSON.stringify({ salt, hash: hash(b.newPassword, salt) }), auth && auth.sha, 'Cambiar contraseña del admin');
      return res.json({ ok: true });
    }
    if (b.action === 'upload') {
      // Sube una imagen (base64 sin prefijo) a assets/uploads/. Límite de Vercel: ~4.5 MB por petición.
      const name = String(b.name || '').toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      if (!/^[a-z0-9][a-z0-9._-]{0,80}\.(jpg|jpeg|png|webp)$/.test(name)) return res.status(400).json({ ok: false, error: 'Nombre de imagen no válido' });
      if (typeof b.content !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(b.content)) return res.status(400).json({ ok: false, error: 'Imagen inválida' });
      if (b.content.length * 0.75 > 4 * 1024 * 1024) return res.status(413).json({ ok: false, error: 'La imagen es demasiado pesada para subirla' });
      const path = 'assets/uploads/' + name;
      const r = await gh(path, { method: 'PUT', body: JSON.stringify({ message: 'Subir imagen desde el portal admin', content: b.content, branch }) });
      if (!r.ok) throw new Error('GitHub ' + r.status + ': ' + (await r.text()).slice(0, 200));
      return res.json({ ok: true, path });
    }
    if (b.action === 'publish') {
      const d = b.data;
      if (!d || typeof d !== 'object' || !d.hero || !Array.isArray(d.servicios)) return res.status(400).json({ ok: false, error: 'Datos inválidos' });
      if (d.whatsapp !== undefined) d.whatsapp = String(d.whatsapp).replace(/\D/g, '').slice(0, 15);
      if (d.whatsappMensaje !== undefined) d.whatsappMensaje = String(d.whatsappMensaje).slice(0, 300);
      const cur = await getFile('data.json');
      await putFile('data.json', JSON.stringify(d, null, 2), cur && cur.sha, 'Actualizar contenido desde el portal admin');
      return res.json({ ok: true });
    }
    res.status(400).json({ ok: false, error: 'Acción no válida' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};
