from abc import ABC, abstractmethod
from typing import Optional
from app.dominio.entidades.usuario import Usuario

class UsuarioRepositorio(ABC):
    @abstractmethod
    async def obter_por_id(self, id: str) -> Optional[Usuario]:
        pass

    @abstractmethod
    async def salvar(self, usuario: Usuario) -> None:
        pass
