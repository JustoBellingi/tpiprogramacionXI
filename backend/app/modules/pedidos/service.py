from datetime import datetime, time

from app.core.database import utc_now
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""


class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado o dado de baja")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(ReglaDeNegocio):  # 400
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):  # 400
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):  # 400
    def __init__(self, nombre: str, disponible: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {disponible} y pediste {pedido}")


class TransicionInvalida(ReglaDeNegocio):  # 400
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),  # terminal
    EstadoPedido.CANCELADO: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario.id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario: UserPublic,
        estado: EstadoPedido | None,
        skip: int,
        limit: int,
        solo_propios: bool = False,
    ) -> PedidosPaginados:
        estado_str = estado.value if estado else None
        with self.uow as uow:
            if usuario.role == "admin" and not solo_propios:
                total, pedidos = uow.pedidos.list_all(estado_str, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, estado_str, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)
    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(pedido.estado, EstadoPedido.CANCELADO.value)
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_hoy = datetime.combine(utc_now().date(), time.min)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(EstadoPedido.PENDIENTE.value),
                en_preparacion=uow.pedidos.count_by_estado(EstadoPedido.EN_PREPARACION.value),
                entregados=uow.pedidos.count_by_estado(EstadoPedido.ENTREGADO.value),
                cancelados=uow.pedidos.count_by_estado(EstadoPedido.CANCELADO.value),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2),
            )

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        """Valida contra el mapa ANTES de modificar; si cancela, restituye el stock (RN-03)."""
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual.value, nuevo.value)

        if nuevo == EstadoPedido.CANCELADO:
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.session.add(producto)

        pedido.estado = nuevo.value
        pedido.updated_at = utc_now()
        uow.session.add(pedido)
