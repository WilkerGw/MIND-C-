describe('Fluxo Completo do Sistema OticaERP', () => {

  // --- DADOS DE TESTE ---
  const LOGIN = { user: 'admin', pass: '123' };

  const CLIENTE = {
    nome: 'Wilker Martind',
    cpf: '10097016659',
    nascimento: '1990-01-01',
    telefone: '11999999999',
    cep: '03221200',
    rua: 'Rua Rosicler',
    bairro: 'Jd Guairaca',
    cidade: 'São Paulo'
  };

  const PRODUTO = {
    nome: 'Arm Masc 123456 C5',
    codigo: '0101',
    categoria: 'Armação',
    precoCusto: '50',
    precoVenda: '150',
    estoque: '100'
  };

  it('Deve percorrer todo o ciclo: Login -> Cliente -> Produto -> Venda -> Agenda -> Receita', () => {

    // Intercepts
    cy.intercept('POST', '**/api/clients').as('createClient');
    cy.intercept('GET', '**/api/clients/cpf/**').as('searchClient');
    cy.intercept('POST', '**/api/auth/login').as('loginReq');

    // ============================================================
    // 1. LOGIN
    // ============================================================
    cy.visit('http://127.0.0.1:5173');

    cy.get('input[type="text"]').clear().type(LOGIN.user);
    cy.get('input[type="password"]').clear().type(LOGIN.pass);

    cy.on('window:alert', () => true);

    cy.contains('Criar conta de teste', { matchCase: false }).click();
    cy.wait(1000);

    cy.get('button[type="submit"]').click();
    cy.wait('@loginReq');

    cy.contains('span', 'Clientes', { timeout: 15000 }).should('be.visible');

    // ============================================================
    // 2. CADASTRAR CLIENTE
    // ============================================================
    cy.log('--- Cadastrando Cliente ---');
    cy.contains('span', 'Clientes').click();
    cy.contains('label', 'Nome Completo', { timeout: 10000 }).should('be.visible');

    cy.contains('label', 'Nome Completo').parent().find('input').type(CLIENTE.nome);
    cy.contains('label', 'CPF').parent().find('input').type(CLIENTE.cpf);
    cy.contains('label', 'Nascimento').parent().find('input').type(CLIENTE.nascimento);
    cy.contains('label', 'Telefone').parent().find('input').type(CLIENTE.telefone);

    cy.contains('label', 'CEP').parent().find('input').type(CLIENTE.cep);
    cy.contains('label', 'Rua').parent().find('input').type(CLIENTE.rua);
    cy.contains('label', 'Bairro').parent().find('input').type(CLIENTE.bairro);
    cy.contains('label', 'Cidade').parent().find('input').type(CLIENTE.cidade);

    cy.get('button[type="submit"]').click();
    cy.wait('@createClient');
    cy.wait(1000);

    // ============================================================
    // 3. CADASTRAR PRODUTO
    // ============================================================
    cy.log('--- Cadastrando Produto ---');
    cy.contains('span', 'Produtos').click();
    cy.contains('label', 'Nome do Produto', { timeout: 10000 }).should('be.visible');

    cy.contains('label', 'Nome do Produto').parent().find('input').type(PRODUTO.nome);
    cy.contains('label', 'Cód. Produto').parent().find('input').type(PRODUTO.codigo, { force: true });

    cy.contains('label', 'Categoria').parent().click();
    cy.get('ul[role="listbox"]').contains('li', PRODUTO.categoria).click();

    cy.contains('label', 'Preço de Custo').parent().find('input').type(PRODUTO.precoCusto);
    cy.contains('label', 'Preço de Venda').parent().find('input').type(PRODUTO.precoVenda);
    cy.contains('label', 'Qtd. Estoque').parent().find('input').type(PRODUTO.estoque);

    cy.get('button[type="submit"]').click();
    cy.wait(2000);

    // ============================================================
    // 4. REALIZAR VENDA
    // ============================================================
    cy.log('--- Realizando Venda ---');
    cy.contains('span', 'Vendas').click();

    cy.contains('label', 'CPF do Cliente').parent().find('input').type(CLIENTE.cpf).blur();
    cy.wait('@searchClient');

    cy.contains('label', 'Cód. Produto').parent().find('input').type(PRODUTO.codigo).blur();
    cy.wait(2000);

    cy.contains('label', 'Quantidade').parent().find('input').clear().type('2');
    cy.contains('label', 'Valor de Entrada').parent().find('input').clear().type('50');

    cy.contains('button', 'FINALIZAR VENDA').click();
    cy.wait(2000);

    // ============================================================
    // 5. AGENDAMENTO
    // ============================================================
    cy.log('--- Criando Agendamento ---');
    cy.contains('span', 'Agendamentos').click();

    cy.contains('label', 'CPF do Cliente').parent().find('input').type(CLIENTE.cpf).blur();
    cy.wait('@searchClient');

    cy.contains('label', 'Cliente Identificado').parent().find('input')
      .should('have.value', CLIENTE.nome);

    cy.contains('label', 'Data').parent().find('input')
      .click().type('2026-01-11', { force: true });

    cy.contains('label', 'Hora').parent().find('input')
      .click().type('13:00', { force: true });

    cy.contains('label', 'Observação').parent().find('textarea').eq(0)
      .click({ force: true })
      .type('Teste Cypress', { force: true });

    cy.contains('button', 'Confirmar Agendamento')
      .should('be.visible')
      .click();

    cy.wait(1000);

    // ============================================================
    // 6. RECEITA (CORRIGIDO PARA MÚLTIPLOS BLOCOS)
    // ============================================================
    cy.log('--- Registrando Receita ---');
    cy.contains('span', 'Receitas').click();

    cy.contains('label', 'Data do Exame', { timeout: 10000 }).should('be.visible');

    // Busca Cliente
    cy.contains('label', 'CPF do Cliente').parent().find('input')
      .should('be.visible')
      .clear()
      .type(CLIENTE.cpf)
      .blur();

    cy.wait('@searchClient');
    cy.get('input[disabled]').should('have.value', CLIENTE.nome);

    // Data do Exame
    cy.contains('label', 'Data do Exame').parent().find('input')
      .click()
      .type('2025-12-24', { force: true });

    // --- PREENCHIMENTO OLHO DIREITO (Índice 0) ---
    cy.log('Preenchendo OD...');
    // Procura TODOS os labels com o texto, pega o 1º, vai ao pai e preenche
    cy.get('label:contains("Esférico")').eq(0).parent().find('input').type('-1,50', { force: true });
    cy.get('label:contains("Cilíndrico")').eq(0).parent().find('input').type('-0,50', { force: true });
    cy.get('label:contains("Eixo")').eq(0).parent().find('input').type('180', { force: true });

    cy.wait(500);

    // --- PREENCHIMENTO OLHO ESQUERDO (Índice 1) ---
    cy.log('Preenchendo OE...');
    // Procura TODOS os labels com o texto, pega o 2º, vai ao pai e preenche
    cy.get('label:contains("Esférico")').eq(1).parent().find('input').type('-2,00', { force: true });
    cy.get('label:contains("Cilíndrico")').eq(1).parent().find('input').type('-1,50', { force: true });
    cy.get('label:contains("Eixo")').eq(1).parent().find('input').type('80', { force: true });

    // Salvar
    cy.contains('button', 'SALVAR RECEITA').click();

    cy.log('✨ Fluxo Completo Finalizado! ✨');
  });
});