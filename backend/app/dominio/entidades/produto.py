from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class Produto:
    id: str
    nome: str
    categoria: str
    preco: float
    descricao: Optional[str] = None
    marca: Optional[str] = None
    estoque: int = 0
    imagens: List[str] = field(default_factory=list)
    avaliacoes: List[Dict[str, Any]] = field(default_factory=list)

    def __post_init__(self):
        if self.preco < 0:
            raise ValueError("O preço do produto não pode ser negativo")
        if self.estoque < 0:
            raise ValueError("O estoque do produto não pode ser negativo")

    def atualizar_preco(self, novo_preco: float) -> None:
        if novo_preco < 0:
            raise ValueError("O novo preço não pode ser negativo")
        self.preco = round(novo_preco, 2)

    def adicionar_estoque(self, quantidade: int) -> None:
        if quantidade <= 0:
            raise ValueError("A quantidade a adicionar deve ser maior que zero")
        self.estoque += quantidade

    def remover_estoque(self, quantidade: int) -> None:
        if quantidade <= 0:
            raise ValueError("A quantidade a remover deve ser maior que zero")
        if self.estoque < quantidade:
            raise ValueError("Estoque insuficiente")
        self.estoque -= quantidade

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "categoria": self.categoria,
            "marca": self.marca,
            "preco": self.preco,
            "estoque": self.estoque,
            "imagens": self.imagens,
            "avaliacoes": self.avaliacoes
        }
