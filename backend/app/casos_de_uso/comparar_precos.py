from typing import List, Dict, Any
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio
from app.dominio.repositorios.loja_repositorio import LojaRepositorio

class CompararPrecos:
    def __init__(
        self,
        anuncio_repo: AnuncioRepositorio,
        produto_repo: ProdutoRepositorio,
        loja_repo: LojaRepositorio
    ):
        self.anuncio_repo = anuncio_repo
        self.produto_repo = produto_repo
        self.loja_repo = loja_repo

    async def executar(self, termo_busca: str) -> List[Dict[str, Any]]:
        """
        Busca anúncios ativos que coincidam com o termo de busca (no título do anúncio,
        nome do produto ou descrição) e os retorna ordenados pelo preço do produto.
        """
        anuncios = await self.anuncio_repo.buscar_ativos()
        termo = termo_busca.lower()
        
        resultados = []
        for anuncio in anuncios:
            produto = await self.produto_repo.obter_por_id(anuncio.produto_id)
            if not produto:
                continue
                
            corresponde = (
                termo in anuncio.titulo.lower() or 
                (anuncio.descricao and termo in anuncio.descricao.lower()) or
                termo in produto.nome.lower()
            )
            
            if corresponde:
                loja = await self.loja_repo.obter_por_id(anuncio.loja_id)
                resultados.append({
                    "anuncio": anuncio.para_dicionario(),
                    "produto": produto.para_dicionario(),
                    "loja": loja.para_dicionario() if loja else None,
                    "preco": produto.preco
                })
                
        # Ordenar por preço do produto (menor para maior)
        resultados.sort(key=lambda x: x["preco"])
        return resultados
