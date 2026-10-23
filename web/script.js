const url = 'http://127.0.0.1:8000';
const rotaClientes = '/clientes';
const rotaPizzas = '/pizzas';
const rotaPedidos = '/pedidos';
const rotaItens = '/itens';

const clientes = [];
const pizzas = [];
const pedidos = [];
const itens = [];

let clienteAtual;
let pizzaAtual;
let pedidoAtual;
let itemAtual;

const tabelaClientes = document.getElementById('tabela-clientes');
const nomeCliente = document.getElementById('cliente-nome');
const emailCliente = document.getElementById('cliente-email');
const telefoneCliente = document.getElementById('cliente-telefone');

const tabelaPizzas = document.getElementById('tabela-pizzas');
const nomePizza = document.getElementById('pizza-nome');
const descricaoPizza = document.getElementById('pizza-descricao');
const precoPizza = document.getElementById('pizza-preco');

const tabelaPedidos = document.getElementById('tabela-pedidos');
const clientePedido = document.getElementById('pedido-cliente');
const statusPedido = document.getElementById('pedido-status');

const tabelaItens = document.getElementById('tabela-itens');
const pedidoItem = document.getElementById('item-pedido');
const pizzaItem = document.getElementById('item-pizza');
const quantidadeItem = document.getElementById('item-quantidade');

function chamarApi(caminho, metodo = 'GET', dados) {
    const opcoes = { method: metodo };

    if (dados) {
        opcoes.headers = { 'Content-Type': 'application/json' };
        opcoes.body = JSON.stringify(dados);
    }

    return fetch(url + caminho, opcoes).then(async resposta => {
        const tipoConteudo = resposta.headers.get('content-type') || '';
        const resultado = tipoConteudo.includes('application/json')
            ? await resposta.json()
            : {};

        if (!resposta.ok) {
            const detalhe = resultado.detail;
            const mensagem = Array.isArray(detalhe)
                ? detalhe.map(erro => erro.msg).join(', ')
                : detalhe || 'Erro na API';

            throw new Error(mensagem);
        }

        return resultado;
    });
}

function mostrarErro(erro) {
    alert(erro.message || 'Problemas com a conexão da API');
}

function adicionarLinha(tabela, valores, aoEditar, aoExcluir) {
    const linha = tabela.insertRow();

    valores.forEach(valor => {
        linha.insertCell().textContent = valor === undefined || valor === null ? '' : valor;
    });

    const acoes = linha.insertCell();

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.textContent = 'Editar';
    editar.className = 'btn-primary';
    editar.onclick = aoEditar;
    acoes.appendChild(editar);

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.textContent = 'Excluir';
    excluir.className = 'btn-danger';
    excluir.onclick = aoExcluir;
    acoes.appendChild(excluir);
}

function carregarClientes() {
    chamarApi(rotaClientes + '/listar')
        .then(resultado => {
            clientes.length = 0;
            clientes.push(...resultado);
            listarClientes();
            carregarClientesPedido();
        })
        .catch(mostrarErro);
}

function listarClientes() {
    if (!tabelaClientes) return;

    tabelaClientes.replaceChildren();

    clientes.forEach(cliente => {
        adicionarLinha(tabelaClientes, [
            cliente.id,
            cliente.nome,
            cliente.email,
            cliente.telefone
        ], () => editarCliente(cliente), () => excluirCliente(cliente.id));
    });
}

function novoCliente() {
    clienteAtual = undefined;

    const titulo = document.getElementById('form-cliente-titulo');

    if (titulo) titulo.textContent = 'Cadastrar cliente';
    if (nomeCliente) nomeCliente.value = '';
    if (emailCliente) emailCliente.value = '';
    if (telefoneCliente) telefoneCliente.value = '';
}

function editarCliente(cliente) {
    clienteAtual = cliente;

    document.getElementById('form-cliente-titulo').textContent = 'Editar cliente';
    nomeCliente.value = cliente.nome;
    emailCliente.value = cliente.email;
    telefoneCliente.value = cliente.telefone || '';
}

function salvarCliente(event) {
    event.preventDefault();

    const dados = {
        nome: nomeCliente.value.trim(),
        email: emailCliente.value.trim(),
        telefone: telefoneCliente.value.trim() || null
    };

    const caminho = clienteAtual
        ? rotaClientes + '/atualizar/' + clienteAtual.id
        : rotaClientes + '/cadastrar';

    const metodo = clienteAtual ? 'PUT' : 'POST';

    chamarApi(caminho, metodo, dados)
        .then(() => {
            alert(clienteAtual ? 'Cliente atualizado!' : 'Cliente cadastrado!');
            novoCliente();
            carregarClientes();
        })
        .catch(mostrarErro);
}

