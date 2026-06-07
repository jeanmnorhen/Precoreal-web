from typing import List, Optional
from app.dominio.repositorios.usuario_repositorio import UsuarioRepositorio
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio
from app.dominio.repositorios.loja_repositorio import LojaRepositorio
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio
from app.dominio.repositorios.compra_repositorio import CompraRepositorio
from app.dominio.entidades.usuario import Usuario
from app.dominio.entidades.produto import Produto
from app.dominio.entidades.loja import Loja
from app.dominio.entidades.anuncio import Anuncio
from app.dominio.entidades.compra import Compra

class MemoriaUsuarioRepositorio(UsuarioRepositorio):
    def __init__(self):
        self.usuarios = {}

    async def obter_por_id(self, id: str) -> Optional[Usuario]:
        return self.usuarios.get(id)

    async def salvar(self, usuario: Usuario) -> None:
        self.usuarios[usuario.id] = usuario

class MemoriaProdutoRepositorio(ProdutoRepositorio):
    def __init__(self):
        self.produtos = {}

    async def obter_por_id(self, id: str) -> Optional[Produto]:
        return self.produtos.get(id)

    async def buscar_todos(self) -> List[Produto]:
        return list(self.produtos.values())

    async def buscar_por_categoria(self, categoria: str) -> List[Produto]:
        return [p for p in self.produtos.values() if p.categoria == categoria]

    async def salvar(self, produto: Produto) -> None:
        self.produtos[produto.id] = produto

class MemoriaLojaRepositorio(LojaRepositorio):
    def __init__(self):
        self.lojas = {}

    async def obter_por_id(self, id: str) -> Optional[Loja]:
        return self.lojas.get(id)

    async def obter_por_proprietario(self, usuario_proprietario_id: str) -> List[Loja]:
        return [l for l in self.lojas.values() if l.usuario_proprietario_id == usuario_proprietario_id]

    async def salvar(self, loja: Loja) -> None:
        self.lojas[loja.id] = loja

class MemoriaAnuncioRepositorio(AnuncioRepositorio):
    def __init__(self):
        self.anuncios = {}

    async def obter_por_id(self, id: str) -> Optional[Anuncio]:
        return self.anuncios.get(id)

    async def buscar_ativos(self) -> List[Anuncio]:
        return [a for a in self.anuncios.values() if a.status == "ativo"]

    async def buscar_por_loja(self, loja_id: str) -> List[Anuncio]:
        return [a for a in self.anuncios.values() if a.loja_id == loja_id]

    async def salvar(self, anuncio: Anuncio) -> None:
        self.anuncios[anuncio.id] = anuncio

class MemoriaCompraRepositorio(CompraRepositorio):
    def __init__(self):
        self.compras = {}

    async def obter_por_id(self, id: str) -> Optional[Compra]:
        return self.compras.get(id)

    async def obter_por_comprador(self, usuario_comprador_id: str) -> List[Compra]:
        return [c for c in self.compras.values() if c.usuario_comprador_id == usuario_comprador_id]

    async def salvar(self, compra: Compra) -> None:
        self.compras[compra.id] = compra
