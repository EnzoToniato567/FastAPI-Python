from fastapi import APIRouter, HTTPException

from database import database
from schema import ItemPedidoInput


router = APIRouter(prefix="/itens")


async def buscar_id(item_id: int):
    item = await database.itempedido.find_unique(where={"id": item_id})
    if item is None:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item


def dados_item(item: ItemPedidoInput) -> dict:
    return {
        "quantidade": item.quantidade,
        "pedido": {"connect": {"id": item.pedidoId}},
        "pizza": {"connect": {"id": item.pizzaId}},
    }


@router.get("/listar")
async def listar_itens():
    return await database.itempedido.find_many(order={"id": "asc"})


@router.get("/buscar/{item_id}")
async def buscar_item(item_id: int):
    return await buscar_id(item_id)


@router.post("/cadastrar", status_code=201)
async def cadastrar_item(item: ItemPedidoInput):
    return await database.itempedido.create(data=dados_item(item))


@router.put("/atualizar/{item_id}")
async def atualizar_item(item_id: int, item: ItemPedidoInput):
    await buscar_id(item_id)
    return await database.itempedido.update(
        where={"id": item_id},
        data=dados_item(item),
    )


@router.delete("/excluir/{item_id}")
async def excluir_item(item_id: int):
    await buscar_id(item_id)
    return await database.itempedido.delete(where={"id": item_id})
