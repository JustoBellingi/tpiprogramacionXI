from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos sobre LA MISMA sesión.

    Por eso crear el pedido, descontar el stock y crear las líneas
    es una sola transacción: commit de todo o rollback de todo.
    """

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _init_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)
