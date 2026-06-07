from typing import List, Dict, Any
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio
from app.dominio.repositorios.loja_repositorio import LojaRepositorio
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio
from app.dominio.servicos.geolocalizacao import calcular_distancia_haversine

class ObterFeedGeolocalizado:
    def __init__(
        self,
        anuncio_repo: AnuncioRepositorio,
        loja_repo: LojaRepositorio,
        produto_repo: ProdutoRepositorio
    ):
        self.anuncio_repo = anuncio_repo
        self.loja_repo = loja_repo
        self.produto_repo = produto_repo

    async def executar(self, latitude_usuario: float, longitude_usuario: float) -> List[Dict[str, Any]]:
        """
        Retorna uma lista de anúncios ativos cujas lojas estão dentro do raio de alcance do anúncio
        em relação à localização do usuário. A lista é ordenada por distância crescente.
        """
        anuncios = await self.anuncio_repo.buscar_ativos()
        
        feed = []
        for anuncio in anuncios:
            loja = await self.loja_repo.obter_por_id(anuncio.loja_id)
            if not loja or not loja.endereco:
                continue
                
            distancia = calcular_distancia_haversine(
                latitude_usuario,
                longitude_usuario,
                loja.endereco.latitude,
                loja.endereco.longitude
            )
            
            # Inclui o anúncio apenas se o usuário estiver dentro do raio de alcance (em km)
            if distancia <= anuncio.raio_alcance:
                produto = await self.produto_repo.obter_por_id(anuncio.produto_id)
                feed.append({
                    "anuncio": anuncio.para_dicionario(),
                    "loja": loja.para_dicionario(),
                    "produto": produto.para_dicionario() if produto else None,
                    "distancia_km": distancia
                })
                
        # Ordenar por distância (menor para maior)
        feed.sort(key=lambda x: x["distancia_km"])
        return feed
