# Brideysa - Agua de mesa y gas a domicilio

## Ver en local
Doble clic en `iniciar_servidor.bat` -> http://localhost:8000 (admin: /portal_admin.html)

## Editar contenido
1. Entra a `/portal_admin.html` (usuario `admin`, clave inicial `123123`; cámbiala con el botón 🔑).
2. Edita y pulsa **🚀 Subir cambios** (se publica solo) o **Descargar cambios** (reemplaza `data.json` y haz `git push`).

## Configuración en Vercel (una sola vez)
Project -> Settings -> Environment Variables:
- `GITHUB_TOKEN` : token fine-grained del repo con permiso "Contents: Read and write"
- `GITHUB_REPO`  : diegoyuyas/web-brideysa
- `GITHUB_BRANCH`: main (opcional)
Luego Redeploy.
