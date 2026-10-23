from fastapi import APIRouter, HTTPException

from database import database
from schema import ClienteInput


router = APIRouter(prefix="/clientes")


async def buscar_id(cliente_id: int):
    cliente = await database.cliente.find_unique(where={"id": cliente_id})
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.get("/listar")
async def listar_clientes():
    return await database.cliente.find_many(order={"id": "asc"})


@router.get("/buscar/{cliente_id}")
async def buscar_cliente(cliente_id: int):
    return await buscar_id(cliente_id)


@router.post("/cadastrar", status_code=201)
async def cadastrar_cliente(cliente: ClienteInput):
    return await database.cliente.create(data=cliente.model_dump())


@router.put("/atualizar/{cliente_id}")
async def atualizar_cliente(cliente_id: int, cliente: ClienteInput):
    await buscar_id(cliente_id)
    return await database.cliente.update(
        where={"id": cliente_id},
        data=cliente.model_dump(),
    )


@router.delete("/excluir/{cliente_id}")
async def excluir_cliente(cliente_id: int):
    await buscar_id(cliente_id)
    return await database.cliente.delete(where={"id": cliente_id})
