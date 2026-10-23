from fastapi import APIRouter, HTTPException

from database import database
from schema import PedidoInput


router = APIRouter(prefix="/pedidos")


async def buscar_id(pedido_id: int):
    pedido = await database.pedido.find_unique(where={"id": pedido_id})
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido


async def verificar_cliente(cliente_id: int):
    cliente = await database.cliente.find_unique(where={"id": cliente_id})
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")


def dados_pedido(pedido: PedidoInput) -> dict:
    return {
        "status": pedido.status.value,
        "cliente": {"connect": {"id": pedido.clienteId}},
    }


@router.get("/listar")
async def listar_pedidos():
    return await database.pedido.find_many(order={"id": "asc"})


@router.get("/buscar/{pedido_id}")
async def buscar_pedido(pedido_id: int):
    return await buscar_id(pedido_id)


@router.post("/cadastrar", status_code=201)
async def cadastrar_pedido(pedido: PedidoInput):
    await verificar_cliente(pedido.clienteId)
    return await database.pedido.create(data=dados_pedido(pedido))


@router.put("/atualizar/{pedido_id}")
async def atualizar_pedido(pedido_id: int, pedido: PedidoInput):
    await buscar_id(pedido_id)
    await verificar_cliente(pedido.clienteId)
    return await database.pedido.update(
        where={"id": pedido_id},
        data=dados_pedido(pedido),
    )


@router.delete("/excluir/{pedido_id}")
async def excluir_pedido(pedido_id: int):
    await buscar_id(pedido_id)
    return await database.pedido.delete(where={"id": pedido_id})
