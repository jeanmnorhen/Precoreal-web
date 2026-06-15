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
  await db.delete(schema.funcionariosLojas);
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
    saldoCreditos: 500,
    quantidadeDiamantes: 10,
  }).returning();

  const [lojista2] = await db.insert(schema.usuarios).values({
    nome: 'Supermercado Centro',
    email: 'supercentro@email.com',
    senhaHash,
    tipo: 'lojista',
    saldoCreditos: 1000,
    quantidadeDiamantes: 20,
  }).returning();

  const [funcionario] = await db.insert(schema.usuarios).values({
    nome: 'Carlos Funcionário',
    email: 'funcionario@email.com',
    senhaHash,
    tipo: 'funcionario',
    saldoCreditos: 0,
    quantidadeDiamantes: 0,
  }).returning();

  const [admin] = await db.insert(schema.usuarios).values({
    nome: 'Admin Sistema',
    email: 'admin@precoreal.app',
    senhaHash,
    tipo: 'admin',
    saldoCreditos: 0,
    quantidadeDiamantes: 0,
  }).returning();

  console.log('👤 Usuários criados:');
  console.log(`   Consumidor: maria@email.com / 123456 (id: ${consumidor.id})`);
  console.log(`   Lojista: joao@email.com / 123456 (id: ${lojista.id})`);
  console.log(`   Lojista2: supercentro@email.com / 123456 (id: ${lojista2.id})`);
  console.log(`   Funcionário: funcionario@email.com / 123456 (id: ${funcionario.id})`);
  console.log(`   Admin: admin@precoreal.app / 123456 (id: ${admin.id})`);

  // ─── LOJAS (em Santos, SP — próximas à localização de teste -23.941574, -46.34396) ───
  const [loja1] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista.id,
    nome: 'Mercado do João',
    descricao: 'Mercado de bairro com preços justos e produtos frescos.',
    enderecoRua: 'Av. Conselheiro Nébias',
    enderecoNumero: '500',
    enderecoBairro: 'Centro',
    enderecoCidade: 'Santos',
    enderecoEstado: 'SP',
    enderecoCep: '11015001',
    localizacao: 'SRID=4326;POINT(-46.3440 -23.9410)',
    perimetroRaioMetros: 300,
  }).returning();

  const [loja2] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista.id,
    nome: 'Empório do João',
    descricao: 'Empório com produtos gourmet e importados.',
    enderecoRua: 'Av. Ana Costa',
    enderecoNumero: '200',
    enderecoBairro: 'Gonzaga',
    enderecoCidade: 'Santos',
    enderecoEstado: 'SP',
    enderecoCep: '11060001',
    localizacao: 'SRID=4326;POINT(-46.3283 -23.9633)',
    perimetroRaioMetros: 200,
  }).returning();

  const [loja3] = await db.insert(schema.lojas).values({
    usuarioProprietarioId: lojista2.id,
    nome: 'Super Centro Atacado',
    descricao: 'Atacado e varejo com os menores preços da região.',
    enderecoRua: 'Av. Bartolomeu de Gusmão',
    enderecoNumero: '100',
    enderecoBairro: 'Ponta da Praia',
    enderecoCidade: 'Santos',
    enderecoEstado: 'SP',
    enderecoCep: '11030001',
    localizacao: 'SRID=4326;POINT(-46.3167 -23.9667)',
    perimetroRaioMetros: 500,
  }).returning();

  console.log('🏪 Lojas criadas:', loja1.nome, '/', loja2.nome, '/', loja3.nome);

  // ─── VÍNCULO FUNCIONÁRIO ───
  const turnosFuncionario = [
    JSON.stringify({ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' }),
    JSON.stringify({ diaSemana: 2, horaInicio: '08:00', horaFim: '18:00' }),
    JSON.stringify({ diaSemana: 3, horaInicio: '08:00', horaFim: '18:00' }),
    JSON.stringify({ diaSemana: 4, horaInicio: '08:00', horaFim: '18:00' }),
    JSON.stringify({ diaSemana: 5, horaInicio: '08:00', horaFim: '18:00' }),
    JSON.stringify({ diaSemana: 6, horaInicio: '08:00', horaFim: '12:00' }),
  ];

  await db.insert(schema.funcionariosLojas).values({
    usuarioId: funcionario.id,
    lojaId: loja1.id,
    turnos: turnosFuncionario,
  }).returning();

  console.log('🔗 Vínculo funcionário → Mercado do João criado (seg-sex 08-18, sáb 08-12)');

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

  // ─── ANÚNCIOS (com tipo variado) ───
  const now = new Date();
  const anunciosData = [
    // Ofertas (15d máx, 1 crédito mín, 3km máx)
    { lojaId: loja1.id, produtoId: createdProdutos[1].id, titulo: 'Arroz Tio João 5kg', descricao: 'Arroz tipo 1 por R$ 21,99', tipo: 'oferta' as const, raioAlcanceKm: 3, custoCreditos: 1, dataInicio: now, dataFim: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) },
    { lojaId: loja1.id, produtoId: createdProdutos[4].id, titulo: 'Açúcar União 1kg', descricao: 'Açúcar refinado por R$ 2,99', tipo: 'oferta' as const, raioAlcanceKm: 2, custoCreditos: 1, dataInicio: now, dataFim: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    { lojaId: loja1.id, produtoId: createdProdutos[9].id, titulo: 'Detergente Ypê 500ml', descricao: 'Detergente líquido por R$ 1,99', tipo: 'oferta' as const, raioAlcanceKm: 3, custoCreditos: 1, dataInicio: now, dataFim: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) },
    // Promoções (7d máx, 3 créditos mín, 5km máx)
    { lojaId: loja2.id, produtoId: createdProdutos[5].id, titulo: 'Café Pilão Seleção 500g', descricao: 'Café torrado moído premium por R$ 18,99', tipo: 'promocao' as const, raioAlcanceKm: 5, custoCreditos: 3, dataInicio: now, dataFim: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000) },
    { lojaId: loja2.id, produtoId: createdProdutos[12].id, titulo: 'Coca-Cola 2L Gelada', descricao: 'Refrigerante Coca-Cola 2L por R$ 6,99', tipo: 'promocao' as const, raioAlcanceKm: 5, custoCreditos: 3, dataInicio: now, dataFim: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000) },
    { lojaId: loja2.id, produtoId: createdProdutos[10].id, titulo: 'Papel Higiênico Neve 12 rolos', descricao: 'Papel higiênico folha dupla por R$ 14,99', tipo: 'promocao' as const, raioAlcanceKm: 5, custoCreditos: 4, dataInicio: now, dataFim: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    // Promoções Relâmpago (3d máx, 5 créditos mín, 10km máx)
    { lojaId: loja3.id, produtoId: createdProdutos[2].id, titulo: '⚡ Feijão Camil 1kg', descricao: 'Feijão carioca por apenas R$ 5,99', tipo: 'promocao_relampago' as const, raioAlcanceKm: 10, custoCreditos: 5, dataInicio: now, dataFim: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[6].id, titulo: '⚡ Macarrão Adria 500g', descricao: 'Espaguete Adria por R$ 2,99', tipo: 'promocao_relampago' as const, raioAlcanceKm: 8, custoCreditos: 5, dataInicio: now, dataFim: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) },
    { lojaId: loja3.id, produtoId: createdProdutos[13].id, titulo: '⚡ Suco Del Valle 1L', descricao: 'Suco de laranja integral por R$ 4,49', tipo: 'promocao_relampago' as const, raioAlcanceKm: 10, custoCreditos: 6, dataInicio: now, dataFim: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) },
    // Oferta extra
    { lojaId: loja3.id, produtoId: createdProdutos[8].id, titulo: 'Sabão Omo 800g', descricao: 'Sabão em pó Omo por R$ 12,99', tipo: 'oferta' as const, raioAlcanceKm: 3, custoCreditos: 1, dataInicio: now, dataFim: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
  ];

  for (const a of anunciosData) {
    await db.insert(schema.anuncios).values({
      lojaId: a.lojaId,
      produtoId: a.produtoId,
      titulo: a.titulo,
      descricao: a.descricao,
      tipo: a.tipo,
      raioAlcanceKm: a.raioAlcanceKm,
      custoCreditos: a.custoCreditos,
      dataInicio: a.dataInicio,
      dataFim: a.dataFim,
      status: 'ativo',
    });
  }

  console.log(`📢 ${anunciosData.length} anúncios criados (3 ofertas, 3 promoções, 3 relâmpago, 1 oferta)`);
  console.log('');
  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Credenciais de teste:');
  console.log('   Consumidor: maria@email.com / 123456');
  console.log('   Lojista: joao@email.com / 123456 (Mercado do João + Empório)');
  console.log('   Lojista: supercentro@email.com / 123456 (Super Centro Atacado)');
  console.log('   Funcionário: funcionario@email.com / 123456 (Mercado do João)');
  console.log('   Admin: admin@precoreal.app / 123456');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
