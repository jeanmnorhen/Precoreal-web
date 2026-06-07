import pytest
from datetime import datetime, timedelta
from app.dominio.entidades.usuario import Usuario
from app.dominio.entidades.produto import Produto
from app.dominio.entidades.loja import Loja
from app.dominio.entidades.anuncio import Anuncio
from app.dominio.objetos_valor.endereco import Endereco

from app.casos_de_uso.obter_feed_geolocalizado import ObterFeedGeolocalizado
from app.casos_de_uso.comparar_precos import CompararPrecos
from app.casos_de_uso.processar_compra_ao_vivo import ProcessarCompraAoVivo
from app.casos_de_uso.impulsionar_anuncio import ImpulsionarAnuncio
from app.casos_de_uso.adquirir_creditos import AdquirirCreditos

from testes.repositorios_memoria import (
    MemoriaUsuarioRepositorio,
    MemoriaProdutoRepositorio,
    MemoriaLojaRepositorio,
    MemoriaAnuncioRepositorio
)

@pytest.mark.asyncio
async def test_obter_feed_geolocalizado():
    # Repositórios
    anuncio_repo = MemoriaAnuncioRepositorio()
    loja_repo = MemoriaLojaRepositorio()
    produto_repo = MemoriaProdutoRepositorio()
    
    # Setup - MASP
    endereco_loja = Endereco(
        rua="Av Paulista", numero="1000", bairro="Bela Vista",
        cidade="São Paulo", estado="SP", cep="01310-100",
        latitude=-23.561, longitude=-46.655
    )
    
    loja = Loja(id="loja-1", nome="Supermercado MASP", usuario_proprietario_id="lojista-1", endereco=endereco_loja)
    produto = Produto(id="prod-1", nome="Detergente", categoria="Limpeza", preco=2.50, estoque=100)
    
    ad = Anuncio(
        id="ad-1", loja_id="loja-1", produto_id="prod-1",
        titulo="Detergente em Promoção", raio_alcance=5.0, # 5 km
        custo_creditos=10.0, data_inicio=datetime.utcnow(),
        data_fim=datetime.utcnow() + timedelta(days=1), status="ativo"
    )
    
    await loja_repo.salvar(loja)
    await produto_repo.salvar(produto)
    await anuncio_repo.salvar(ad)
    
    caso_de_uso = ObterFeedGeolocalizado(anuncio_repo, loja_repo, produto_repo)
    
    # Usuário Perto (Masp, ~0.15km de distância)
    feed_perto = await caso_de_uso.executar(-23.562, -46.656)
    assert len(feed_perto) == 1
    assert feed_perto[0]["anuncio"]["id"] == "ad-1"
    assert feed_perto[0]["distancia_km"] < 1.0
    
    # Usuário Longe (Rio de Janeiro)
    feed_longe = await caso_de_uso.executar(-22.951, -43.210)
    assert len(feed_longe) == 0

@pytest.mark.asyncio
async def test_comparar_precos():
    anuncio_repo = MemoriaAnuncioRepositorio()
    loja_repo = MemoriaLojaRepositorio()
    produto_repo = MemoriaProdutoRepositorio()
    
    # Lojas
    loja_a = Loja(id="loja-a", nome="Loja A", usuario_proprietario_id="prop-1")
    loja_b = Loja(id="loja-b", nome="Loja B", usuario_proprietario_id="prop-2")
    await loja_repo.salvar(loja_a)
    await loja_repo.salvar(loja_b)
    
    # Produtos com preços diferentes
    prod_caro = Produto(id="prod-caro", nome="Feijão Preto", categoria="Alimentos", preco=9.50)
    prod_barato = Produto(id="prod-barato", nome="Feijão Preto", categoria="Alimentos", preco=7.20)
    await produto_repo.salvar(prod_caro)
    await produto_repo.salvar(prod_barato)
    
    # Anúncios
    ad_caro = Anuncio(
        id="ad-caro", loja_id="loja-a", produto_id="prod-caro",
        titulo="Feijão de Qualidade", raio_alcance=10.0, custo_creditos=5.0,
        data_inicio=datetime.utcnow(), data_fim=datetime.utcnow() + timedelta(days=1),
        status="ativo"
    )
    ad_barato = Anuncio(
        id="ad-barato", loja_id="loja-b", produto_id="prod-barato",
        titulo="Feijão em Oferta", raio_alcance=10.0, custo_creditos=5.0,
        data_inicio=datetime.utcnow(), data_fim=datetime.utcnow() + timedelta(days=1),
        status="ativo"
    )
    await anuncio_repo.salvar(ad_caro)
    await anuncio_repo.salvar(ad_barato)
    
    caso_de_uso = CompararPrecos(anuncio_repo, produto_repo, loja_repo)
    
    # Buscar por "Feijão"
    resultados = await caso_de_uso.executar("feijão")
    assert len(resultados) == 2
    # O mais barato (loja-b, R$ 7.20) deve estar primeiro
    assert resultados[0]["loja"]["id"] == "loja-b"
    assert resultados[0]["preco"] == 7.20
    assert resultados[1]["loja"]["id"] == "loja-a"
    assert resultados[1]["preco"] == 9.50

