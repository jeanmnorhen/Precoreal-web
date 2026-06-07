from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from app.dominio.objetos_valor.endereco import Endereco

@dataclass
class Loja:
    id: str
    nome: str
    usuario_proprietario_id: str
    descricao: Optional[str] = None
    endereco: Optional[Endereco] = None
    tabloide_ofertas: List[Dict[str, Any]] = field(default_factory=list) # tabloide de ofertas

    def para_dicionario(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "endereco": self.endereco.para_dicionario() if self.endereco else None,
            "usuario_proprietario_id": self.usuario_proprietario_id,
            "tabloide_ofertas": self.tabloide_ofertas
        }
