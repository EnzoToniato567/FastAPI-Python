import asyncio

from prisma import Prisma


async def main() -> None:
    database = Prisma()
    await database.connect()

    try:
        async with database.tx() as transaction:
            await transaction.itempedido.delete_many()
            await transaction.pedido.delete_many()
            await transaction.pizza.delete_many()
            await transaction.cliente.delete_many()

            clientes = []
            for nome, email, telefone in [
                ("Ana Silva", "ana@example.com", "11999999999"),
                ("Bruno Souza", "bruno@example.com", "11888888888"),
                ("Carla Oliveira", "carla@example.com", "11777777777"),
                ("Daniel Costa", "daniel@example.com", "11666666666"),
                ("Eduarda Lima", "eduarda@example.com", "11555555555"),
            ]:
                cliente = await transaction.cliente.create(
                    data={"nome": nome, "email": email, "telefone": telefone}
                )
                clientes.append(cliente)
            print("Clientes de teste cadastrados.")

            pizzas = []
            for nome, descricao, preco in [
                ("Margherita", "Molho de tomate, queijo e manjericão.", 35.50),
                ("Calabresa", "Calabresa, cebola e queijo.", 39.90),
                ("Portuguesa", "Presunto, ovo, cebola e queijo.", 42.00),
                ("Quatro Queijos", "Muçarela, provolone, parmesão e gorgonzola.", 44.90),
                ("Frango com Catupiry", "Frango desfiado e Catupiry.", 43.50),
            ]:
                pizza = await transaction.pizza.create(
                    data={"nome": nome, "descricao": descricao, "preco": preco}
                )
                pizzas.append(pizza)
            print("Pizzas de teste cadastradas.")

            pedidos = []
            status_pedidos = [
                "PENDENTE",
                "EM_PREPARACAO",
                "PRONTO",
                "ENTREGUE",
                "CANCELADO",
            ]
            for cliente, status in zip(clientes, status_pedidos):
                pedido = await transaction.pedido.create(
                    data={
                        "status": status,
                        "cliente": {"connect": {"id": cliente.id}},
                    }
                )
                pedidos.append(pedido)
            print("Pedidos de teste cadastrados.")

            for pedido, pizza in zip(pedidos, pizzas):
                await transaction.itempedido.create(
                    data={
                        "quantidade": 1,
                        "pedido": {"connect": {"id": pedido.id}},
                        "pizza": {"connect": {"id": pizza.id}},
                    }
                )
            print("Itens de pedido de teste cadastrados.")
    finally:
        await database.disconnect()


if __name__ == "__main__":
    asyncio.run(main())