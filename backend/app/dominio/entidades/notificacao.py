from dataclasses import dataclass
from datetime import datetime

@dataclass
class Notificacao:
    id: str
    usuario_destinatario_id: str
    tipo: str  # 'promocao', 'pedido', 'mensagem'
    mensagem: str
    status_leitura: str = 'nao_lida'  # 'lida', 'nao_lida'
    data_envio: datetime = None

    def __post_init__(self):
        tipos_validos = {'promocao', 'pedido', 'mensagem'}
        if self.tipo not in tipos_validos:
            raise ValueError(f"Tipo de notificação inválido: {self.tipo}")
        status_validos = {'lida', 'nao_lida'}
        if self.status_leitura not in status_validos:
            raise ValueError(f"Status de leitura inválido: {self.status_leitura}")
        if self.data_envio is None:
            self.data_envio = datetime.utcnow()

    def marcar_como_lida(self) -> None:
        self.status_leitura = 'lida'

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "usuario_destinatario_id": self.usuario_destinatario_id,
            "tipo": self.tipo,
            "mensagem": self.mensagem,
            "status_leitura": self.status_leitura,
            "data_envio": self.data_envio.isoformat()
        }
