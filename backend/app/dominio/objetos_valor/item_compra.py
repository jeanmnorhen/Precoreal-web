from dataclasses import dataclass

@dataclass(frozen=True)
class ItemCompra:
    produto_id: str
    quantidade: int
    preco_unitario: float

    def __post_init__(self):
        if self.quantidade <= 0:
            raise ValueError("A quantidade deve ser maior que zero")
        if self.preco_unitario < 0:
            raise ValueError("O preço unitário não pode ser negativo")

    @property
    def preco_total(self) -> float:
        return round(self.quantidade * self.preco_unitario, 2)

    def para_dicionario(self) -> dict:
        return {
            "produto_id": self.produto_id,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
            "preco_total": self.preco_total
        }
