from dataclasses import dataclass
from typing import Optional
from app.dominio.objetos_valor.endereco import Endereco

@dataclass
class Usuario:
    id: str
    nome: str
    email: str
    tipo: str  # 'consumidor' | 'lojista'
    saldo_creditos: float = 0.0
    quantidade_diamantes: int = 0
    endereco: Optional[Endereco] = None

    def __post_init__(self):
        tipos_validos = {'consumidor', 'lojista'}
        if self.tipo not in tipos_validos:
            raise ValueError(f"Tipo de usuário inválido: {self.tipo}")
        if self.saldo_creditos < 0:
            raise ValueError("O saldo de créditos não pode ser negativo")
        if self.quantidade_diamantes < 0:
            raise ValueError("A quantidade de diamantes não pode ser negativa")

    def adicionar_creditos(self, valor: float) -> None:
        if valor <= 0:
            raise ValueError("O valor dos créditos a adicionar deve ser positivo")
        self.saldo_creditos = round(self.saldo_creditos + valor, 2)

    def deduzir_creditos(self, valor: float) -> None:
        if valor <= 0:
            raise ValueError("O valor dos créditos a deduzir deve ser positivo")
        if self.saldo_creditos < valor:
            raise ValueError("Saldo de créditos insuficiente")
        self.saldo_creditos = round(self.saldo_creditos - valor, 2)

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "tipo": self.tipo,
            "saldo_creditos": self.saldo_creditos,
            "quantidade_diamantes": self.quantidade_diamantes,
            "endereco": self.endereco.para_dicionario() if self.endereco else None
        }
