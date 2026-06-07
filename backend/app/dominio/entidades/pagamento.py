from dataclasses import dataclass

@dataclass
class Pagamento:
    id: str
    compra_id: str
    valor: float
    gateway: str
    status_transacao: str  # 'aprovada', 'recusada', 'pendente'
    moeda: str = 'BRL'

    def __post_init__(self):
        status_validos = {'aprovada', 'recusada', 'pendente'}
        if self.status_transacao not in status_validos:
            raise ValueError(f"Status da transação inválido: {self.status_transacao}")
        if self.valor <= 0:
            raise ValueError("O valor do pagamento deve ser positivo")

    def aprovar(self) -> None:
        self.status_transacao = 'aprovada'

    def recusar(self) -> None:
        self.status_transacao = 'recusada'

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "compra_id": self.compra_id,
            "valor": self.valor,
            "gateway": self.gateway,
            "status_transacao": self.status_transacao,
            "moeda": self.moeda
        }
