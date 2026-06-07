from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from pydantic import BaseModel
from app.infraestrutura.api.dependencias import (
    obter_anuncio_repositorio,
    obter_loja_repositorio,
    obter_produto_repositorio
)
from app.casos_de_uso.obter_feed_geolocalizado import ObterFeedGeolocalizado
from app.casos_de_uso.comparar_precos import CompararPrecos
from app.casos_de_uso.processar_compra_ao_vivo import ProcessarCompraAoVivo

roteador = APIRouter(prefix="/consumidor", tags=["Consumidor"])

class ItemCarrinhoInput(BaseModel):
    produto_id: str
    quantidade: int
    preco_unitario: float

class CarrinhoInput(BaseModel):
    itens: List[ItemCarrinhoInput]

@roteador.get("/feed")
async def obter_feed(
    lat: float = Query(..., description="Latitude do usuário"),
    lon: float = Query(..., description="Longitude do usuário"),
    anuncio_repo = Depends(obter_anuncio_repositorio),
    loja_repo = Depends(obter_loja_repositorio),
    produto_repo = Depends(obter_produto_repositorio)
):
    caso_de_uso = ObterFeedGeolocalizado(anuncio_repo, loja_repo, produto_repo)
    return await caso_de_uso.executar(lat, lon)

@roteador.get("/comparar")
async def comparar_precos(
    busca: str = Query(..., description="Termo de busca do produto"),
    anuncio_repo = Depends(obter_anuncio_repositorio),
    produto_repo = Depends(obter_produto_repositorio),
    loja_repo = Depends(obter_loja_repositorio)
):
    caso_de_uso = CompararPrecos(anuncio_repo, produto_repo, loja_repo)
    return await caso_de_uso.executar(busca)

@roteador.get("/compra-ao-vivo/identificar")
async def identificar_produto(
    codigo: str = Query(..., description="Código de barras ou rótulo escaneado"),
    produto_repo = Depends(obter_produto_repositorio)
):
    caso_de_uso = ProcessarCompraAoVivo(produto_repo)
    produto = await caso_de_uso.identificar_produto_por_imagem_ou_codigo(codigo)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não identificado")
    return produto

@roteador.post("/compra-ao-vivo/total")
async def calcular_total(
    carrinho: CarrinhoInput,
    produto_repo = Depends(obter_produto_repositorio)
):
    caso_de_uso = ProcessarCompraAoVivo(produto_repo)
    itens_dict = [item.model_dump() for item in carrinho.itens]
    return caso_de_uso.calcular_total_carrinho(itens_dict)
