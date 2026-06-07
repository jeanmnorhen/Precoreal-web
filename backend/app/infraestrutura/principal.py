from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infraestrutura.api.roteadores import consumidor, lojista, sistema

app = FastAPI(
    title="Preço Real API",
    description="Back-end do aplicativo Preço Real seguindo Arquitetura Limpa e em Português do Brasil.",
    version="1.0.0"
)

# Configurar CORS para permitir conexões do Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar roteadores
app.include_router(consumidor.roteador)
app.include_router(lojista.roteador)
app.include_router(sistema.roteador)

@app.get("/")
async def root():
    return {
        "mensagem": "Bem-vindo à API do Preço Real!",
        "documentacao": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    from app.infraestrutura.configuracao import Configuracao
    print(f"Iniciando servidor na porta {Configuracao.PORTA}...")
    uvicorn.run("app.infraestrutura.principal:app", host="0.0.0.0", port=Configuracao.PORTA, reload=True)
