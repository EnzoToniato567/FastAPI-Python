from enum import Enum

from pydantic import BaseModel


class ClienteInput(BaseModel):
    nome: str
    email: str
    telefone: str | None = None


class PizzaInput(BaseModel):
    nome: str
    descricao: str | None = None
    preco: float


class StatusPedido(str, Enum):
    PENDENTE = "PENDENTE"
    EM_PREPARACAO = "EM_PREPARACAO"
    PRONTO = "PRONTO"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"


class PedidoInput(BaseModel):
    status: StatusPedido = StatusPedido.PENDENTE
    clienteId: int


class ItemPedidoInput(BaseModel):
    quantidade: int
    pedidoId: int
    pizzaId: int
