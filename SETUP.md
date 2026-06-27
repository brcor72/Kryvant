# Kryvant — Guía de Setup Local

## Prerrequisitos
- Node.js v18+ (ya instalado)
- pnpm (ya instalado)

---

## 1. Instalar dependencias

### Backend
```powershell
cd C:\Users\HP\Desktop\Kryvant\backend
npm install
```

### Frontend
```powershell
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm install
```

---

## 2. Configurar base de datos

```powershell
cd C:\Users\HP\Desktop\Kryvant\backend

# Generar cliente Prisma
npx prisma generate

# Crear la base de datos y tablas
npx prisma migrate dev --name init

# Poblar con datos de prueba
npx ts-node prisma/seed.ts
```

---

## 3. Arrancar el sistema

### Terminal 1 — Backend (API)
```powershell
cd C:\Users\HP\Desktop\Kryvant\backend
npm run dev
```
→ Corre en http://localhost:3001

### Terminal 2 — Frontend
```powershell
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm dev
```
→ Corre en http://localhost:5173

---

## 4. Usuario de prueba

```
Email:    demo@kryvant.com
Password: password123
```

O regístrate con tu propio email en `/login`.

---

## 5. Configurar GitHub Token (para análisis real)

1. Ve a https://github.com/settings/tokens
2. Crea un **Classic Token** con permisos: `repo`, `read:user`
3. Cópialo en `backend/.env`:
   ```
   GITHUB_TOKEN=ghp_tu_token_aqui
   ```

---

## 6. Configurar GitHub OAuth (opcional — para login con GitHub)

1. Ve a https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Configura:
   - **Homepage URL**: http://localhost:5173
   - **Callback URL**: http://localhost:5173/auth/github/callback
3. Añade en `backend/.env`:
   ```
   GITHUB_CLIENT_ID=tu_client_id
   GITHUB_CLIENT_SECRET=tu_client_secret
   ```
4. Añade en `frontend/.env`:
   ```
   VITE_GITHUB_CLIENT_ID=tu_client_id
   ```

---

## 7. Cambiar a PostgreSQL (cuando lo instales)

Cambia en `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Y en `backend/.env`:
```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/kryvant"
```

Luego ejecuta:
```powershell
npx prisma migrate dev --name postgres-init
```

---

## 8. Análisis de seguridad con SonarQube

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo (en esta máquina no estaba disponible al momento de escribir esto).

1. Levanta SonarQube:
   ```powershell
   cd C:\Users\HP\Desktop\Kryvant
   docker compose -f docker-compose.sonarqube.yml up -d
   ```
2. Espera ~1 minuto y abre http://localhost:9000 (usuario/clave por defecto: `admin` / `admin`, te pedirá cambiarla).
3. Genera un token: **My Account → Security → Generate Token**.
4. Corre el scanner desde la raíz del repo (sin instalar nada global, vía Docker):
   ```powershell
   docker run --rm --network host -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli `
     -Dsonar.token=TU_TOKEN_AQUI
   ```
   En Windows sin `--network host` (no soportado fuera de Linux), usa en su lugar:
   ```powershell
   docker run --rm -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli `
     -Dsonar.host.url=http://host.docker.internal:9000 `
     -Dsonar.token=TU_TOKEN_AQUI
   ```
5. Revisa los resultados en el dashboard de `localhost:9000` → pestaña **Issues** / **Security Hotspots**.

La configuración del proyecto está en [`sonar-project.properties`](sonar-project.properties) en la raíz del repo.

---

## Estructura del proyecto

```
Kryvant/
├── frontend/          ← React + TypeScript + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/     ← Todas las vistas
│   │   │   ├── layouts/   ← DashboardLayout (sidebar)
│   │   │   └── routes.ts  ← Definición de rutas
│   │   └── lib/
│   │       ├── api.ts     ← Cliente HTTP para el backend
│   │       └── auth.tsx   ← Context de autenticación
│   └── .env
│
├── backend/           ← Node.js + Express + TypeScript + Prisma + SQLite
│   ├── src/
│   │   ├── routes/    ← auth, users, analysis, projects, jobs, learning, billing, teams
│   │   ├── services/  ← githubService (análisis de repos)
│   │   ├── middleware/ ← JWT auth
│   │   └── index.ts   ← Entry point
│   ├── prisma/
│   │   ├── schema.prisma  ← Modelos de BD
│   │   └── seed.ts        ← Datos de prueba
│   └── .env
│
└── SETUP.md           ← Este archivo
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/github | OAuth con GitHub |
| GET | /api/auth/me | Usuario autenticado |
| GET | /api/users/dashboard | Datos del dashboard |
| GET | /api/users/profile | Perfil completo |
| PATCH | /api/users/profile | Actualizar perfil |
| POST | /api/analysis/analyze | Analizar GitHub |
| GET | /api/analysis/results | Resultados del análisis |
| GET | /api/projects | Listar proyectos |
| GET | /api/projects/:id | Detalle de proyecto |
| PATCH | /api/projects/:id | Actualizar proyecto |
| GET | /api/jobs | Listar empleos Big Tech |
| GET | /api/learning | Recursos de aprendizaje |
| GET | /api/billing | Ver suscripción |
| POST | /api/billing/upgrade | Actualizar plan |
| POST | /api/billing/cancel | Cancelar plan |
| GET | /api/teams | Listar equipos |
| POST | /api/teams | Crear equipo |
| POST | /api/teams/:id/invite | Invitar miembro |
