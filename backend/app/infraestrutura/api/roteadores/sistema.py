from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.infraestrutura.api.dependencias import (
    obter_usuario_repositorio,
    obter_produto_repositorio,
    obter_loja_repositorio,
    obter_anuncio_repositorio,
    modo_offline_ativo
)
from app.dominio.entidades.usuario import Usuario
from app.dominio.entidades.produto import Produto
from app.dominio.entidades.loja import Loja
from app.dominio.entidades.anuncio import Anuncio
from app.dominio.objetos_valor.endereco import Endereco

roteador = APIRouter(prefix="/sistema", tags=["Sistema"])

@roteador.get("/status")
async def obter_status():
    return {
        "status": "online",
        "modo_offline": modo_offline_ativo()
    }

@roteador.post("/semear")
async def semear_banco(
    usuario_repo = Depends(obter_usuario_repositorio),
    produto_repo = Depends(obter_produto_repositorio),
    loja_repo = Depends(obter_loja_repositorio),
    anuncio_repo = Depends(obter_anuncio_repositorio)
):
    # 1. Criar Lojista e Consumidor
    lojista = Usuario(
        id="lojista-1",
        nome="José Lojista",
        email="jose@loja.com",
        tipo="lojista",
        saldo_creditos=500.0,
        quantidade_diamantes=10
    )
    consumidor = Usuario(
        id="consumidor-1",
        nome="Carlos Silva",
        email="carlos@consumo.com",
        tipo="consumidor",
        saldo_creditos=0.0,
        quantidade_diamantes=0
    )
    await usuario_repo.salvar(lojista)
    await usuario_repo.salvar(consumidor)

    # 2. Criar Endereços e Lojas
    # MASP - São Paulo
    end1 = Endereco(
        rua="Av Paulista", numero="1578", bairro="Bela Vista",
        cidade="São Paulo", estado="SP", cep="01310-200",
        latitude=-23.5615, longitude=-46.6562
    )
    loja1 = Loja(
        id="loja-1",
        nome="Mercado Real Paulista",
        usuario_proprietario_id="lojista-1",
        descricao="O melhor mercado da Avenida Paulista",
        endereco=end1
    )
    await loja_repo.salvar(loja1)

    # Consolação - São Paulo (~1.5 km do MASP)
    end2 = Endereco(
        rua="Rua Augusta", numero="800", bairro="Consolação",
        cidade="São Paulo", estado="SP", cep="01304-001",
        latitude=-23.5512, longitude=-46.6598
    )
    loja2 = Loja(
        id="loja-2",
        nome="Express Augusta",
        usuario_proprietario_id="lojista-1",
        descricao="Conveniência e preço baixo perto de você",
        endereco=end2
    )
    await loja_repo.salvar(loja2)

    # 3. Criar Produtos
    prod1 = Produto(id="p-arroz", nome="Arroz Agulhinha 5kg", categoria="Alimentos", preco=26.90, estoque=50)
    prod2 = Produto(id="p-feijao", nome="Feijão Carioca 1kg", categoria="Alimentos", preco=7.49, estoque=60)
    prod3 = Produto(id="p-detergente", nome="Detergente Neutro 500ml", categoria="Limpeza", preco=2.19, estoque=100)
    prod4 = Produto(id="p-sabao", nome="Sabão em Pó 1kg", categoria="Limpeza", preco=14.90, estoque=30)
    
    await produto_repo.salvar(prod1)
    await produto_repo.salvar(prod2)
    await produto_repo.salvar(prod3)
    await produto_repo.salvar(prod4)

    # 4. Criar Anúncios
    agora = datetime.utcnow()
    fim = agora + timedelta(days=30)
    
    ad1 = Anuncio(
        id="ad-arroz-real", loja_id="loja-1", produto_id="p-arroz",
        titulo="Arroz Agulhinha com Desconto!", raio_alcance=5.0,
        custo_creditos=25.0, data_inicio=agora, data_fim=fim, status="ativo",
        descricao="Arroz tipo 1 selecionado"
    )
    ad2 = Anuncio(
        id="ad-feijao-real", loja_id="loja-1", produto_id="p-feijao",
        titulo="Feijão Carioca Oferta", raio_alcance=3.0,
        custo_creditos=15.0, data_inicio=agora, data_fim=fim, status="ativo",
        descricao="Feijão novo de cozimento rápido"
    )
    ad3 = Anuncio(
        id="ad-sabao-express", loja_id="loja-2", produto_id="p-sabao",
        titulo="Sabão em Pó em Promoção", raio_alcance=10.0,
        custo_creditos=50.0, data_inicio=agora, data_fim=fim, status="ativo",
        descricao="Lave suas roupas pagando menos"
    )
    
    await anuncio_repo.salvar(ad1)
    await anuncio_repo.salvar(ad2)
    await anuncio_repo.salvar(ad3)

    return {
        "status": "sucesso",
        "mensagem": "Banco de dados semeado com dados de teste para o MASP e região."
    }
