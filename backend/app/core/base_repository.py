from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes sobre una tabla. Sin reglas de negocio y sin commit.

    `add` y `delete` hacen flush (envían el SQL dentro de la transacción abierta)
    para obtener el id generado, pero el commit lo decide el Unit of Work.
    """

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
