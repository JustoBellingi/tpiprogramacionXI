"""Carga inicial idempotente: se puede ejecutar varias veces sin duplicar datos.

Uso (desde la carpeta backend/):  python -m app.db.seed
"""

from sqlmodel import Session, select

import app.db.models  # noqa: F401  (registra todos los modelos)
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
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas, cervezas y café"},
    {"nombre": "Entradas", "descripcion": "Para picar y compartir"},
    {"nombre": "Postres", "descripcion": "El final dulce"},
]


def _img(archivo: str) -> str:
    """Las fotos viven en frontend/public/productos/ y Vite las sirve en /productos/..."""
    return f"/productos/{archivo}.jpg"


# (categoría, nombre, descripción, precio, stock, archivo de la foto)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20, "pizza-muzzarella"),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate, albahaca y anchoas", 10800, 15, "pizza-napolitana"),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla, muzzarella y orégano", 10500, 12, "pizza-fugazzeta"),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8200, 25, "hamburguesa-clasica"),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne y doble cheddar", 11200, 18, "hamburguesa-doble-cheddar"),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas, palta y tomate", 8900, 10, "hamburguesa-veggie"),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1500, 60, "empanada-carne"),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60, "empanada-jamon-queso"),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso", 1400, 40, "empanada-humita"),
    ("Bebidas", "Gaseosa 1.5 L", "Línea cola", 3200, 30, "gaseosa"),
    ("Bebidas", "Agua sin gas 500 ml", "Agua mineral", 1500, 50, "agua-sin-gas"),
    ("Bebidas", "Cerveza artesanal 500 ml", "Golden Ale", 4200, 24, "cerveza-artesanal"),
    ("Bebidas", "Café", "Café negro recién hecho", 2200, 40, "cafe"),
    ("Entradas", "Bastones de muzzarella", "Rebozados, con salsa de tomate", 6800, 20, "bastones-muzzarella"),
    ("Entradas", "Rabas", "Anillos de calamar fritos con limón", 9800, 15, "rabas"),
    ("Postres", "Flan con dulce de leche y crema", "Flan casero con dulce de leche y crema", 4500, 20, "flan-dulce-crema"),
    ("Postres", "Tiramisú", "Vainillas, café, mascarpone y cacao", 5200, 15, "tiramisu"),
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

        for cat_nombre, nombre, descripcion, precio, stock, foto in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if not existe:
                session.add(Producto(
                    categoria_id=categorias[cat_nombre].id,  # type: ignore[arg-type]
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_img(foto),
                    stock=stock,
                ))
            elif not existe.imagen_url or existe.imagen_url.startswith("https://placehold.co"):
                # Bases creadas con la versión anterior del seed: cambia la imagen de ejemplo
                # por la foto real, sin tocar stock ni precio (sigue siendo idempotente).
                existe.imagen_url = _img(foto)
                session.add(existe)
        session.commit()

    print("Seed OK -> admin / Admin1234!  |  cliente / Cliente1234!")


if __name__ == "__main__":
    seed()
