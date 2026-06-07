from dataclasses import dataclass, field
from typing import List, Optional
from app.dominio.objetos_valor.item_compra import ItemCompra
from app.dominio.objetos_valor.forma_pagamento import FormaPagamento
from app.dominio.objetos_valor.entrega import Entrega

@dataclass
class Compra:
    id: str
    usuario_comprador_id: str
    loja_vendedora_id: str
    itens: List[ItemCompra]
    status_pedido: str  # 'aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado'
    forma_pagamento: FormaPagamento
    dados_entrega: Entrega
    preco_total: float = 0.0

    def __post_init__(self):
        status_validos = {'aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado'}
        if self.status_pedido not in status_validos:
            raise ValueError(f"Status do pedido inválido: {self.status_pedido}")
        if not self.itens:
            raise ValueError("A compra deve ter pelo menos um item")
        self.preco_total = round(sum(item.preco_total for item in self.itens), 2)

    def pagar(self) -> None:
        if self.status_pedido != 'aguardando_pagamento':
            raise ValueError("Apenas pedidos aguardando pagamento podem ser pagos")
        self.status_pedido = 'pago'

    def enviar(self) -> None:
        if self.status_pedido != 'pago':
            raise ValueError("Apenas pedidos pagos podem ser enviados")
        self.status_pedido = 'enviado'

    def entregar(self) -> None:
        if self.status_pedido != 'enviado':
            raise ValueError("Apenas pedidos enviados podem ser entregues")
        self.status_pedido = 'entregue'

    def cancelar(self) -> None:
        if self.status_pedido in {'entregue', 'cancelado'}:
            raise ValueError(f"Não é possível cancelar um pedido com status: {self.status_pedido}")
        self.status_pedido = 'cancelado'

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "usuario_comprador_id": self.usuario_comprador_id,
            "loja_vendedora_id": self.loja_vendedora_id,
            "itens": [item.para_dicionario() for item in self.itens],
            "preco_total": self.preco_total,
            "status_pedido": self.status_pedido,
            "forma_pagamento": self.forma_pagamento.para_dicionario(),
            "dados_entrega": self.dados_entrega.para_dicionario()
        }
