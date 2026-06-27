# KRYVANT — Guía de Compilación y Despliegue

---

## ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO (Browser)                     │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                     │
│         Compila a: HTML + CSS + JS estáticos             │
│         Formato final: /dist/ (archivos estáticos)       │
└─────────────────────┬───────────────────────────────────┘
                      │ fetch() → REST API
                      ▼
┌─────────────────────────────────────────────────────────┐
│            BACKEND (Node.js + Express)                   │
│         Compila a: JavaScript (CommonJS)                 │
│         Formato final: /dist/index.js                    │
└─────────────────────┬───────────────────────────────────┘
                      │ Prisma ORM
                      ▼
┌─────────────────────────────────────────────────────────┐
│         BASE DE DATOS (SQLite → PostgreSQL)              │
│         Formato: dev.db (SQLite) / PostgreSQL server     │
└─────────────────────────────────────────────────────────┘
```

---

## OPCIÓN A — DESARROLLO LOCAL (recomendado para empezar)

### Requisitos del sistema
| Software | Versión mínima | Instalación |
|----------|----------------|-------------|
| Node.js  | v18+           | nodejs.org |
| pnpm     | v8+            | `npm i -g pnpm` |
| Git      | cualquiera     | git-scm.com |

### Paso 1 — Instalar dependencias

```powershell
# Backend
cd C:\Users\HP\Desktop\Kryvant\backend
npm install

# Frontend
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm install
```

### Paso 2 — Preparar base de datos

```powershell
cd C:\Users\HP\Desktop\Kryvant\backend

# Generar cliente Prisma (tipos TypeScript para la BD)
npx prisma generate

# Crear tablas en la BD (SQLite — crea el archivo dev.db automáticamente)
npx prisma migrate dev --name init

# Poblar con datos de prueba
npx ts-node prisma/seed.ts
```

### Paso 3 — Levantar (modo desarrollo con hot-reload)

**Terminal 1 — Backend:**
```powershell
cd C:\Users\HP\Desktop\Kryvant\backend
npm run dev
# → API corriendo en http://localhost:3001
```

**Terminal 2 — Frontend:**
```powershell
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm dev
# → App corriendo en http://localhost:5173
```

**Resultado en modo dev:** Los cambios en el código se reflejan instantáneamente sin reiniciar.

---

## OPCIÓN B — BUILD DE PRODUCCIÓN

### Frontend — Compilar a archivos estáticos

```powershell
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm build
```

**Resultado:** Carpeta `frontend/dist/` con:
```
dist/
├── index.html          ← Punto de entrada HTML
├── assets/
│   ├── index-[hash].js  ← Todo el JavaScript minificado (~300-500 KB)
│   └── index-[hash].css ← Todo el CSS minificado (~50-80 KB)
└── vite.svg
```

**Formato:** Archivos estáticos — se sirven desde cualquier servidor web
(Nginx, Apache, Vercel, Netlify, AWS S3, GitHub Pages, etc.)

**Previsualizar el build localmente:**
```powershell
pnpm preview
# → http://localhost:4173
```

### Backend — Compilar TypeScript a JavaScript

```powershell
cd C:\Users\HP\Desktop\Kryvant\backend
npm run build
```

**Resultado:** Carpeta `backend/dist/` con:
```
dist/
├── index.js            ← Servidor Express compilado
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── analysis.js
│   ├── projects.js
│   ├── jobs.js
│   ├── learning.js
│   ├── billing.js
│   └── teams.js
├── services/
│   └── githubService.js
└── middleware/
    └── auth.js
```

**Ejecutar en producción:**
```powershell
cd C:\Users\HP\Desktop\Kryvant\backend
node dist/index.js
# → API corriendo en http://localhost:3001
```

---

## OPCIÓN C — EJECUTABLE DE ESCRITORIO (Windows .exe)

Convierte el backend Node.js en un ejecutable `.exe` con **pkg**:

```powershell
# Instalar pkg globalmente
npm install -g pkg

# Compilar backend a .exe
cd C:\Users\HP\Desktop\Kryvant\backend
npm run build
pkg dist/index.js --target node18-win-x64 --output kryvant-server.exe
```

**Resultado:** `kryvant-server.exe` — se ejecuta sin necesitar Node.js instalado.

Para el frontend, los archivos `dist/` se incluyen en la misma carpeta y se sirven con Express:

```typescript
// Añadir en backend/src/index.ts para servir el frontend desde el backend
import path from 'path';
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

Después: `pkg dist/index.js --target node18-win-x64 --output Kryvant.exe`

---

## OPCIÓN D — INSTALADOR WINDOWS (.exe con instalador)

Con **Electron** para envolver la app en una ventana de escritorio nativa:

```powershell
# Instalar Electron en el frontend
cd C:\Users\HP\Desktop\Kryvant\frontend
pnpm add -D electron electron-builder

# Compilar instalador
npx electron-builder --win --x64
```

**Resultado:** `Kryvant-Setup-1.0.0.exe` — instalador de Windows estándar (NSIS)

---

## OPCIÓN E — DOCKER (contenedores)

Para despliegue en servidor Linux/Cloud:

```dockerfile
# Dockerfile del backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/dist ./dist
COPY backend/prisma ./prisma
COPY backend/.env .env
RUN npx prisma migrate deploy
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://postgres:pass@db:5432/kryvant
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: kryvant
  frontend:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
```

```powershell
docker-compose up --build
# → App en http://localhost:80
```

---

## TABLA RESUMEN DE FORMATOS

| Escenario | Comando | Formato resultado | Dónde corre |
|-----------|---------|-------------------|-------------|
| Desarrollo | `npm run dev` + `pnpm dev` | Código fuente con HMR | Localhost |
| Producción Web | `pnpm build` + `npm run build` | HTML/CSS/JS + JS Node | Servidor VPS/Cloud |
| App de escritorio (.exe) | `pkg` | Ejecutable único .exe | Windows sin Node |
| Instalador Windows | `electron-builder` | Setup.exe NSIS | Windows (instala en Program Files) |
| Docker/Cloud | `docker-compose up` | Contenedores OCI | AWS / GCP / Azure / DigitalOcean |

---

## CAMBIAR A PostgreSQL EN PRODUCCIÓN

1. Editar `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   // cambiar de "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Editar `backend/.env`:
```
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/kryvant"
```

3. Ejecutar migración:
```powershell
npx prisma migrate deploy
```

La BD se actualiza sin cambiar ningún código de negocio.
