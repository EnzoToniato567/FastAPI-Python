from fastapi import APIRouter, HTTPException

from database import database
from schema import PizzaInput


router = APIRouter(prefix="/pizzas")


async def buscar_id(pizza_id: int):
    pizza = await database.pizza.find_unique(where={"id": pizza_id})
    if pizza is None:
        raise HTTPException(status_code=404, detail="Pizza não encontrada")
    return pizza


@router.get("/listar")
async def listar_pizzas():
    return await database.pizza.find_many(order={"id": "asc"})


@router.get("/buscar/{pizza_id}")
async def buscar_pizza(pizza_id: int):
    return await buscar_id(pizza_id)


@router.post("/cadastrar", status_code=201)
async def cadastrar_pizza(pizza: PizzaInput):
    return await database.pizza.create(data=pizza.model_dump())


@router.put("/atualizar/{pizza_id}")
async def atualizar_pizza(pizza_id: int, pizza: PizzaInput):
    await buscar_id(pizza_id)
    return await database.pizza.update(
        where={"id": pizza_id},
        data=pizza.model_dump(),
    )


@router.delete("/excluir/{pizza_id}")
async def excluir_pizza(pizza_id: int):
    await buscar_id(pizza_id)
    return await database.pizza.delete(where={"id": pizza_id})
