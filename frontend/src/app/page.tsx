"use client";

import React, { useState, useEffect } from "react";
import * as api from "../servicos/api";

// Dados simulados de fallback em caso de servidor offline
const DADOS_SIMULADOS = {
  feedMasp: [
    {
      anuncio: { id: "ad-1", titulo: "Arroz Agulhinha 5kg com Desconto!", descricao: "Arroz selecionado tipo 1", preco: 26.90, raio_alcance: 5.0 },
      loja: { nome: "Mercado Real Paulista", endereco: { rua: "Av Paulista", numero: "1578" } },
      produto: { preco: 26.90, imagens: [] },
      distancia_km: 0.12
    },
    {
      anuncio: { id: "ad-2", titulo: "Feijão Carioca Oferta", descricao: "Feijão de cozimento rápido", preco: 7.49, raio_alcance: 3.0 },
      loja: { nome: "Mercado Real Paulista", endereco: { rua: "Av Paulista", numero: "1578" } },
      produto: { preco: 7.49, imagens: [] },
      distancia_km: 0.12
    }
  ],
  feedAugusta: [
    {
      anuncio: { id: "ad-3", titulo: "Sabão em Pó em Promoção", descricao: "Sabão multi-ação 1kg", preco: 14.90, raio_alcance: 10.0 },
      loja: { nome: "Express Augusta", endereco: { rua: "Rua Augusta", numero: "800" } },
      produto: { preco: 14.90, imagens: [] },
      distancia_km: 1.15
    }
  ],
  comparador: [
    {
      anuncio: { titulo: "Feijão Carioca Oferta" },
      produto: { nome: "Feijão Carioca 1kg", preco: 7.49 },
      loja: { nome: "Mercado Real Paulista" },
      preco: 7.49
    },
    {
      anuncio: { titulo: "Feijão Preto Premium" },
      produto: { nome: "Feijão Preto 1kg", preco: 9.80 },
      loja: { nome: "Express Augusta" },
      preco: 9.80
    }
  ]
};

