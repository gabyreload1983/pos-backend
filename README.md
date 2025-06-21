
# POS Backend

Este es el backend del sistema de punto de venta (POS), desarrollado con Node.js y Express, utilizando MySQL como base de datos.

## 🚀 Scripts disponibles

- `npm run dev`  
  Ejecuta la aplicación en modo desarrollo con variables de entorno cargadas desde `.env.development` y reinicio automático gracias a `--watch`.

- `npm start`  
  Ejecuta la aplicación en modo producción.

## 🧪 Variables de entorno

En lugar de usar la librería `dotenv`, este proyecto usa `--env-file` directamente en los scripts del `package.json`.

El archivo de desarrollo es:

```
.env.development
```

Ejemplo de configuración:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=devuser
DB_PASSWORD=devpass
DB_NAME=pos
JWT_SECRET=supersecreto123
```

## 🗂️ Estructura del proyecto

```
src/
├── app.js               # App Express
├── config/db.js         # Conexión a MySQL
├── controllers/         # Lógica de cada módulo
├── middlewares/         # Validaciones y JWT
├── models/              # Acceso a la DB
├── routes/              # Endpoints
├── services/            # Lógica de negocio
└── utils/               # Helpers reutilizables
```

## 🧾 Git

Este proyecto ya incluye un `.gitignore` con:
- `node_modules`
- `.env`
- `.env.development`

Para comenzar a trabajar con Git:

```bash
git init
git add .
git commit -m "Inicio del proyecto POS backend"
```

## 📦 Requisitos

- Node.js 18 o superior
- MySQL 8+
