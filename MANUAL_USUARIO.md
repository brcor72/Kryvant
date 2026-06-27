# KRYVANT — Manual de Usuario

**Versión:** 1.0.0
**Fecha:** Junio 2026

---

## ¿QUÉ ES KRYVANT?

Kryvant es una plataforma que analiza tu perfil de GitHub, detecta qué habilidades te faltan
para conseguir un trabajo en empresas como Google, NVIDIA, Meta o Amazon, y te asigna
proyectos de práctica específicos para cerrar esas brechas.

**En concreto:**
- Lees tus repos de GitHub y calcula tus habilidades reales
- Compara esas habilidades con los requisitos del puesto que quieres
- Te dice exactamente qué practicar y te da un proyecto concreto para cada brecha
- Hace seguimiento de tu progreso

---

## PRIMEROS PASOS

### Paso 1 — Crear una cuenta

1. Abre el navegador y ve a `http://localhost:5173`
2. Haz clic en **"Comenzar"** (esquina superior derecha de la página principal)
3. En la pantalla de login, selecciona la pestaña **"Registrarse"**
4. Ingresa tu email, nombre de usuario y contraseña (mínimo 8 caracteres)
5. Haz clic en **"Crear cuenta gratis"**

**También puedes entrar con GitHub:** Haz clic en "Continuar con GitHub" y autoriza el acceso.
Esto conecta tu cuenta directamente y facilita el análisis.

---

### Paso 2 — Onboarding: Configura tu análisis

Después de crear tu cuenta, llegarás automáticamente a la pantalla de configuración.

#### 2.1 Elige tu rol objetivo

Primero dinos a dónde quieres llegar:

| Campo | Ejemplo |
|-------|---------|
| **Empresa objetivo** | NVIDIA, Google, Meta, Microsoft, Amazon, Apple, OpenAI |
| **Nivel** | Junior / Mid / Senior / Staff / Principal |
| **Título del puesto** | "Ingeniero Senior C++ en NVIDIA" |

Puedes elegir una de las sugerencias rápidas que aparecen abajo del campo de texto.

#### 2.2 Método de análisis

Selecciona **"GitHub"** (actualmente disponible). Las opciones de CV y Manual estarán disponibles próximamente.

#### 2.3 Tu usuario de GitHub

Escribe tu nombre de usuario de GitHub (sin @). Ejemplo: `torvalds`

> El usuario debe ser **público** o tener el token configurado en el sistema.

#### 2.4 Iniciar análisis

Haz clic en **"Iniciar Análisis"**. Verás una pantalla de progreso con los pasos:
- Conectando con GitHub API
- Analizando repositorios
- Detectando lenguajes y frameworks
- Calculando brechas de habilidades
- Generando proyectos recomendados

El análisis tarda entre 20 y 60 segundos dependiendo de la cantidad de repositorios.

---

## EL DASHBOARD PRINCIPAL

Al terminar el análisis llegarás al Panel principal. Está dividido en secciones:

### Puntuación General de Match

El gráfico circular de la izquierda muestra tu **porcentaje de coincidencia** con el rol objetivo.
- 🟢 **Verde:** Habilidades que ya tienes y coinciden con el rol
- 🟡 **Amarillo:** Brechas que necesitas cerrar

Un 68% de match, por ejemplo, significa que ya tienes el 68% de las habilidades requeridas.

### Principales Brechas de Habilidades

Lista de las habilidades más importantes que te faltan, con:
- **Nombre de la brecha** (ej: "Gestión Manual de Memoria en C++")
- **Tiempo estimado** para cerrarla (ej: 3 días)
- **Flecha** que lleva directo al proyecto asignado

Haz clic en cualquier brecha para ver el proyecto recomendado.

### Tus Fortalezas

Las habilidades en las que ya destacas, con su nivel y porcentaje de match.

### Acciones Recomendadas

Botones de acceso directo a tu proyecto más urgente y a opciones de plan.

---

## MIS PROYECTOS

Accede desde el menú lateral → **"Mis Proyectos"**.

Verás todos los proyectos asignados para cerrar tus brechas.

### Estados de un proyecto

| Estado | Significado |
|--------|-------------|
| **Pendiente** | Asignado pero no iniciado |
| **En progreso** | Estás trabajando en él |
| **Completado** | Finalizado |
| **Abandonado** | Lo dejaste |

### Ver el detalle de un proyecto

Haz clic en cualquier proyecto para ver:

1. **Descripción completa** — qué construir exactamente
2. **Stack tecnológico** — lenguajes y herramientas
3. **Código de inicio** — plantilla de código para empezar (con botón de copiar)
4. **Marcadores de progreso** — 4 hitos (Setup / Core / Tests / Documentación)
5. **Campo de repositorio** — donde pegar el link de tu GitHub cuando termines

### Gestionar el progreso

1. Haz clic en **"Comenzar Proyecto"** para marcarlo como en progreso
2. Ve marcando los hitos de progreso (25% → 50% → 75% → 100%)
3. Cuando termines, haz clic en **"Marcar Completado"**
4. Pega el link de tu repositorio en el campo "Repositorio"

---

## TRABAJOS BIG TECH

Accede desde el menú lateral → **"Trabajos Big Tech"**.

Lista de posiciones abiertas en empresas top de tecnología.

### Filtrar empleos

- **Buscador:** Escribe un título, empresa o tecnología (ej: "CUDA", "Go", "Staff")
- **Filtro por empresa:** Selecciona una empresa específica del menú desplegable

### Información de cada empleo

Cada tarjeta muestra:
- Título y empresa
- Ubicación y modalidad (presencial / híbrido / remoto)
- Rango salarial en USD
- Descripción del rol
- Stack tecnológico requerido
- Fecha de publicación

