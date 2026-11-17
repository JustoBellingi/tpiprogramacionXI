from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    - __enter__ abre la sesión y crea los repositorios (que comparten esa sesión).
    - __exit__ hace commit si no hubo excepción, o rollback si la hubo, y siempre cierra.

    Así, todo lo que pasa dentro de un `with uow:` es UNA transacción:
    o se guarda todo, o no se guarda nada.
    """

    session: Session

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
    def _init_repositories(self, session: Session) -> None:
        """Cada Unit of Work concreto crea aquí sus repositorios."""
        raise NotImplementedError
