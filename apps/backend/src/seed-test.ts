import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@precoreal/shared';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://precoreal:postgres@localhost:5432/precoreal',
  max: 5,
});

const db = drizzle(pool, { schema });

async function seedTest() {
  console.log('🧪 Populando dados de teste...');

  // Limpa dados do seed-test (apenas o que criamos)
  await db.delete(schema.anuncios);
  await db.delete(schema.lojas);
  await db.delete(schema.produtos);
  await db.delete(schema.usuarios);
  console.log('📦 Dados limpos');

  const senhaHash = await bcrypt.hash('123456', 10);

  // ─── USUÁRIO LOJISTA ───
  const [lojista] = await db.insert(schema.usuarios).values({
    nome: 'Lojista Teste',
    email: 'lojista@test.com',
    senhaHash,
    tipo: 'lojista',
    saldoCreditos: 500,
    quantidadeDiamantes: 10,
  }).returning();

  console.log(`👤 Lojista criado: lojista@test.com / 123456 (id: ${lojista.id})`);

  // ─── LOJA COM LOGO E TABLOIDE ───
  const [loja] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista.id,
    nome: 'Mercado do Teste',
    descricao: 'Mercado completo com ofertas imperdíveis.',
    enderecoRua: 'Av. Conselheiro Nébias',
    enderecoNumero: '500',
    enderecoBairro: 'Centro',
    enderecoCidade: 'Santos',
    enderecoEstado: 'SP',
    enderecoCep: '11015001',
    localizacao: 'SRID=4326;POINT(-46.3440 -23.9410)',
    perimetroRaioMetros: 300,
    logoUrl: 'https://placehold.co/200x200/1a3c5e/fff?text=M',
    tabloideUrl: 'https://placehold.co/600x400/eee/333?text=Tabloide+de+Ofertas',
  }).returning();

  console.log(`🏪 Loja criada: ${loja.nome} (id: ${loja.id})`);

  // ─── PRODUTOS (mínimos para anúncios) ───
  const produtosData = [
    { codigoBarras: '7890000000011', nome: 'Arroz Branco 5kg', descricao: 'Arroz tipo 1', categoria: 'Grãos', marca: 'Tio João', precoMedio: 2599 },
    { codigoBarras: '7890000000028', nome: 'Café Torrado 500g', descricao: 'Café torrado moído', categoria: 'Cafés', marca: 'Pilão', precoMedio: 1599 },
    { codigoBarras: '7890000000035', nome: 'Leite Integral 1L', descricao: 'Leite integral', categoria: 'Laticínios', marca: 'Italac', precoMedio: 499 },
  ];

  const createdProdutos: (typeof schema.produtos.$inferSelect)[] = [];
  for (const p of produtosData) {
    const [prod] = await db.insert(schema.produtos).values(p).returning();
    createdProdutos.push(prod);
  }

  console.log(`📦 ${createdProdutos.length} produtos criados`);

  // ─── ANÚNCIOS (1 de cada tipo) ───
  const now = new Date();
  const anunciosData = [
    {
      lojaId: loja.id,
      produtoId: createdProdutos[0].id,
      titulo: 'Arroz Tio João 5kg',
      descricao: 'Arroz tipo 1 com 15% OFF — R$ 21,99',
      tipo: 'oferta' as const,
      raioAlcanceKm: 3,
      custoCreditos: 1,
      dataInicio: now,
      dataFim: new Date(now.getTime() + 10 * 86400000),
      status: 'ativo' as const,
    },
    {
      lojaId: loja.id,
      produtoId: createdProdutos[1].id,
      titulo: 'Café Pilão 500g',
      descricao: 'Café premium por R$ 12,99 — válido por 7 dias',
      tipo: 'promocao' as const,
      raioAlcanceKm: 5,
      custoCreditos: 3,
      dataInicio: now,
      dataFim: new Date(now.getTime() + 6 * 86400000),
      status: 'ativo' as const,
    },
    {
      lojaId: loja.id,
      produtoId: createdProdutos[2].id,
      titulo: '⚡ Leite Integral 1L',
      descricao: 'Leite integral por apenas R$ 3,49 — promoção relâmpago!',
      tipo: 'promocao_relampago' as const,
      raioAlcanceKm: 10,
      custoCreditos: 5,
      dataInicio: now,
      dataFim: new Date(now.getTime() + 2 * 86400000),
      status: 'ativo' as const,
    },
  ];

  const createdIds: string[] = [];
  for (const a of anunciosData) {
    const [anuncio] = await db.insert(schema.anuncios).values(a).returning();
    createdIds.push(anuncio.id);
  }

  console.log(`📢 ${anunciosData.length} anúncios criados (1 oferta, 1 promoção, 1 relâmpago)`);

  console.log('');
  console.log('✅ Seed de teste concluído!');
  console.log('');
  console.log('📋 Credenciais:');
  console.log('   Lojista: lojista@test.com / 123456');
  console.log(`   Loja ID: ${loja.id}`);
  console.log(`   Anúncio IDs: ${createdIds.join(', ')}`);
  console.log('');
  console.log('🔗 Fluxo de teste:');
  console.log('   1. Login como lojista@test.com / 123456');
  console.log('   2. Dashboard → ver métricas');
  console.log(`   3. /lojista/anuncios → ver 3 anúncios, clicar "Renovar"`);
  console.log(`   4. /loja/${loja.id} (sem login) → perfil público com logo, endereço, tabloide`);
  console.log(`   5. /lojista/${loja.id}/editar → alterar dados da loja`);
  console.log('');

  await pool.end();
}

seedTest().catch((err) => {
  console.error('❌ Erro no seed de teste:', err);
  process.exit(1);
});
