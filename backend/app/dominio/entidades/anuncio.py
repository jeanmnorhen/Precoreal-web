from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Anuncio:
    id: str
    loja_id: str
    produto_id: str
    titulo: str
    raio_alcance: float  # em km
    custo_creditos: float
    data_inicio: datetime
    data_fim: datetime
    status: str  # 'ativo' | 'pausado' | 'expirado'
    descricao: Optional[str] = None

    def __post_init__(self):
        status_validos = {'ativo', 'pausado', 'expirado'}
        if self.status not in status_validos:
            raise ValueError(f"Status de anúncio inválido: {self.status}")
        if self.raio_alcance <= 0:
            raise ValueError("O raio de alcance deve ser maior que zero")
        if self.custo_creditos < 0:
            raise ValueError("O custo de créditos não pode ser negativo")
        if self.data_fim <= self.data_inicio:
            raise ValueError("A data de fim deve ser posterior à data de início")

    def esta_ativo_no_momento(self, agora: datetime) -> bool:
        return self.status == 'ativo' and self.data_inicio <= agora <= self.data_fim

    def pausar(self) -> None:
        self.status = 'pausado'

    def ativar(self) -> None:
        self.status = 'ativo'

    def expirar(self) -> None:
        self.status = 'expirado'

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "loja_id": self.loja_id,
            "produto_id": self.produto_id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "raio_alcance": self.raio_alcance,
            "custo_creditos": self.custo_creditos,
            "data_inicio": self.data_inicio.isoformat(),
            "data_fim": self.data_fim.isoformat(),
            "status": self.status
        }
