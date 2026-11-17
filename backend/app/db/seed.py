"""Carga inicial idempotente: se puede ejecutar varias veces sin duplicar datos.

Uso (desde la carpeta backend/):  python -m app.db.seed
"""

from sqlmodel import Session, select

import app.db.models 
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com",
     "password": "Admin1234!", "role": "admin"},
    {"username": "cliente", "full_name": "Cliente Demo", "email": "cliente@foodstore.com",
     "password": "Cliente1234!", "role": "user"},
]

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Empanadas", "descripcion": "Empanadas al horno"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas"},
]


def _img(texto: str) -> str:
    return f"https://placehold.co/600x400/f97316/ffffff?text={texto.replace(' ', '+')}"


PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10800, 15),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla, muzzarella y orégano", 10500, 12),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8200, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, doble cheddar y panceta", 11200, 18),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 8900, 10),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1500, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso", 1400, 40),
    ("Bebidas", "Gaseosa 1.5 L", "Línea cola", 3200, 30),
    ("Bebidas", "Agua sin gas 500 ml", "Agua mineral", 1500, 50),
    ("Bebidas", "Cerveza artesanal 500 ml", "Rubia (IPA)", 4200, 24),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        for datos in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == datos["username"])).first()
            if not existe:
                session.add(Usuario(
                    username=datos["username"],
                    full_name=datos["full_name"],
                    email=datos["email"],
                    hashed_password=hash_password(datos["password"]),
                    role=datos["role"],
                ))
        session.commit()

        categorias: dict[str, Categoria] = {}
        for datos in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == datos["nombre"])).first()
            if not categoria:
                categoria = Categoria(**datos)
                session.add(categoria)
                session.flush()
            categorias[categoria.nombre] = categoria
        session.commit()

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if not existe:
                session.add(Producto(
                    categoria_id=categorias[cat_nombre].id,  # type: ignore[arg-type]
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_img(nombre),
                    stock=stock,
                ))
        session.commit()

    print("Seed OK -> admin / Admin1234!  |  cliente / Cliente1234!")


if __name__ == "__main__":
    seed()
