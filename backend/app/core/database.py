from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas de todos los modelos registrados en SQLModel.metadata.

    Los modelos se registran al importarse; por eso main.py y seed.py importan
    app.db.models antes de llamar a esta función.
    """
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el Unit of Work.

    expire_on_commit=False evita que los objetos queden "vencidos" después del commit.
    """
    return Session(engine, expire_on_commit=False)


def utc_now() -> datetime:
    """Fecha y hora actual en UTC, sin zona horaria (se guarda igual en SQLite y PostgreSQL)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
