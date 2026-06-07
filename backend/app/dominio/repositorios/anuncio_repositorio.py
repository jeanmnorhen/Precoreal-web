from abc import ABC, abstractmethod
from typing import List, Optional
from app.dominio.entidades.anuncio import Anuncio

class AnuncioRepositorio(ABC):
    @abstractmethod
    async def obter_por_id(self, id: str) -> Optional[Anuncio]:
        pass

    @abstractmethod
    async def buscar_ativos(self) -> List[Anuncio]:
        pass

    @abstractmethod
    async def buscar_por_loja(self, loja_id: str) -> List[Anuncio]:
        pass

    @abstractmethod
    async def salvar(self, anuncio: Anuncio) -> None:
        pass
