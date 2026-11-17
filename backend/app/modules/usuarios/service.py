from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_disabled(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_actual: UserPublic) -> UserPublic:
        if usuario_id == admin_actual.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés desactivar tu propia cuenta",
            )
        return self._cambiar_disabled(usuario_id, disabled=True)

    def _cambiar_disabled(self, usuario_id: int, disabled: bool) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            usuario.disabled = disabled
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)
