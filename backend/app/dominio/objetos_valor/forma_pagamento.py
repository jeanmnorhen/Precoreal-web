from dataclasses import dataclass
from typing import Dict, Any

@dataclass(frozen=True)
class FormaPagamento:
    tipo: str  # 'cartao_credito', 'boleto_bancario', 'pix'
    detalhes: Dict[str, Any]

    def __post_init__(self):
        tipos_validos = {'cartao_credito', 'boleto_bancario', 'pix'}
        if self.tipo not in tipos_validos:
            raise ValueError(f"Tipo de pagamento inválido: {self.tipo}")

    def para_dicionario(self) -> dict:
        return {
            "tipo": self.tipo,
            "detalhes": self.detalhes
        }
