from abc import ABC, abstractmethod
from typing import List, Optional
from app.dominio.entidades.produto import Produto

class ProdutoRepositorio(ABC):
    @abstractmethod
    async def obter_por_id(self, id: str) -> Optional[Produto]:
        pass

    @abstractmethod
    async def buscar_todos(self) -> List[Produto]:
        pass

    @abstractmethod
    async def buscar_por_categoria(self, categoria: str) -> List[Produto]:
        pass

    @abstractmethod
    async def salvar(self, produto: Produto) -> None:
        pass