export default function Home() {
  // Estado do Sistema
  const [modo, setModo] = useState<"consumidor" | "lojista">("consumidor");
  const [abaConsumidor, setAbaConsumidor] = useState<"feed" | "comparar" | "scan" | "listas">("feed");
  const [abaLojista, setAbaLojista] = useState<"painel" | "anuncios" | "lojas">("painel");
  const [localizacao, setLocalizacao] = useState<"masp" | "augusta" | "rio">("masp");
  const [offline, setOffline] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Dados do Consumidor
  const [feed, setFeed] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [resultadosComparacao, setResultadosComparacao] = useState<any[]>([]);
  
  // Listas de Compras
  const [listas, setListas] = useState<any[]>([
    { id: "1", nome: "Lista de Feira", itens: [
      { id: "l-1", nome: "Tomate kg", quantidade: 1, comprado: false },
      { id: "l-2", nome: "Cebola kg", quantidade: 2, comprado: true }
    ]}
  ]);
  const [novaListaNome, setNovaListaNome] = useState("");
  const [novoItemNome, setNovoItemNome] = useState("");
  const [listaSelecionadaId, setListaSelecionadaId] = useState("1");

  // Carrinho de Compras ao Vivo
  const [carrinho, setCarrinho] = useState<api.ItemCarrinho[]>([]);
  const [totalCarrinho, setTotalCarrinho] = useState(0.0);
  const [codigoScan, setCodigoScan] = useState("");
  const [manualScanId, setManualScanId] = useState("p-arroz");

  // Dados do Lojista
  const [saldoCreditos, setSaldoCreditos] = useState(500.0);
  const [quantidadeDiamantes, setQuantidadeDiamantes] = useState(10);
  const [lojas, setLojas] = useState<any[]>([
    { id: "loja-1", nome: "Mercado Real Paulista", endereco: "Av Paulista, 1578", ads_count: 2 },
    { id: "loja-2", nome: "Express Augusta", endereco: "Rua Augusta, 800", ads_count: 1 }
  ]);
  const [anunciosLojista, setAnunciosLojista] = useState<any[]>([
    { id: "ad-arroz-real", titulo: "Arroz Agulhinha com Desconto!", preco: 26.90, raio: 5, status: "ativo" },
    { id: "ad-feijao-real", titulo: "Feijão Carioca Oferta", preco: 7.49, raio: 3, status: "ativo" },
    { id: "ad-sabao-express", titulo: "Sabão em Pó em Promoção", preco: 14.90, raio: 10, status: "ativo" }
  ]);

  // Estado do Form de Anúncios
  const [formLojaId, setFormLojaId] = useState("loja-1");
  const [formProdutoId, setFormProdutoId] = useState("p-arroz");
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formRaio, setFormRaio] = useState(5.0);

  // Carregar Dados Iniciais
  useEffect(() => {
    verificarConexao();
  }, []);

  useEffect(() => {
    if (abaConsumidor === "feed") {
      carregarFeed();
    }
  }, [localizacao, abaConsumidor]);

  const verificarConexao = async () => {
    try {
      setCarregando(true);
      const res = await api.obterStatus();
      setOffline(res.modo_offline);
    } catch (e) {
      setOffline(true);
      console.log("Servidor não está respondendo, rodando em modo de simulação local.");
    } finally {
      setCarregando(false);
    }
  };

  const executarSemeador = async () => {
    try {
      setCarregando(true);
      await api.semearBanco();
      setSucesso("Banco de dados semeado com sucesso!");
      await verificarConexao();
      carregarFeed();
    } catch (e) {
      setErro("Falha ao semear banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  const obterCoordenadas = () => {
    switch (localizacao) {
      case "masp":
        return { lat: -23.5615, lon: -46.6562 };
      case "augusta":
        return { lat: -23.5512, lon: -46.6598 };
      case "rio":
        return { lat: -22.9512, lon: -43.2100 };
    }
  };

  const carregarFeed = async () => {
    setCarregando(true);
    setErro("");
    const { lat, lon } = obterCoordenadas();
    try {
      if (offline) {
        // Fallback local
        if (localizacao === "masp") setFeed(DADOS_SIMULADOS.feedMasp);
        else if (localizacao === "augusta") setFeed(DADOS_SIMULADOS.feedAugusta);
        else setFeed([]);
      } else {
        const dados = await api.obterFeed(lat, lon);
        setFeed(dados);
      }
    } catch (e) {
      setErro("Erro ao carregar o feed de ofertas.");
    } finally {
      setCarregando(false);
    }
  };

  const pesquisarComparacao = async (val: string) => {
    setBusca(val);
    if (!val.trim()) {
      setResultadosComparacao([]);
      return;
    }
    setCarregando(true);
    try {
      if (offline) {
        const filtrado = DADOS_SIMULADOS.comparador.filter(
          item => item.produto.nome.toLowerCase().includes(val.toLowerCase())
        );
        setResultadosComparacao(filtrado);
      } else {
        const dados = await api.compararPrecos(val);
        setResultadosComparacao(dados);
      }
    } catch (e) {
      setErro("Erro ao pesquisar preços.");
    } finally {
      setCarregando(false);
    }
  };

  // Funções de Lista de Compras
  const adicionarNovaLista = () => {
    if (!novaListaNome.trim()) return;
    const nova = {
      id: Date.now().toString(),
      nome: novaListaNome,
      itens: []
    };
    setListas([...listas, nova]);
    setListaSelecionadaId(nova.id);
    setNovaListaNome("");
    setSucesso("Lista criada!");
  };

  const adicionarItemLista = () => {
    if (!novoItemNome.trim()) return;
    setListas(listas.map(l => {
      if (l.id === listaSelecionadaId) {
        return {
          ...l,
          itens: [...l.itens, { id: Date.now().toString(), nome: novoItemNome, quantidade: 1, comprado: false }]
        };
      }
      return l;
    }));
    setNovoItemNome("");
  };

  const alternarCompradoItem = (itemId: string) => {
    setListas(listas.map(l => {
      if (l.id === listaSelecionadaId) {
        return {
          ...l,
          itens: l.itens.map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i)
        };
      }
      return l;
    }));
  };

  const removerItemLista = (itemId: string) => {
    setListas(listas.map(l => {
      if (l.id === listaSelecionadaId) {
        return {
          ...l,
          itens: l.itens.filter(i => i.id !== itemId)
        };
      }
      return l;
    }));
  };

  // Funções do Carrinho ao Vivo / Scan
  const escanearProduto = async (codigo: string) => {
    if (!codigo) return;
    setCarregando(true);
    setErro("");
    try {
      let produto = null;
      if (offline) {
        // Simulação
        if (codigo === "p-arroz") produto = { id: "p-arroz", nome: "Arroz Agulhinha 5kg", preco: 26.90 };
        else if (codigo === "p-feijao") produto = { id: "p-feijao", nome: "Feijão Carioca 1kg", preco: 7.49 };
        else if (codigo === "p-detergente") produto = { id: "p-detergente", nome: "Detergente Neutro 500ml", preco: 2.19 };
        else if (codigo === "p-sabao") produto = { id: "p-sabao", nome: "Sabão em Pó 1kg", preco: 14.90 };
      } else {
        produto = await api.identificarProduto(codigo);
      }

      if (!produto) {
        setErro("Produto não cadastrado ou não reconhecido.");
        return;
      }

      // Adiciona ao carrinho local
      const itemExistente = carrinho.find(i => i.produto_id === produto.id);
      let novoCarrinho = [];
      if (itemExistente) {
        novoCarrinho = carrinho.map(i => i.produto_id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      } else {
        novoCarrinho = [...carrinho, { produto_id: produto.id, nome: produto.nome, quantidade: 1, preco_unitario: produto.preco }];
      }
      setCarrinho(novoCarrinho);
      
      // Calcular total pelo back-end
      if (offline) {
        const total = novoCarrinho.reduce((acc, curr) => acc + (curr.quantidade * curr.preco_unitario), 0);
        setTotalCarrinho(Number(total.toFixed(2)));
      } else {
        const calc = await api.calcularTotalCarrinho(novoCarrinho);
        setTotalCarrinho(calc.preco_total);
      }
      setSucesso(`${produto.nome} adicionado ao carrinho!`);
    } catch (e) {
      setErro("Falha no escaneamento do produto.");
    } finally {
      setCarregando(false);
      setCodigoScan("");
    }
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setTotalCarrinho(0.0);
  };

  // Funções do Lojista
  const lidarComNovoAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;
    setCarregando(true);
    setErro("");
    
    const custo = formRaio * 5.0;
    if (saldoCreditos < custo) {
      setErro(`Saldo insuficiente. O anúncio de raio ${formRaio}km custa ${custo} créditos.`);
      setCarregando(false);
      return;
    }

    try {
      const dataInicio = new Date().toISOString();
      const dataFim = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 dias

      if (offline) {
        // Simulação
        setSaldoCreditos(prev => prev - custo);
        const novoAd = {
          id: `ad-${Date.now()}`,
          titulo: formTitulo,
          preco: formProdutoId === "p-arroz" ? 26.90 : formProdutoId === "p-feijao" ? 7.49 : 14.90,
          raio: formRaio,
          status: "ativo"
        };
        setAnunciosLojista([novoAd, ...anunciosLojista]);
      } else {
        await api.impulsionarAnuncio({
          anuncio_id: `ad-${Date.now()}`,
          loja_id: formLojaId,
          produto_id: formProdutoId,
          titulo: formTitulo,
          descricao: formDescricao,
          raio_alcance: formRaio,
          data_inicio: dataInicio,
          data_fim: dataFim,
          usuario_proprietario_id: "lojista-1"
        });
        
        // Recarregar dados reais
        const resUser = await fetch(`http://localhost:8000/sistema/status`); // para atualizar
        // Mock update
        setSaldoCreditos(prev => prev - custo);
      }

      setSucesso("Anúncio impulsionado com sucesso!");
      setFormTitulo("");
      setFormDescricao("");
      setFormRaio(5.0);
    } catch (e: any) {
      setErro(e.message || "Erro ao criar anúncio");
    } finally {
      setCarregando(false);
    }
  };

  const lidarComCompraDeCreditos = async () => {
    setCarregando(true);
    setErro("");
    try {
      if (offline) {
        setSaldoCreditos(prev => prev + 100.0);
      } else {
        await api.adquirirCreditos("lojista-1", 100.0, 100.0);
        setSaldoCreditos(prev => prev + 100.0);
      }
      setSucesso("100 créditos adicionados!");
    } catch (e: any) {
      setErro(e.message || "Erro ao comprar créditos");
    } finally {
      setCarregando(false);
    }
  };

  const listaSelecionada = listas.find(l => l.id === listaSelecionadaId);

  return (
    <div className="animar-entrada" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Banner de Aviso de Modo Offline/Semeadura */}
      {offline && (
        <div style={{
          background: "rgba(240, 140, 0, 0.15)",
          borderBottom: "1px solid rgba(240, 140, 0, 0.3)",
          padding: "8px 12px",
          fontSize: "12px",
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ color: "var(--alerta)" }}>⚠️ Servidor Offline (Simulador Ativo)</span>
          <button 
            onClick={executarSemeador}
            className="botao-principal"
            style={{ padding: "4px 8px", fontSize: "10px", borderRadius: "4px" }}
          >
            Tentar Semear Banco
          </button>
        </div>
      )}

      {/* Header Premium do Aplicativo */}
      <header className="efeito-vidro" style={{ 
        margin: "12px", 
        padding: "16px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px",
        borderRadius: "var(--arredondamento-md)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="texto-gradiente" style={{ fontSize: "24px", fontWeight: "700" }}>Preço Real</h1>
            <p style={{ fontSize: "11px", color: "var(--cor-texto-secundario)" }}>
              {modo === "consumidor" ? "Painel do Consumidor" : "Portal do Lojista"}
            </p>
          </div>
          
          {/* Seletor de Modo (Consumidor vs Lojista) */}
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.05)",
            padding: "4px",
            borderRadius: "var(--arredondamento-sm)",
            border: "1px solid var(--vidro-borda)"
          }}>
            <button
              onClick={() => setModo("consumidor")}
              style={{
                background: modo === "consumidor" ? "var(--gradiente-primario)" : "transparent",
                border: "none",
                color: "white",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "var(--arredondamento-sm)",
                cursor: "pointer",
                transition: "var(--transicao-suave)"
              }}
            >
              Consumidor
            </button>
            <button
              onClick={() => setModo("lojista")}
              style={{
                background: modo === "lojista" ? "var(--gradiente-primario)" : "transparent",
                border: "none",
                color: "white",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "var(--arredondamento-sm)",
                cursor: "pointer",
                transition: "var(--transicao-suave)"
              }}
            >
              Lojista
            </button>
          </div>
        </div>

        {/* Informações do Perfil Contextual */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {modo === "consumidor" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>👤</span>
                <span>Carlos Silva</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span>💎 <strong className="texto-diamante">12</strong></span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>🏬</span>
                <span>José Lojista</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🪙 <strong>{saldoCreditos.toFixed(2)}</strong> cr.</span>
              </div>
            </>
          )}
        </div>

        {/* Geolocalização Simulada no Header (Apenas para Consumidor) */}
        {modo === "consumidor" && (
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            background: "rgba(255, 255, 255, 0.02)",
            padding: "8px 12px",
            borderRadius: "var(--arredondamento-sm)",
            fontSize: "12px"
          }}>
            <span style={{ color: "var(--cor-texto-secundario)" }}>📍 Localização Simulada:</span>
            <select
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value as any)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--cor-destaque)",
                fontWeight: "600",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="masp" style={{ background: "var(--cor-fundo)" }}>Av. Paulista (Perto)</option>
              <option value="augusta" style={{ background: "var(--cor-fundo)" }}>Rua Augusta (Médio)</option>
              <option value="rio" style={{ background: "var(--cor-fundo)" }}>Rio de Janeiro (Longe)</option>
            </select>
          </div>
        )}
      </header>

      {/* Exibição de Mensagens de Erro / Sucesso */}
      {erro && (
        <div style={{ margin: "0 12px 12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(240,0,0,0.1)", border: "1px solid rgba(240,0,0,0.2)", color: "var(--erro)", fontSize: "13px" }}>
          ❌ {erro}
        </div>
      )}
      {sucesso && (
        <div style={{ margin: "0 12px 12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,240,0,0.1)", border: "1px solid rgba(0,240,0,0.2)", color: "var(--sucesso)", fontSize: "13px" }}>
          ✅ {sucesso}
          {setTimeout(() => setSucesso(""), 4000) && ""}
        </div>
      )}

      {/* Conteúdo Principal Flexível */}
      <main style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        
        {/* ================= MODALIDADE CONSUMIDOR ================= */}
        {modo === "consumidor" && (
          <div className="animar-entrada">
            
            {/* 1. ABA: FEED DE OFERTAS */}
            {abaConsumidor === "feed" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Ofertas Próximas de Você</h2>
                {carregando && <p style={{ textAlign: "center", color: "var(--cor-texto-secundario)" }}>Carregando ofertas...</p>}
                {!carregando && feed.length === 0 && (
                  <div className="efeito-vidro" style={{ padding: "30px 12px", textAlign: "center" }}>
                    <p style={{ color: "var(--cor-texto-secundario)", marginBottom: "12px" }}>Nenhuma oferta encontrada para esta localização.</p>
                    <button className="botao-secundario" style={{ margin: "0 auto" }} onClick={carregarFeed}>Recarregar</button>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {feed.map((item, idx) => (
                    <div key={idx} className="efeito-vidro interativo" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <span style={{
                            background: "var(--gradiente-primario)",
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "3px 6px",
                            borderRadius: "4px",
                            display: "inline-block",
                            marginBottom: "6px"
                          }}>
                            {item.loja.nome}
                          </span>
                          <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{item.anuncio.titulo}</h3>
                          <p style={{ fontSize: "12px", color: "var(--cor-texto-secundario)" }}>{item.anuncio.descricao}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--cor-destaque)" }}>
                            R$ {item.anuncio.preco ? item.anuncio.preco.toFixed(2) : item.preco.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--cor-texto-secundario)", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                        <span>📍 A {item.distancia_km.toFixed(2)} km de você</span>
                        <span>Raio de alcance: {item.anuncio.raio_alcance || item.anuncio.raio} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ABA: COMPARAR PREÇOS */}
            {abaConsumidor === "comparar" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Comparar Preços</h2>
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="Busque por arroz, feijão, sabão..."
                    className="input-campo"
                    value={busca}
                    onChange={(e) => pesquisarComparacao(e.target.value)}
                  />
                </div>

                {carregando && <p style={{ textAlign: "center", color: "var(--cor-texto-secundario)" }}>Pesquisando preços...</p>}
                
                {!carregando && resultadosComparacao.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {resultadosComparacao.map((item, idx) => (
                      <div key={idx} className="efeito-vidro" style={{ padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h3 style={{ fontSize: "15px", fontWeight: "600" }}>{item.produto.nome}</h3>
                          <p style={{ fontSize: "12px", color: "var(--cor-texto-secundario)" }}>Vendido em: <strong>{item.loja.nome}</strong></p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cor-destaque)" }}>R$ {item.preco.toFixed(2)}</div>
                          {idx === 0 && <span style={{ fontSize: "10px", color: "var(--sucesso)", fontWeight: "600" }}>🌟 Melhor Preço</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!carregando && busca && resultadosComparacao.length === 0 && (
                  <p style={{ textAlign: "center", color: "var(--cor-texto-secundario)", padding: "20px 0" }}>Nenhum produto correspondente encontrado.</p>
                )}
              </div>
            )}

            {/* 3. ABA: LISTAS DE COMPRAS */}
            {abaConsumidor === "listas" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Suas Listas de Compras</h2>
                
                {/* Seletor/Criador de Lista */}
                <div className="efeito-vidro" style={{ padding: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      placeholder="Nome da Nova Lista..."
                      className="input-campo"
                      style={{ padding: "8px 12px", fontSize: "14px" }}
                      value={novaListaNome}
                      onChange={(e) => setNovaListaNome(e.target.value)}
                    />
                    <button className="botao-principal" style={{ padding: "8px 16px", fontSize: "14px" }} onClick={adicionarNovaLista}>
                      Criar
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                    {listas.map(l => (
                      <button
                        key={l.id}
                        onClick={() => setListaSelecionadaId(l.id)}
                        style={{
                          background: l.id === listaSelecionadaId ? "var(--gradiente-primario)" : "rgba(255,255,255,0.05)",
                          border: "none",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {l.nome} ({l.itens.length})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conteúdo da Lista Selecionada */}
                {listaSelecionada && (
                  <div className="efeito-vidro" style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Itens em {listaSelecionada.nome}</h3>
                    
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                      <input
                        type="text"
                        placeholder="Adicionar item (ex: Banana)..."
                        className="input-campo"
                        style={{ padding: "8px 12px", fontSize: "14px" }}
                        value={novoItemNome}
                        onChange={(e) => setNovoItemNome(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && adicionarItemLista()}
                      />
                      <button className="botao-principal" style={{ padding: "8px 16px" }} onClick={adicionarItemLista}>
                        +
                      </button>
                    </div>

                    {listaSelecionada.itens.length === 0 ? (
                      <p style={{ color: "var(--cor-texto-secundario)", fontSize: "13px", textAlign: "center", padding: "10px" }}>Esta lista está vazia.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {listaSelecionada.itens.map((item: any) => (
                          <div key={item.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: item.comprado ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.03)"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="checkbox"
                                checked={item.comprado}
                                onChange={() => alternarCompradoItem(item.id)}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              <span style={{
                                textDecoration: item.comprado ? "line-through" : "none",
                                color: item.comprado ? "var(--cor-texto-secundario)" : "var(--cor-texto)",
                                fontSize: "14px"
                              }}>
                                {item.nome}
                              </span>
                            </div>
                            <button
                              onClick={() => removerItemLista(item.id)}
                              style={{ background: "transparent", border: "none", color: "var(--erro)", cursor: "pointer", fontSize: "14px" }}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. ABA: COMPRAS AO VIVO (SCANNER EM TEMPO REAL) */}
            {abaConsumidor === "scan" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Compras ao Vivo (Scanner)</h2>
                
                {/* Visualizador de Câmera Simulado */}
                <div className="efeito-vidro-forte" style={{
                  height: "180px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: "linear-gradient(45deg, rgba(0, 255, 128, 0.05), rgba(138, 43, 226, 0.05))",
                  border: "1px dashed rgba(0, 255, 128, 0.3)",
                  marginBottom: "16px"
                }}>
                  {/* Linha laser piscando */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "var(--cor-destaque)",
                    boxShadow: "0 0 10px var(--cor-destaque)",
                    animation: "laser 2.5s infinite linear"
                  }} />
                  <style>{`
                    @keyframes laser {
                      0% { top: 0%; }
                      50% { top: 100%; }
                      100% { top: 0%; }
                    }
                  `}</style>
                  
                  <span style={{ fontSize: "36px", marginBottom: "8px" }}>📷</span>
                  <p style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", textAlign: "center" }}>
                    Posicione o código de barras ou rótulo do produto na tela
                  </p>
                </div>

                {/* Simulador de Scan Manual */}
                <div className="efeito-vidro" style={{ padding: "14px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Simulador de Escaneamento:</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      className="input-campo"
                      style={{ padding: "8px 12px", fontSize: "14px" }}
                      value={manualScanId}
                      onChange={(e) => setManualScanId(e.target.value)}
                    >
                      <option value="p-arroz">Arroz Agulhinha 5kg (R$ 26.90)</option>
                      <option value="p-feijao">Feijão Carioca 1kg (R$ 7.49)</option>
                      <option value="p-detergente">Detergente Neutro 500ml (R$ 2.19)</option>
                      <option value="p-sabao">Sabão em Pó 1kg (R$ 14.90)</option>
                      <option value="inexistente">Produto Inexistente (Gera Erro)</option>
                    </select>
                    <button 
                      className="botao-principal" 
                      style={{ padding: "8px 16px", fontSize: "14px", whiteSpace: "nowrap" }}
                      onClick={() => escanearProduto(manualScanId)}
                      disabled={carregando}
                    >
                      Escanear
                    </button>
                  </div>
                </div>

                {/* Carrinho de Compras ao Vivo */}
                {carrinho.length > 0 && (
                  <div className="efeito-vidro" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Carrinho em Tempo Real</h3>
                      <button 
                        onClick={limparCarrinho}
                        style={{ background: "transparent", border: "none", color: "var(--erro)", fontSize: "12px", cursor: "pointer" }}
                      >
                        Limpar Tudo
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                      {carrinho.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span>{item.quantidade}x {item.nome}</span>
                          <span style={{ color: "var(--cor-texto-secundario)" }}>
                            R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      fontWeight: "bold"
                    }}>
                      <span>TOTAL DA COMPRA:</span>
                      <span className="texto-gradiente" style={{ fontSize: "20px" }}>R$ {totalCarrinho.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ================= MODALIDADE LOJISTA ================= */}
        {modo === "lojista" && (
          <div className="animar-entrada">
            
            {/* 1. ABA LOJISTA: PAINEL FINANCEIRO */}
            {abaLojista === "painel" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Card de Créditos e Impulsionamentos */}
                <div className="efeito-vidro-forte" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3 style={{ fontSize: "14px", color: "var(--cor-texto-secundario)" }}>Saldo de Créditos</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "32px", fontWeight: "700" }}>🪙 {saldoCreditos.toFixed(2)}</span>
                    <button className="botao-principal" style={{ padding: "10px 16px", fontSize: "12px" }} onClick={lidarComCompraDeCreditos}>
                      + 100 Créditos
                    </button>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--cor-texto-secundario)" }}>
                    1 crédito = R$ 1,00. Use créditos para aumentar o raio de alcance dos seus anúncios geolocalizados.
                  </p>
                </div>

                {/* Métricas e Resumos */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="efeito-vidro" style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ fontSize: "24px" }}>🏬</span>
                    <h4 style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", marginTop: "6px" }}>Suas Lojas</h4>
                    <p style={{ fontSize: "18px", fontWeight: "bold" }}>{lojas.length}</p>
                  </div>
                  <div className="efeito-vidro" style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ fontSize: "24px" }}>📢</span>
                    <h4 style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", marginTop: "6px" }}>Anúncios Ativos</h4>
                    <p style={{ fontSize: "18px", fontWeight: "bold" }}>{anunciosLojista.length}</p>
                  </div>
                </div>

              </div>
            )}

            {/* 2. ABA LOJISTA: GERENCIAR ANÚNCIOS / IMPULSIONAR */}
            {abaLojista === "anuncios" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Impulsionar Oferta</h2>
                
                {/* Form para novo Anúncio */}
                <form onSubmit={lidarComNovoAnuncio} className="efeito-vidro" style={{ padding: "16px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", display: "block", marginBottom: "4px" }}>Selecionar Loja:</label>
                    <select className="input-campo" value={formLojaId} onChange={(e) => setFormLojaId(e.target.value)}>
                      {lojas.map(l => (
                        <option key={l.id} value={l.id}>{l.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", display: "block", marginBottom: "4px" }}>Selecionar Produto:</label>
                    <select className="input-campo" value={formProdutoId} onChange={(e) => setFormProdutoId(e.target.value)}>
                      <option value="p-arroz">Arroz Agulhinha 5kg (R$ 26.90)</option>
                      <option value="p-feijao">Feijão Carioca 1kg (R$ 7.49)</option>
                      <option value="p-sabao">Sabão em Pó 1kg (R$ 14.90)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", display: "block", marginBottom: "4px" }}>Título do Anúncio:</label>
                    <input
                      type="text"
                      className="input-campo"
                      placeholder="Ex: Arroz Agulhinha com Desconto!"
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", display: "block", marginBottom: "4px" }}>Descrição do Anúncio:</label>
                    <input
                      type="text"
                      className="input-campo"
                      placeholder="Ex: Oferta válida somente esta semana"
                      value={formDescricao}
                      onChange={(e) => setFormDescricao(e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--cor-texto-secundario)", marginBottom: "4px" }}>
                      <label>Raio de Alcance:</label>
                      <span><strong>{formRaio} km</strong></span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="0.5"
                      style={{ width: "100%", accentColor: "var(--cor-primaria)", cursor: "pointer" }}
                      value={formRaio}
                      onChange={(e) => setFormRaio(parseFloat(e.target.value))}
                    />
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "10px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    border: "1px dashed var(--vidro-borda)"
                  }}>
                    <span>Custo do Impulsionamento:</span>
                    <strong style={{ color: "var(--cor-destaque)" }}>🪙 {(formRaio * 5.0).toFixed(2)} créditos</strong>
                  </div>

                  <button type="submit" className="botao-principal" style={{ marginTop: "8px" }} disabled={carregando}>
                    {carregando ? "Criando..." : "Impulsionar Anúncio"}
                  </button>
                </form>

                {/* Lista de Anúncios Ativos */}
                <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "10px" }}>Anúncios Sendo Exibidos</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {anunciosLojista.map((ad, idx) => (
                    <div key={idx} className="efeito-vidro" style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "600" }}>{ad.titulo}</h4>
                        <span style={{ fontSize: "11px", color: "var(--cor-texto-secundario)" }}>Raio: {ad.raio} km</span>
                      </div>
                      <span style={{
                        background: "rgba(0,240,0,0.15)",
                        border: "1px solid rgba(0,240,0,0.3)",
                        color: "var(--sucesso)",
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "3px 6px",
                        borderRadius: "4px"
                      }}>
                        {ad.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 3. ABA LOJISTA: CADASTRAR LOJAS */}
            {abaLojista === "lojas" && (
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>Suas Lojas Filiais</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {lojas.map(loja => (
                    <div key={loja.id} className="efeito-vidro" style={{ padding: "16px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{loja.nome}</h3>
                      <p style={{ fontSize: "12px", color: "var(--cor-texto-secundario)", marginBottom: "8px" }}>📍 {loja.endereco}</p>
                      <div style={{ fontSize: "11px", color: "var(--cor-primaria)", fontWeight: "600" }}>
                        📢 {loja.ads_count} Anúncios Ativos vinculados
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Navigation Bar Inferior Móvel */}
      <nav className="efeito-vidro-forte" style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: "var(--arredondamento-lg) var(--arredondamento-lg) 0 0",
        borderTop: "1px solid var(--vidro-borda)",
        padding: "0 10px",
        zIndex: 50
      }}>
        {modo === "consumidor" ? (
          <>
            <button 
              onClick={() => setAbaConsumidor("feed")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaConsumidor === "feed" ? "var(--cor-destaque)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>📰</span>
              <span>Ofertas</span>
            </button>
            
            <button 
              onClick={() => setAbaConsumidor("comparar")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaConsumidor === "comparar" ? "var(--cor-destaque)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>⚖️</span>
              <span>Comparar</span>
            </button>

            <button 
              onClick={() => setAbaConsumidor("scan")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaConsumidor === "scan" ? "var(--cor-destaque)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>🛒</span>
              <span>Ao Vivo</span>
            </button>

            <button 
              onClick={() => setAbaConsumidor("listas")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaConsumidor === "listas" ? "var(--cor-destaque)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>📝</span>
              <span>Listas</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setAbaLojista("painel")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaLojista === "painel" ? "var(--cor-primaria)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>📊</span>
              <span>Painel</span>
            </button>

            <button 
              onClick={() => setAbaLojista("anuncios")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaLojista === "anuncios" ? "var(--cor-primaria)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>📢</span>
              <span>Anunciar</span>
            </button>

            <button 
              onClick={() => setAbaLojista("lojas")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: abaLojista === "lojas" ? "var(--cor-primaria)" : "var(--cor-texto-secundario)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "10px"
              }}
            >
              <span style={{ fontSize: "20px" }}>🏬</span>
              <span>Lojas</span>
            </button>
          </>
        )}
      </nav>

    </div>
  );
}
