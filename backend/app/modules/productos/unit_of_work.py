from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone productos y categorías: al crear/editar un producto hay que validar su categoría."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def _init_repositories(self, session: Session) -> None:
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
