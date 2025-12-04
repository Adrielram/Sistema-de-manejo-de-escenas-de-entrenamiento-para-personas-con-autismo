# 🧠 Sistema de Escenas de Entrenamiento para Personas con Autismo

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)

**Plataforma web para crear, gestionar y ejecutar escenas de entrenamiento social diseñadas para personas con Trastorno del Espectro Autista (TEA).**

</div>

---

## 🎯 Descripción del Proyecto

Este sistema fue desarrollado como herramienta de apoyo terapéutico para facilitar el entrenamiento de **habilidades sociales** en personas con autismo mediante **escenas interactivas y personalizables**.

El objetivo principal es proporcionar a terapeutas, educadores y familias una plataforma intuitiva donde puedan:

- Crear escenarios de situaciones sociales cotidianas
- Personalizar el contenido según las necesidades del usuario
- Ejecutar sesiones de entrenamiento de forma estructurada
- Dar seguimiento al progreso del paciente/estudiante

---

## ✨ Características Principales

### 🎭 Gestión de Escenas
- **Creación personalizada** de escenas de entrenamiento
- **Biblioteca de escenarios** predefinidos
- **Editor visual** para configurar interacciones

### 👤 Perfiles de Usuario
- **Roles diferenciados**: Terapeuta, Educador, Familiar
- **Configuración adaptable** según necesidades individuales
- **Historial de sesiones** por usuario

### 📊 Seguimiento y Reportes
- **Registro de sesiones** de entrenamiento
- **Métricas de progreso** visualizables
- **Exportación de informes**

### 🔐 Seguridad y Privacidad
- **Datos protegidos** según normativas de salud
- **Acceso controlado** por roles
- **Información sensible encriptada**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 14, TypeScript, React |
| **Backend** | Python, Django REST Framework |
| **Base de Datos** | PostgreSQL |
| **Contenedores** | Docker, Docker Compose |
| **Estilos** | CSS Modules / Tailwind CSS |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│              Puerto 3000 - Interfaz de Usuario           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Django API)                   │
│              Puerto 8000 - REST API                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
│              Puerto 5432 - Persistencia                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalación y Ejecución

### Prerequisitos
- Docker y Docker Compose instalados
- Git

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Adrielram/Sistema-de-manejo-de-escenas-de-entrenamiento-para-personas-con-autismo.git
cd Sistema-de-manejo-de-escenas-de-entrenamiento-para-personas-con-autismo
```

2. **Construir los contenedores**
```bash
docker-compose build --no-cache
```

3. **Levantar los servicios**
```bash
docker-compose up
```

4. **Acceder a la aplicación**
- Frontend: `http://localhost:3000`
- API Backend: `http://localhost:8000`

---

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── api/                 # Endpoints REST
│   ├── backendapp/          # Configuración Django
│   ├── manage.py            # CLI de Django
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile
│
├── frontend/
│   └── frontapp/            # Aplicación Next.js
│       ├── app/             # App Router
│       ├── components/      # Componentes React
│       └── Dockerfile
│
├── docker-compose.yml       # Orquestación de servicios
└── README.md
```

---

## 🌟 Impacto Social

Este proyecto busca contribuir a la **inclusión y desarrollo** de personas con TEA, facilitando herramientas tecnológicas accesibles para:

- 🏥 **Centros de terapia** especializados
- 🏫 **Instituciones educativas** con programas de inclusión
- 👨‍👩‍👧 **Familias** que buscan apoyar el desarrollo social en casa

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Add: Nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Adriel**
- GitHub: [@Adrielram](https://github.com/Adrielram)

---

<div align="center">

**Hecho con ❤️ para la comunidad TEA**

</div>
