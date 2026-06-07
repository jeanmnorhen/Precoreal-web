from abc import ABC, abstractmethod
from typing import List, Optional
from app.dominio.entidades.compra import Compra

class CompraRepositorio(ABC):
    @abstractmethod
    async def obter_por_id(self, id: str) -> Optional[Compra]:
        pass

    @abstractmethod
    async def obter_por_comprador(self, usuario_comprador_id: str) -> List[Compra]:
        pass

    @abstractmethod
    async def salvar(self, compra: Compra) -> None:
        pass