Haz clic en **"Aplicar"** para ir al portal de la empresa.

---

## LEARNING HUB

Accede desde el menú lateral → **"Learning Hub"**.

Recursos curados para aprender las tecnologías de tus brechas.

### Tipos de recursos

| Ícono | Tipo |
|-------|------|
| 🎥 | Video / Charla técnica |
| 📖 | Libro |
| 💻 | Curso online |
| 📄 | Documentación oficial |

### Filtrar por categoría

Usa los botones de categoría en la parte superior:
- C++ Avanzado
- Sistemas Distribuidos
- CUDA / GPU
- gRPC & Protobuf
- Machine Learning
- Rust, Kubernetes, y más

Cada recurso muestra plataforma, duración, nivel, calificación y si es gratis o de pago.
Haz clic en la tarjeta para ir directamente al recurso.

---

## SUSCRIPCIÓN / BILLING

Accede desde el menú lateral → **"Suscripción"**.

### Planes disponibles

| Plan | Precio | Análisis | Proyectos | Equipos |
|------|--------|----------|-----------|---------|
| **Gratis** | $0 | 1 análisis | 3 proyectos | No |
| **Pro** | $29/mes | Ilimitados | Ilimitados | No |
| **Enterprise** | $99/mes | Ilimitados | Ilimitados | Sí (B2B) |

### Cambiar de plan

1. Haz clic en **"Cambiar a Pro"** o **"Cambiar a Enterprise"**
2. El sistema actualiza tu plan instantáneamente
   *(en producción aquí iría la pasarela de pagos con Stripe)*
3. Verás la confirmación y la fecha de renovación

### Cancelar suscripción

1. Haz clic en **"Cancelar suscripción"** (aparece si tienes plan de pago)
2. Confirma la acción
3. Seguirás teniendo acceso hasta el final del período pagado

---

## CONFIGURACIÓN

Accede desde el menú lateral → **"Configuración"**.

### Perfil profesional

Puedes actualizar:
- **Usuario de GitHub** — para reanálisis futuros
- **Rol actual** — tu puesto de trabajo actual
- **LinkedIn URL** — enlace a tu perfil
- **Años de experiencia**
- **Bio** — descripción breve (máx. 500 caracteres)

Haz clic en **"Guardar cambios"** para confirmar.

### Cerrar sesión

Opción disponible en:
1. La sección "Tu cuenta" dentro de Configuración
2. El ícono de flecha en la parte inferior del menú lateral

---

## ADMIN DE EQUIPOS (Plan Enterprise)

Accede desde el menú lateral → **"Admin Equipos"**.

Para empresas que quieren analizar las habilidades de su equipo completo.

### Crear un equipo

1. Haz clic en **"Crear equipo"** (disponible con plan Enterprise)
2. Ingresa nombre y slug del equipo (ej: `mi-empresa`)
3. El equipo se crea y eres el propietario automáticamente

### Invitar miembros

1. Ve al equipo creado
2. Ingresa el email del desarrollador que quieres invitar
3. Haz clic en **"Invitar"**
4. El usuario debe ya tener cuenta en Kryvant

### Vista del equipo

Verás las habilidades y brechas de cada miembro del equipo, útil para:
- Planificar capacitación
- Asignar proyectos según habilidades
- Identificar fortalezas del equipo

---

## PREGUNTAS FRECUENTES

**¿Mis repositorios privados se analizan?**
No por defecto. Solo se analizan repos públicos. Para incluir repos privados,
necesitas configurar un GitHub Token con permisos `repo` en el sistema.

**¿Cada cuánto puedo reanalizarme?**
Con el plan Gratis, 1 análisis. Con Pro y Enterprise, cuantas veces quieras.
El análisis más reciente reemplaza al anterior.

**¿Qué pasa si mi usuario de GitHub tiene pocos repos?**
El análisis funciona con cualquier cantidad, pero es más preciso con 10+ repositorios.
Si tienes pocos repos, considera agregar más proyectos a GitHub antes de analizar.

**¿El análisis es en tiempo real?**
Sí. Cada vez que haces clic en "Iniciar Análisis", el sistema consulta la API de GitHub
en ese momento, por lo que refleja el estado actual de tus repositorios.

**¿Puedo cambiar mi rol objetivo?**
Sí. Vuelve a `/onboarding` y configura un nuevo rol. El análisis anterior se reemplazará.

**¿Los proyectos asignados son reales?**
Sí. Son proyectos técnicos concretos diseñados para demostrar dominio de las habilidades
requeridas por las empresas objetivo. Al completarlos en GitHub, tienes evidencia real
de tus capacidades.

**¿Cómo sé que mis datos están seguros?**
- Las contraseñas se guardan con cifrado bcrypt (12 rondas)
- La autenticación usa tokens JWT con expiración de 7 días
- No almacenamos tokens de GitHub de forma permanente
- La base de datos corre localmente en tu máquina

---

## GUÍA RÁPIDA DE USO (Resumen en 5 pasos)

```
1. Regístrate en /login
      ↓
2. Ve a /onboarding → Elige empresa + nivel + usuario GitHub
      ↓
3. Espera el análisis (20-60 seg)
      ↓
4. Revisa tu Dashboard → Ve tus brechas y tu score de match
      ↓
5. Entra a Mis Proyectos → Elige un proyecto → Empieza a construir
```

---

## SOPORTE

Para reportar problemas o sugerencias, contacta al desarrollador del sistema.

**Usuario de prueba (demo):**
```
Email:    demo@kryvant.com
Contraseña: password123
```
