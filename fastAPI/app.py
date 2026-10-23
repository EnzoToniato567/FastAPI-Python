from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.clientes_controllers import router as clientes_router
from controllers.itenspedido_controllers import router as itens_router
from controllers.pedidos_controllers import router as pedidos_router
from controllers.pizzas_controllers import router as pizzas_router
from database import database


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    await database.connect()
    try:
        yield
    finally:
        await database.disconnect()


app = FastAPI(title="Pizzaria API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)
app.include_router(clientes_router)
app.include_router(pizzas_router)
app.include_router(pedidos_router)
app.include_router(itens_router)
