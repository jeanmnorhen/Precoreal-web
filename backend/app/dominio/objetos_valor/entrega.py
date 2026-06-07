from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass(frozen=True)
class Entrega:
    status: str  # 'pendente', 'enviado', 'entregue'
    data_entrega: Optional[datetime] = None

    def __post_init__(self):
        status_validos = {'pendente', 'enviado', 'entregue'}
        if self.status not in status_validos:
            raise ValueError(f"Status de entrega inválido: {self.status}")

    def para_dicionario(self) -> dict:
        return {
            "status": self.status,
            "data_entrega": self.data_entrega.isoformat() if self.data_entrega else None
        }
