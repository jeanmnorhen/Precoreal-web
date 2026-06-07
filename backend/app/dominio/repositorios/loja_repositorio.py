from abc import ABC, abstractmethod
from typing import List, Optional
from app.dominio.entidades.loja import Loja

class LojaRepositorio(ABC):
    @abstractmethod
    async def obter_por_id(self, id: str) -> Optional[Loja]:
        pass

    @abstractmethod
    async def obter_por_proprietario(self, usuario_proprietario_id: str) -> List[Loja]:
        pass

    @abstractmethod
    async def salvar(self, loja: Loja) -> None:
        pass
