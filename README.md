# 🧩 App de Encuestas
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-En%20desarrollo-yellow)
![Tech](https://img.shields.io/badge/stack-React%20%2B%20Next%20%7C%20FastAPI%20%7C%20PostgreSQL-blue)

> Aplicación web para crear, responder y gestionar encuestas académicas.  
> Frontend en **React + Next.js**, backend en **Python + FastAPI**, y base de datos en **PostgreSQL** dentro de contenedores **Docker**.

---

## 🚀 Tecnologías Principales

| Capa        | Tecnología                                |
|--------------|--------------------------------------------|
| **Frontend** | React 19, Next.js 15, TypeScript, TailwindCSS |
| **Backend**  | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| **Base de Datos** | PostgreSQL (contenedor Docker) |

---

## 🧠 Descripción General

La aplicación permite:
- Registrar encuestas y preguntas organizadas por secciones.
- Enviar encuestas a estudiantes.
- Recibir y almacenar respuestas anónimas.
- Visualizar métricas agregadas por pregunta o encuesta.

El sistema se organiza en dos partes principales:
1. **Frontend (React + Next.js):** UI moderna, SPA optimizada, consumo de API y manejo de estado con hooks.  
2. **Backend (FastAPI):** API REST con endpoints protegidos, validaciones con Pydantic y persistencia con SQLAlchemy.

---

## ⚙️ Instalación y Ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/UASFIM/btecnologicas-front
cd btecnologicas-front
```

2️⃣ Variables de entorno

Crea un archivo .env en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3️⃣ Ejecutar
```bash
pnpm install
pnpm run dev
```

📁 Estructura del Proyecto
```bash
📦 survey-manager
├── frontend/                 # React + Next.js app
│   ├── app/
│   |    ├── editor/
│   |    ├── survey/
│   |    ├── stats/
│   ├── components/
│   |    ├── ui/
│   ├── hooks/
│   ├── lib/
│   |    ├── api.ts
│   |    ├── utils.ts
├── .env.example
└── README.md
```

📊 Flujo de la Aplicación

1. **El usuario accede a la interfaz y selecciona una encuesta.**
2. **El frontend solicita las preguntas al backend (GET /surveys/{id}).**
3. **El usuario responde y envía el formulario (POST /surveys/{id}/responses).**
4. **El backend guarda las respuestas en PostgreSQL.**
5. **Se pueden consultar resultados y métricas globales.**

🧩 Funcionalidades Pendientes
- Tests automatizados.
- Desplegar en producción.