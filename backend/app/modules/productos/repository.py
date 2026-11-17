from collections.abc import Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        """Listado de productos ACTIVOS con filtros. Devuelve (total, página)."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        stmt = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria)) 
            .order_by(col(Producto.nombre))
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(stmt).all()
