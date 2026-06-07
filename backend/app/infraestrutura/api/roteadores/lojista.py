from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.infraestrutura.api.dependencias import (
    obter_usuario_repositorio,
    obter_anuncio_repositorio
)
from app.casos_de_uso.impulsionar_anuncio import ImpulsionarAnuncio
from app.casos_de_uso.adquirir_creditos import AdquirirCreditos

roteador = APIRouter(prefix="/lojista", tags=["Lojista"])

class ImpulsionarAnuncioInput(BaseModel):
    anuncio_id: str
    loja_id: str
    produto_id: str
    titulo: str
    descricao: str
    raio_alcance: float
    data_inicio: datetime
    data_fim: datetime
    usuario_proprietario_id: str

class AdquirirCreditosInput(BaseModel):
    usuario_id: str
    quantidade_creditos: float
    valor_pago: float

@roteador.post("/anuncios/impulsionar")
async def impulsionar_anuncio(
    dados: ImpulsionarAnuncioInput,
    usuario_repo = Depends(obter_usuario_repositorio),
    anuncio_repo = Depends(obter_anuncio_repositorio)
):
    caso_de_uso = ImpulsionarAnuncio(usuario_repo, anuncio_repo)
    try:
        anuncio = await caso_de_uso.executar(
            anuncio_id=dados.anuncio_id,
            loja_id=dados.loja_id,
            produto_id=dados.produto_id,
            titulo=dados.titulo,
            descricao=dados.descricao,
            raio_alcance=dados.raio_alcance,
            data_inicio=dados.data_inicio,
            data_fim=dados.data_fim,
            usuario_proprietario_id=dados.usuario_proprietario_id
        )
        return {"status": "sucesso", "anuncio": anuncio.para_dicionario()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@roteador.post("/creditos/adquirir")
async def adquirir_creditos(
    dados: AdquirirCreditosInput,
    usuario_repo = Depends(obter_usuario_repositorio)
):
    caso_de_uso = AdquirirCreditos(usuario_repo)
    try:
        novo_saldo = await caso_de_uso.executar(
            usuario_id=dados.usuario_id,
            quantidade_creditos=dados.quantidade_creditos,
            valor_pago=dados.valor_pago
        )
        return {"status": "sucesso", "novo_saldo_creditos": novo_saldo}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
