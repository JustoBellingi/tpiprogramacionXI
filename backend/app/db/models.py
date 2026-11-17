"""Importa todos los modelos de tabla para registrarlos en SQLModel.metadata.

Las relaciones usan nombres como texto ("Producto", "Pedido"...): SQLAlchemy
las resuelve cuando todas las clases ya fueron importadas. Por eso main.py y
seed.py importan este módulo antes de crear las tablas.
"""

from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

__all__ = ["Usuario", "Categoria", "Producto", "Pedido", "DetallePedido"]