@pytest.mark.asyncio
async def test_processar_compra_ao_vivo():
    produto_repo = MemoriaProdutoRepositorio()
    
    produto = Produto(id="123456789", nome="Sabão em Pó", categoria="Limpeza", preco=15.90, estoque=20)
    await produto_repo.salvar(produto)
    
    caso_de_uso = ProcessarCompraAoVivo(produto_repo)
    
    # Identificar pelo ID exato (código de barras)
    prod_detectado = await caso_de_uso.identificar_produto_por_imagem_ou_codigo("123456789")
    assert prod_detectado is not None
    assert prod_detectado["nome"] == "Sabão em Pó"
    
    # Identificar por nome parcial (reconhecimento de imagem parcial)
    prod_imagem = await caso_de_uso.identificar_produto_por_imagem_ou_codigo("sabão")
    assert prod_imagem is not None
    assert prod_imagem["id"] == "123456789"
    
    # Calcular total do carrinho
    carrinho = [
        {"produto_id": "123456789", "quantidade": 2, "preco_unitario": 15.90},
        {"produto_id": "outros", "quantidade": 1, "preco_unitario": 5.00}
    ]
    res_carrinho = caso_de_uso.calcular_total_carrinho(carrinho)
    assert res_carrinho["preco_total"] == 36.80 # (2*15.90) + (1*5.00)

@pytest.mark.asyncio
async def test_impulsionar_anuncio():
    usuario_repo = MemoriaUsuarioRepositorio()
    anuncio_repo = MemoriaAnuncioRepositorio()
    
    lojista = Usuario(id="loj-1", nome="Dono de Loja", email="dono@loja.com", tipo="lojista", saldo_creditos=100.0)
    await usuario_repo.salvar(lojista)
    
    caso_de_uso = ImpulsionarAnuncio(usuario_repo, anuncio_repo)
    
    # Criar anúncio com raio de 10km (custo: 50.0 créditos)
    ad = await caso_de_uso.executar(
        anuncio_id="ad-novo",
        loja_id="loja-1",
        produto_id="prod-1",
        titulo="Super Oferta",
        descricao="Desconto de 20%",
        raio_alcance=10.0,
        data_inicio=datetime.utcnow(),
        data_fim=datetime.utcnow() + timedelta(days=2),
        usuario_proprietario_id="loj-1"
    )
    
    assert ad.custo_creditos == 50.0
    # Checar se os créditos foram deduzidos
    usuario_atualizado = await usuario_repo.obter_por_id("loj-1")
    assert usuario_atualizado.saldo_creditos == 50.0
    
    # Tentar criar outro anúncio de 15km (custo: 75.0 créditos) - Deve falhar por saldo insuficiente
    with pytest.raises(ValueError, match="Saldo de créditos insuficiente"):
        await caso_de_uso.executar(
            anuncio_id="ad-novo-2",
            loja_id="loja-1",
            produto_id="prod-1",
            titulo="Super Oferta 2",
            descricao="Sem créditos",
            raio_alcance=15.0,
            data_inicio=datetime.utcnow(),
            data_fim=datetime.utcnow() + timedelta(days=2),
            usuario_proprietario_id="loj-1"
        )

@pytest.mark.asyncio
async def test_adquirir_creditos():
    usuario_repo = MemoriaUsuarioRepositorio()
    lojista = Usuario(id="loj-1", nome="Lojista", email="loj@email.com", tipo="lojista", saldo_creditos=10.0)
    await usuario_repo.salvar(lojista)
    
    caso_de_uso = AdquirirCreditos(usuario_repo)
    
    # Comprar 50 créditos pagando R$ 50,00
    novo_saldo = await caso_de_uso.executar("loj-1", 50.0, 50.0)
    assert novo_saldo == 60.0
    
    # Tentar pagar menos do que o necessário
    with pytest.raises(ValueError, match="O valor pago é insuficiente"):
        await caso_de_uso.executar("loj-1", 50.0, 40.0)
