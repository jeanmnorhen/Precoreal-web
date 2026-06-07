import pytest
from app.dominio.entidades.compra import Compra
from app.dominio.objetos_valor.item_compra import ItemCompra
from app.dominio.objetos_valor.forma_pagamento import FormaPagamento
from app.dominio.objetos_valor.entrega import Entrega

def test_criar_compra_valida():
    item1 = ItemCompra(produto_id="p1", quantidade=2, preco_unitario=10.0)
    item2 = ItemCompra(produto_id="p2", quantidade=1, preco_unitario=25.0)
    forma_pgto = FormaPagamento(tipo="pix", detalhes={})
    entrega = Entrega(status="pendente")

    compra = Compra(
        id="cmp-1",
        usuario_comprador_id="usr-1",
        loja_vendedora_id="loj-1",
        itens=[item1, item2],
        status_pedido="aguardando_pagamento",
        forma_pagamento=forma_pgto,
        dados_entrega=entrega
    )

    assert compra.preco_total == 45.0
    assert compra.status_pedido == "aguardando_pagamento"

def test_compra_sem_itens():
    forma_pgto = FormaPagamento(tipo="pix", detalhes={})
    entrega = Entrega(status="pendente")
    with pytest.raises(ValueError, match="A compra deve ter pelo menos um item"):
        Compra(
            id="cmp-1",
            usuario_comprador_id="usr-1",
            loja_vendedora_id="loj-1",
            itens=[],
            status_pedido="aguardando_pagamento",
            forma_pagamento=forma_pgto,
            dados_entrega=entrega
        )

def test_fluxo_status_compra():
    item = ItemCompra(produto_id="p1", quantidade=1, preco_unitario=10.0)
    forma_pgto = FormaPagamento(tipo="pix", detalhes={})
    entrega = Entrega(status="pendente")
    compra = Compra(
        id="cmp-1",
        usuario_comprador_id="usr-1",
        loja_vendedora_id="loj-1",
        itens=[item],
        status_pedido="aguardando_pagamento",
        forma_pagamento=forma_pgto,
        dados_entrega=entrega
    )

    compra.pagar()
    assert compra.status_pedido == "pago"

    compra.enviar()
    assert compra.status_pedido == "enviado"

    compra.entregar()
    assert compra.status_pedido == "entregue"