function excluirCliente(id) {
    if (!confirm('Deseja excluir este cliente?')) return;

    chamarApi(rotaClientes + '/excluir/' + id, 'DELETE')
        .then(carregarClientes)
        .catch(mostrarErro);
}

function carregarPizzas() {
    chamarApi(rotaPizzas + '/listar')
        .then(resultado => {
            pizzas.length = 0;
            pizzas.push(...resultado);
            listarPizzas();
            carregarPizzasItem();
        })
        .catch(mostrarErro);
}

function listarPizzas() {
    if (!tabelaPizzas) return;

    tabelaPizzas.replaceChildren();

    pizzas.forEach(pizza => {
        adicionarLinha(tabelaPizzas, [
            pizza.id,
            pizza.nome,
            pizza.descricao,
            Number(pizza.preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
        ], () => editarPizza(pizza), () => excluirPizza(pizza.id));
    });
}

function novaPizza() {
    pizzaAtual = undefined;

    const titulo = document.getElementById('form-pizza-titulo');

    if (titulo) titulo.textContent = 'Cadastrar pizza';
    if (nomePizza) nomePizza.value = '';
    if (descricaoPizza) descricaoPizza.value = '';
    if (precoPizza) precoPizza.value = '';
}

function editarPizza(pizza) {
    pizzaAtual = pizza;

    document.getElementById('form-pizza-titulo').textContent = 'Editar pizza';
    nomePizza.value = pizza.nome;
    descricaoPizza.value = pizza.descricao || '';
    precoPizza.value = pizza.preco;
}

function salvarPizza(event) {
    event.preventDefault();

    const dados = {
        nome: nomePizza.value.trim(),
        descricao: descricaoPizza.value.trim() || null,
        preco: Number(precoPizza.value)
    };

    const caminho = pizzaAtual
        ? rotaPizzas + '/atualizar/' + pizzaAtual.id
        : rotaPizzas + '/cadastrar';

    const metodo = pizzaAtual ? 'PUT' : 'POST';

    chamarApi(caminho, metodo, dados)
        .then(() => {
            alert(pizzaAtual ? 'Pizza atualizada!' : 'Pizza cadastrada!');
            novaPizza();
            carregarPizzas();
        })
        .catch(mostrarErro);
}

function excluirPizza(id) {
    if (!confirm('Deseja excluir esta pizza?')) return;

    chamarApi(rotaPizzas + '/excluir/' + id, 'DELETE')
        .then(carregarPizzas)
        .catch(mostrarErro);
}

function carregarPedidos() {
    chamarApi(rotaPedidos + '/listar')
        .then(resultado => {
            pedidos.length = 0;
            pedidos.push(...resultado);
            listarPedidos();
            carregarPedidosItem();
        })
        .catch(mostrarErro);
}

function listarPedidos() {
    if (!tabelaPedidos) return;

    tabelaPedidos.replaceChildren();

    pedidos.forEach(pedido => {
        adicionarLinha(tabelaPedidos, [
            pedido.id,
            pedido.clienteId,
            formatarStatus(pedido.status),
            pedido.data ? new Date(pedido.data).toLocaleString('pt-BR') : ''
        ], () => editarPedido(pedido), () => excluirPedido(pedido.id));
    });
}

function formatarStatus(status) {
    return {
        PENDENTE: 'Pendente',
        EM_PREPARACAO: 'Em preparação',
        PRONTO: 'Pronto',
        ENTREGUE: 'Entregue',
        CANCELADO: 'Cancelado'
    }[status] || status;
}

function carregarClientesPedido() {
    if (!clientePedido) return;

    const valorAtual = clientePedido.value;

    clientePedido.replaceChildren(new Option('Selecione um cliente...', ''));

    clientes.forEach(cliente => {
        clientePedido.add(new Option(
            cliente.nome + ' (ID ' + cliente.id + ')',
            cliente.id
        ));
    });

    clientePedido.value = valorAtual;
}

function novoPedido() {
    pedidoAtual = undefined;

    const titulo = document.getElementById('form-pedido-titulo');

    if (titulo) titulo.textContent = 'Cadastrar pedido';
    if (clientePedido) clientePedido.value = '';
    if (statusPedido) statusPedido.value = 'PENDENTE';
}

function editarPedido(pedido) {
    pedidoAtual = pedido;

    document.getElementById('form-pedido-titulo').textContent = 'Editar pedido';
    clientePedido.value = pedido.clienteId;
    statusPedido.value = pedido.status;
}

function salvarPedido(event) {
    event.preventDefault();

    const dados = {
        clienteId: Number(clientePedido.value),
        status: statusPedido.value
    };

    const caminho = pedidoAtual
        ? rotaPedidos + '/atualizar/' + pedidoAtual.id
        : rotaPedidos + '/cadastrar';

    const metodo = pedidoAtual ? 'PUT' : 'POST';

    chamarApi(caminho, metodo, dados)
        .then(() => {
            alert(pedidoAtual ? 'Pedido atualizado!' : 'Pedido cadastrado!');
            novoPedido();
            carregarPedidos();
        })
        .catch(mostrarErro);
}

function excluirPedido(id) {
    if (!confirm('Deseja excluir este pedido?')) return;

    chamarApi(rotaPedidos + '/excluir/' + id, 'DELETE')
        .then(carregarPedidos)
        .catch(mostrarErro);
}

function carregarPedidosItem() {
    if (!pedidoItem) return;

    const valorAtual = pedidoItem.value;

    pedidoItem.replaceChildren(new Option('Selecione um pedido...', ''));

    pedidos.forEach(pedido => {
        pedidoItem.add(new Option(
            'Pedido #' + pedido.id + ' — cliente #' + pedido.clienteId + ' (' + formatarStatus(pedido.status) + ')',
            pedido.id
        ));
    });

    pedidoItem.value = valorAtual;
}

function carregarPizzasItem() {
    if (!pizzaItem) return;

    const valorAtual = pizzaItem.value;

    pizzaItem.replaceChildren(new Option('Selecione uma pizza...', ''));

    pizzas.forEach(pizza => {
        pizzaItem.add(new Option(
            pizza.nome + ' (ID ' + pizza.id + ')',
            pizza.id
        ));
    });

    pizzaItem.value = valorAtual;
}

function carregarItens() {
    chamarApi(rotaItens + '/listar')
        .then(resultado => {
            itens.length = 0;
            itens.push(...resultado);
            listarItens();
        })
        .catch(mostrarErro);
}

function listarItens() {
    if (!tabelaItens) return;

    tabelaItens.replaceChildren();

    itens.forEach(item => {
        adicionarLinha(tabelaItens, [
            item.id,
            item.pedidoId,
            item.pizzaId,
            item.quantidade
        ], () => editarItem(item), () => excluirItem(item.id));
    });
}

function novoItem() {
    itemAtual = undefined;

    const titulo = document.getElementById('form-item-titulo');

    if (titulo) titulo.textContent = 'Cadastrar item';
    if (pedidoItem) pedidoItem.value = '';
    if (pizzaItem) pizzaItem.value = '';
    if (quantidadeItem) quantidadeItem.value = 1;
}

function editarItem(item) {
    itemAtual = item;

    document.getElementById('form-item-titulo').textContent = 'Editar item';
    pedidoItem.value = item.pedidoId;
    pizzaItem.value = item.pizzaId;
    quantidadeItem.value = item.quantidade;
}

function salvarItem(event) {
    event.preventDefault();

    const dados = {
        pedidoId: Number(pedidoItem.value),
        pizzaId: Number(pizzaItem.value),
        quantidade: Number(quantidadeItem.value)
    };

    const caminho = itemAtual
        ? rotaItens + '/atualizar/' + itemAtual.id
        : rotaItens + '/cadastrar';

    const metodo = itemAtual ? 'PUT' : 'POST';

    chamarApi(caminho, metodo, dados)
        .then(() => {
            alert(itemAtual ? 'Item atualizado!' : 'Item cadastrado!');
            novoItem();
            carregarItens();
        })
        .catch(mostrarErro);
}

function excluirItem(id) {
    if (!confirm('Deseja excluir este item?')) return;

    chamarApi(rotaItens + '/excluir/' + id, 'DELETE')
        .then(carregarItens)
        .catch(mostrarErro);
}

function carregarResumo() {
    Promise.all([
        chamarApi(rotaClientes + '/listar'),
        chamarApi(rotaPizzas + '/listar'),
        chamarApi(rotaPedidos + '/listar'),
        chamarApi(rotaItens + '/listar')
    ]).then(resultados => {
        document.getElementById('total-clientes').textContent = resultados[0].length;
        document.getElementById('total-pizzas').textContent = resultados[1].length;
        document.getElementById('total-pedidos').textContent = resultados[2].length;
        document.getElementById('total-itens').textContent = resultados[3].length;
    }).catch(mostrarErro);
}

if (tabelaClientes) carregarClientes();

if (tabelaPizzas) carregarPizzas();

if (tabelaPedidos) {
    carregarPedidos();
    carregarClientes();
}

if (tabelaItens) {
    carregarItens();
    carregarPedidos();
    carregarPizzas();
}

if (document.getElementById('total-clientes')) 

carregarResumo();