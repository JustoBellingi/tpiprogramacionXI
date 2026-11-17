from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["Productos"])

solo_admin = require_role(["admin"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def _not_found(e: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Busca en el nombre, sin distinguir mayúsculas"),
    categoria_id: int | None = Query(None),
    disponible: bool | None = Query(None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise _not_found(e) from e


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    _: UserPublic = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise _not_found(e) from e


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    _: UserPublic = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise _not_found(e) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    _: UserPublic = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise _not_found(e) from e


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    _: UserPublic = Depends(solo_admin),
    service: ProductoService = Depends(get_producto_service),
) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise _not_found(e) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
