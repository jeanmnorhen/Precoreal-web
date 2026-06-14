import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../packages/shared/src/db/schema';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://precoreal:postgres@localhost:5432/precoreal',
  max: 5,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Limpa dados existentes
  await db.delete(schema.anuncios);
  await db.delete(schema.lojas);
  await db.delete(schema.produtos);
  await db.delete(schema.usuarios);
  console.log('📦 Dados antigos removidos');

  // ─── USUÁRIOS ───
  const senhaHash = await bcrypt.hash('123456', 10);

  const [consumidor] = await db.insert(schema.usuarios).values({
    nome: 'Maria Silva',
    email: 'maria@email.com',
    senhaHash,
    tipo: 'consumidor',
    saldoCreditos: 0,
    quantidadeDiamantes: 5,
  }).returning();

  const [lojista] = await db.insert(schema.usuarios).values({
    nome: 'João Lojista',
    email: 'joao@email.com',
    senhaHash,
    tipo: 'lojista',
    saldoCreditos: 50000,
    quantidadeDiamantes: 10,
  }).returning();

  const [lojista2] = await db.insert(schema.usuarios).values({
    nome: 'Supermercado Centro',
    email: 'supercentro@email.com',
    senhaHash,
    tipo: 'lojista',
    saldoCreditos: 100000,
    quantidadeDiamantes: 20,
  }).returning();

  console.log('👤 Usuários criados:');
  console.log(`   Consumidor: maria@email.com / 123456 (id: ${consumidor.id})`);
  console.log(`   Lojista: joao@email.com / 123456 (id: ${lojista.id})`);
  console.log(`   Lojista2: supercentro@email.com / 123456 (id: ${lojista2.id})`);

  // ─── LOJAS ───
  const [loja1] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista.id,
    nome: 'Mercado do João',
    descricao: 'Mercado de bairro com preços justos e produtos frescos.',
    enderecoRua: 'Rua Augusta',
    enderecoNumero: '1500',
    enderecoBairro: 'Consolação',
    enderecoCidade: 'São Paulo',
    enderecoEstado: 'SP',
    enderecoCep: '01304001',
    localizacao: 'SRID=4326;POINT(-46.6488 -23.5632)',
  }).returning();

  const [loja2] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista.id,
    nome: 'Empório do João',
    descricao: 'Empório com produtos gourmet e importados.',
    enderecoRua: 'Rua Oscar Freire',
    enderecoNumero: '900',
    enderecoBairro: 'Jardins',
    enderecoCidade: 'São Paulo',
    enderecoEstado: 'SP',
    enderecoCep: '01426001',
    localizacao: 'SRID=4326;POINT(-46.6689 -23.5667)',
  }).returning();

  const [loja3] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista2.id,
    nome: 'Super Centro Atacado',
    descricao: 'Atacado e varejo com os menores preços da região.',
    enderecoRua: 'Av. Paulista',
    enderecoNumero: '1000',
    enderecoBairro: 'Bela Vista',
    enderecoCidade: 'São Paulo',
    enderecoEstado: 'SP',
    enderecoCep: '01310100',
    localizacao: 'SRID=4326;POINT(-46.6520 -23.5630)',
  }).returning();

  console.log('🏪 Lojas criadas:', loja1.nome, '/', loja2.nome, '/', loja3.nome);

  // ─── PRODUTOS ───
  const produtosData = [
    { codigoBarras: '7891000100103', nome: 'Leite Integral', descricao: 'Leite integral 1L', categoria: 'Laticínios', marca: 'Italac', precoMedio: 499, listaImagens: ['https://placehold.co/400x400/eee/333?text=Leite'] },
    { codigoBarras: '7891000100202', nome: 'Arroz Branco', descricao: 'Arroz tipo 1 5kg', categoria: 'Grãos', marca: 'Tio João', precoMedio: 2599, listaImagens: ['https://placehold.co/400x400/eee/333?text=Arroz'] },
    { codigoBarras: '7891000100309', nome: 'Feijão Carioca', descricao: 'Feijão carioca 1kg', categoria: 'Grãos', marca: 'Camil', precoMedio: 899, listaImagens: ['https://placehold.co/400x400/eee/333?text=Feijao'] },
    { codigoBarras: '7891000100408', nome: 'Óleo de Soja', descricao: 'Óleo de soja 900ml', categoria: 'Óleos', marca: 'Liza', precoMedio: 699, listaImagens: ['https://placehold.co/400x400/eee/333?text=Oleo'] },
    { codigoBarras: '7891000100507', nome: 'Açúcar Refinado', descricao: 'Açúcar refinado 1kg', categoria: 'Açúcares', marca: 'União', precoMedio: 399, listaImagens: ['https://placehold.co/400x400/eee/333?text=Acucar'] },
    { codigoBarras: '7891000100606', nome: 'Café Torrado Moído', descricao: 'Café torrado moído 500g', categoria: 'Cafés', marca: 'Pilão', precoMedio: 1599, listaImagens: ['https://placehold.co/400x400/eee/333?text=Cafe'] },
    { codigoBarras: '7891000100705', nome: 'Macarrão Espaguete', descricao: 'Macarrão espaguete 500g', categoria: 'Massas', marca: 'Adria', precoMedio: 499, listaImagens: ['https://placehold.co/400x400/eee/333?text=Macarrao'] },
    { codigoBarras: '7891000100804', nome: 'Molho de Tomate', descricao: 'Molho de tomate 340g', categoria: 'Molhos', marca: 'Pomarola', precoMedio: 399, listaImagens: ['https://placehold.co/400x400/eee/333?text=Molho'] },
    { codigoBarras: '7891000100903', nome: 'Sabão em Pó', descricao: 'Sabão em pó 800g', categoria: 'Limpeza', marca: 'Omo', precoMedio: 1299, listaImagens: ['https://placehold.co/400x400/eee/333?text=Sabo'] },
    { codigoBarras: '7891000101009', nome: 'Detergente Líquido', descricao: 'Detergente líquido 500ml', categoria: 'Limpeza', marca: 'Ypê', precoMedio: 299, listaImagens: ['https://placehold.co/400x400/eee/333?text=Detergente'] },
    { codigoBarras: '7891000101108', nome: 'Papel Higiênico', descricao: 'Papel higiênico 12 rolos', categoria: 'Higiene', marca: 'Neve', precoMedio: 1899, listaImagens: ['https://placehold.co/400x400/eee/333?text=Papel'] },
    { codigoBarras: '7891000101207', nome: 'Shampoo', descricao: 'Shampoo 350ml', categoria: 'Higiene', marca: 'Seda', precoMedio: 1099, listaImagens: ['https://placehold.co/400x400/eee/333?text=Shampoo'] },
    { codigoBarras: '7891000101306', nome: 'Refrigerante Cola', descricao: 'Refrigerante cola 2L', categoria: 'Bebidas', marca: 'Coca-Cola', precoMedio: 899, listaImagens: ['https://placehold.co/400x400/eee/333?text=Coca'] },
    { codigoBarras: '7891000101405', nome: 'Suco de Laranja', descricao: 'Suco de laranja 1L', categoria: 'Bebidas', marca: 'Del Valle', precoMedio: 699, listaImagens: ['https://placehold.co/400x400/eee/333?text=Suco'] },
    { codigoBarras: '7891000101504', nome: 'Biscoito Recheado', descricao: 'Biscoito recheado chocolate 140g', categoria: 'Biscoitos', marca: 'Passatempo', precoMedio: 399, listaImagens: ['https://placehold.co/400x400/eee/333?text=Biscoito'] },
  ];

  const createdProdutos = [];
  for (const p of produtosData) {
    const [prod] = await db.insert(schema.produtos).values(p).returning();
    createdProdutos.push(prod);
  }

  console.log(`📦 ${createdProdutos.length} produtos criados`);

  // ─── ANÚNCIOS (ofertas) ───
  const now = new Date();
  const anunciosData = [
    { lojaId: loja1.id, produtoId: createdProdutos[0].id, titulo: 'Leite Integral em Oferta!', descricao: 'Leite Italac 1L por apenas R$ 3,99', raioAlcanceKm: 5, custoCreditos: 10, dataInicio: now, dataFim: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    { lojaId: loja1.id, produtoId: createdProdutos[1].id, titulo: 'Arroz Tio João 5kg', descricao: 'Arroz tipo 1 por R$ 21,99', raioAlcanceKm: 5, custoCreditos: 10, dataInicio: now, dataFim: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) },
    { lojaId: loja1.id, produtoId: createdProdutos[4].id, titulo: 'Açúcar União 1kg', descricao: 'Açúcar refinado por R$ 2,99', raioAlcanceKm: 3, custoCreditos: 5, dataInicio: now, dataFim: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    { lojaId: loja2.id, produtoId: createdProdutos[5].id, titulo: 'Café Pilão Seleção 500g', descricao: 'Café torrado moído premium por R$ 18,99', raioAlcanceKm: 8, custoCreditos: 15, dataInicio: now, dataFim: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) },
    { lojaId: loja2.id, produtoId: createdProdutos[12].id, titulo: 'Coca-Cola 2L Gelada', descricao: 'Refrigerante Coca-Cola 2L por R$ 6,99', raioAlcanceKm: 5, custoCreditos: 8, dataInicio: now, dataFim: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
    { lojaId: loja2.id, produtoId: createdProdutos[8].id, titulo: 'Sabão Omo Progress 800g', descricao: 'Sabão em pó Omo por R$ 15,99', raioAlcanceKm: 5, custoCreditos: 10, dataInicio: now, dataFim: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[2].id, titulo: 'Feijão Camil 1kg', descricao: 'Feijão carioca por apenas R$ 6,99', raioAlcanceKm: 10, custoCreditos: 20, dataInicio: now, dataFim: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[6].id, titulo: 'Macarrão Adria 500g', descricao: 'Espaguete Adria por R$ 3,49', raioAlcanceKm: 8, custoCreditos: 8, dataInicio: now, dataFim: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[10].id, titulo: 'Papel Higiênico Neve 12 rolos', descricao: 'Papel higiênico folha dupla por R$ 14,99', raioAlcanceKm: 7, custoCreditos: 12, dataInicio: now, dataFim: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[13].id, titulo: 'Suco Del Valle 1L', descricao: 'Suco de laranja integral por R$ 5,49', raioAlcanceKm: 5, custoCreditos: 6, dataInicio: now, dataFim: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000) },
  ];

  for (const a of anunciosData) {
    await db.insert(schema.anuncios).values({
      lojaId: a.lojaId,
      produtoId: a.produtoId,
      titulo: a.titulo,
      descricao: a.descricao,
      raioAlcanceKm: a.raioAlcanceKm,
      custoCreditos: a.custoCreditos,
      dataInicio: a.dataInicio,
      dataFim: a.dataFim,
      status: 'ativo',
    });
  }

  console.log(`📢 ${anunciosData.length} anúncios criados`);
  console.log('');
  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Credenciais de teste:');
  console.log('   Consumidor: maria@email.com / 123456');
  console.log('   Lojista: joao@email.com / 123456 (Mercado do João + Empório)');
  console.log('   Lojista: supercentro@email.com / 123456 (Super Centro Atacado)');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
