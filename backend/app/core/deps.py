from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(token: str | None = Depends(cookie_scheme)) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
    )
    if not token:
        raise credentials_error
    username = decode_access_token(token)
    if username is None:
        raise credentials_error
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credentials_error
        return UserPublic.model_validate(usuario)


def get_current_active_user(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    """Rechaza a los usuarios dados de baja (disabled = true)."""
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return user


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Fábrica de dependencias: require_role(["admin"]) deja pasar solo a esos roles."""

    def checker(user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para esta operación",
            )
        return user

    return checker
