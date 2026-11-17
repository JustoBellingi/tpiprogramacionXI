from collections.abc import Sequence
from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        """Pedidos de un usuario (vista del cliente)."""
        return self._listar(usuario_id, estado, skip, limit)

    def list_all(
        self, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        """Todos los pedidos (vista del admin)."""
        return self._listar(None, estado, skip, limit)

    def count_by_estado(self, estado: str) -> int:
        stmt = select(func.count()).select_from(Pedido).where(col(Pedido.estado) == estado)
        return self.session.exec(stmt).one()

    def count_desde(self, desde: datetime) -> int:
        stmt = select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= desde)
        return self.session.exec(stmt).one()

    def sum_total_by_estado(self, estado: str) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0)).where(col(Pedido.estado) == estado)
        return float(self.session.exec(stmt).one())

    def _listar(
        self, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            filtros.append(col(Pedido.estado) == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        stmt = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(stmt).all()
