# 🍕 Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas (Router → Service → Unit of Work → Repository → Model), JWT en cookie HttpOnly y autorización por roles.
- **Frontend:** React 19 + TypeScript (strict) + Vite + Tailwind CSS, TanStack Query / Form / Table, Zustand y Axios.

| | |
|---|---|
| **Repositorio** | `https://github.com/TU-USUARIO/food-store` ← _reemplazar por la URL real_ |
| **Video de demostración** | `https://...` ← _reemplazar por el link público_ |

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11, 3.12 o 3.13 (**no 3.14**: SQLModel 0.0.22 no funciona) |
| PostgreSQL | 15 o superior (para desarrollo rápido se puede usar SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Usuarios del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| admin | `admin` | `Admin1234!` |
| user (cliente demo) | `cliente` | `Cliente1234!` |

---

## 1. Backend

Todos los comandos se ejecutan dentro de la carpeta `backend/`.

### 1.1 Crear la base de datos (PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

> ¿Sin PostgreSQL? Podés saltear este paso y usar SQLite: en el `.env` poné `DATABASE_URL=sqlite:///./foodstore.db`.

### 1.2 Instalar y configurar

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
cp .env.example .env        

```

### 1.3 Cargar datos iniciales y ejecutar

```bash
python -m app.db.seed       
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación: <http://localhost:8000/docs> (Swagger) y <http://localhost:8000/redoc>

> Para probar endpoints protegidos desde `/docs`: ejecutá primero `POST /auth/token` con usuario y contraseña. El navegador guarda la cookie y la manda en las siguientes peticiones.

### 1.4 Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |

---

## 2. Frontend

Todos los comandos se ejecutan dentro de la carpeta `frontend/`, con el backend corriendo.

```bash
cd frontend
cp .env.example .env      
pnpm install
pnpm build               
pnpm dev                   
```

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> **Importante:** abrí la app en `http://localhost:5173` (no en `127.0.0.1`). La cookie de sesión se asocia al nombre de host, así que el frontend y la API tienen que usar los dos `localhost`.

---

## 3. Estructura del proyecto

```
food-store/
├── backend/
│   ├── app/
│   │   ├── main.py              FastAPI, CORS con credenciales y routers bajo /api/v1
│   │   ├── core/                config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/
│   │   │   ├── auth/            router, service, schemas (usa el modelo Usuario)
│   │   │   ├── usuarios/        models, schemas, repository, unit_of_work, service, router
│   │   │   ├── categorias/      ídem
│   │   │   ├── productos/       ídem
│   │   │   └── pedidos/         ídem — RN-01 a RN-06 y máquina de estados
│   │   └── db/
│   │       ├── models.py        registra todos los modelos
│   │       └── seed.py          carga inicial idempotente
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── shared/              api (axios, errores, queryClient), ui, components, layout, hooks, types
    │   ├── features/            auth, categorias, productos, usuarios, pedidos
    │   │   └── <feature>/       pages, components, hooks, api, types
    │   ├── store/               authStore y cartStore (Zustand + persist)
    │   ├── routes/              AppRouter y ProtectedRoute
    │   ├── App.tsx              checkSession al montar
    │   └── main.tsx             QueryClientProvider
    ├── package.json
    └── .env.example
```

## 4. Endpoints principales

Todos bajo `/api/v1`. El detalle completo (schemas, códigos de error) está en `/docs`.

| Recurso | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/token` · `POST /auth/logout` · `GET /auth/me` |
| Usuarios (admin) | `GET /admin/usuarios` · `POST /admin/usuarios/{id}/activar` · `POST /admin/usuarios/{id}/desactivar` |
| Categorías | `GET /categorias` · `GET /categorias/{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` (baja lógica) |
| Productos | `GET /productos?skip&limit&search&categoria_id&disponible` · `GET /{id}` · `POST` · `PUT /{id}` · `PATCH /{id}/stock` · `DELETE /{id}` |
| Pedidos | `POST /pedidos` · `GET /pedidos?skip&limit&estado&mios` · `GET /pedidos/resumen` · `GET /{id}` · `PATCH /{id}/estado` · `PATCH /{id}/cancelar` |

> `mios=true` (opcional) hace que `GET /pedidos` devuelva solo los pedidos del usuario de la sesión, aunque sea admin. Lo usa la pantalla «Mis pedidos».

## 5. Reglas de negocio implementadas

- **RN-01** Crear pedido en una sola transacción (Unit of Work): sin ítems repetidos; cada producto activo, disponible y con stock; descuento de stock y copia de nombre y precio en cada línea. Si algo falla, rollback total.
- **RN-02** Máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, con `CANCELADO` desde los dos primeros. Transición inválida: 400.
- **RN-03** Cancelar restituye el stock en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos (y solo en `PENDIENTE`); el admin ve todos y avanza o cancela.
- **RN-05** Líneas y total inmutables: no hay endpoints de edición ni borrado de pedidos.
- **RN-06** `forma_pago` ∈ {EFECTIVO, TRANSFERENCIA}; `direccion_entrega` de 5 a 200 caracteres (validado en el schema).
