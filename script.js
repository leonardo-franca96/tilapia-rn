function numero(id) {
  const valor = document.getElementById(id).value.trim().replace(',', '.');
  const convertido = Number(valor);

  if (valor === '' || Number.isNaN(convertido)) {
    return null;
  }

  return convertido;
}

function classeCor(classificacao) {
  const texto = classificacao.toLowerCase();

  if (texto.includes('crítico') || texto.includes('critica') || texto.includes('crítica')) {
    return 'vermelho';
  }

  if (texto.includes('atenção') || texto.includes('baixo') || texto.includes('ácido') || texto.includes('básico')) {
    return 'amarelo';
  }

  return 'verde';
}

function criarItem(titulo, valor, faixa, classificacao) {
  const cor = classeCor(classificacao);

  return `
    <div class="item-resultado ${cor}">
      <h3>${titulo}</h3>
      <p><strong>Valor informado:</strong> ${valor}</p>
      <p><strong>Faixa de referência:</strong> ${faixa}</p>
      <p><strong>Classificação:</strong> ${classificacao}</p>
    </div>
  `;
}

function avaliarTemperatura(temp) {
  if (temp <= 24) return ['≤ 24,0 ou ≥ 32,0 °C', 'Crítico'];
  if (temp > 24 && temp <= 28) return ['> 24,0 e ≤ 28,0 °C', 'Ótimo'];
  if (temp > 28 && temp < 32) return ['> 28,0 e < 32,0 °C', 'Bom'];
  return ['≤ 24,0 ou ≥ 32,0 °C', 'Crítico'];
}

function avaliarTransparencia(valor) {
  if (valor < 20) return ['20 a 50 cm', 'Turbidez excessiva (Crítico)'];
  if (valor <= 50) return ['20 a 50 cm', 'Transparência adequada'];
  return ['20 a 50 cm', 'Transparência excessiva (Crítico)'];
}

function avaliarPH(ph) {
  if (ph < 6.5) return ['6,5 a 8,0', 'Ácido'];
  if (ph <= 8) return ['6,5 a 8,0', 'Adequado'];
  return ['6,5 a 8,0', 'Básico'];
}

function avaliarOxigenio(od) {
  if (od > 5) return ['> 5,0 mg/L', 'Ótimo'];
  if (od >= 4) return ['4,0 a 5,0 mg/L', 'Bom'];
  if (od >= 3) return ['3,0 a 4,0 mg/L', 'Baixo'];
  return ['< 3,0 mg/L', 'Crítico'];
}

function fracaoAmoniaNaoIonizada(temp, ph) {
  // Equação baseada em Emerson et al. (1975), usando pKa dependente da temperatura.
  const temperaturaKelvin = temp + 273.15;
  const pKa = 0.09018 + (2729.92 / temperaturaKelvin);
  const fracao = 1 / (1 + Math.pow(10, pKa - ph));
  return fracao;
}

function avaliarAmonia(amoniaTotal, temp, ph) {
  const fracao = fracaoAmoniaNaoIonizada(temp, ph);
  const amoniaToxica = amoniaTotal * fracao;
  const classificacao = amoniaToxica < 0.2 ? 'Adequada' : 'Crítica';

  return {
    fracao,
    amoniaToxica,
    classificacao,
    faixa: '< 0,20 mg/L adequada; ≥ 0,20 mg/L crítica'
  };
}

function avaliarQualidadeAgua() {
  const temp = numero('tempAgua');
  const transparencia = numero('transparencia');
  const ph = numero('ph');
  const oxigenio = numero('oxigenio');
  const amoniaTotal = numero('amoniaTotal');
  const resultado = document.getElementById('resultadoAgua');

  if ([temp, transparencia, ph, oxigenio, amoniaTotal].includes(null)) {
    resultado.innerHTML = '<div class="item-resultado vermelho"><strong>Preencha todos os campos corretamente.</strong></div>';
    return;
  }

  const tempAval = avaliarTemperatura(temp);
  const transAval = avaliarTransparencia(transparencia);
  const phAval = avaliarPH(ph);
  const odAval = avaliarOxigenio(oxigenio);
  const amoniaAval = avaliarAmonia(amoniaTotal, temp, ph);

  const classificacoes = [
    tempAval[1],
    transAval[1],
    phAval[1],
    odAval[1],
    amoniaAval.classificacao
  ];

  const temCritico = classificacoes.some(c => c.toLowerCase().includes('crític'));
  const temAtencao = classificacoes.some(c => {
    const t = c.toLowerCase();
    return t.includes('baixo') || t.includes('ácido') || t.includes('básico');
  });

  let interpretacao = '';

  if (temCritico) {
    interpretacao = 'A qualidade da água apresenta condições críticas. Recomenda-se verificar imediatamente os parâmetros em vermelho, considerar renovação parcial da água, melhorar aeração e reduzir ou suspender temporariamente a alimentação quando necessário.';
  } else if (temAtencao) {
    interpretacao = 'A qualidade da água encontra-se utilizável, mas exige atenção. Recomenda-se monitorar os parâmetros em amarelo e acompanhar o comportamento dos peixes.';
  } else {
    interpretacao = 'A qualidade da água encontra-se adequada para o cultivo de tilápias. Mantenha o monitoramento periódico.';
  }

  resultado.innerHTML = `
    ${criarItem('Temperatura', `${temp.toFixed(2)} °C`, tempAval[0], tempAval[1])}
    ${criarItem('Transparência', `${transparencia.toFixed(2)} cm`, transAval[0], transAval[1])}
    ${criarItem('pH', ph.toFixed(2), phAval[0], phAval[1])}
    ${criarItem('Oxigênio Dissolvido', `${oxigenio.toFixed(2)} mg/L`, odAval[0], odAval[1])}
    ${criarItem('Amônia Tóxica NH₃', `${amoniaAval.amoniaToxica.toFixed(4)} mg/L`, amoniaAval.faixa, amoniaAval.classificacao)}
    <div class="interpretacao">
      <h3>Interpretação Geral da Água</h3>
      <p>${interpretacao}</p>
      <p><strong>Fração NH₃ calculada:</strong> ${(amoniaAval.fracao * 100).toFixed(2)}%</p>
    </div>
  `;
}

const tabelaRacao = [
  { min: 1, max: 5, tipo: 'Pó 42% PB', refeicoes: 5, percentual: 14.0 },
  { min: 5, max: 10, tipo: '2-3 mm 42% PB', refeicoes: 4, percentual: 8.0 },
  { min: 10, max: 20, tipo: '2-3 mm 42% PB', refeicoes: 3, percentual: 5.0 },
  { min: 20, max: 50, tipo: '2-3 mm 42% PB', refeicoes: 3, percentual: 4.5 },
  { min: 50, max: 150, tipo: '3-4 mm 36% PB', refeicoes: 3, percentual: 3.4 },
  { min: 150, max: 250, tipo: '4-6 mm 32% PB', refeicoes: 3, percentual: 3.0 },
  { min: 250, max: 400, tipo: '4-6 mm 28-32% PB', refeicoes: 2, percentual: 2.2 },
  { min: 400, max: 600, tipo: '4-6 mm 28-32% PB', refeicoes: 2, percentual: 1.4 },
  { min: 600, max: 800, tipo: '4-6 mm 28-32% PB', refeicoes: 2, percentual: 1.0 },
  { min: 800, max: 1300, tipo: '6-8 mm 28-32% PB', refeicoes: 2, percentual: 0.8 },
  { min: 1300, max: 1800, tipo: '6-8 mm 28-32% PB', refeicoes: 2, percentual: 0.6 }
];

function definirFase(peso) {
  if (peso >= 1 && peso <= 30) return 'Recria';
  if (peso > 30 && peso <= 250) return 'Juvenil';
  if (peso > 250) return 'Terminação';
  return 'Fora da faixa';
}

function buscarRacao(peso) {
  return tabelaRacao.find(item => peso >= item.min && peso <= item.max);
}

function ajusteTemperatura(temp) {
  if (temp >= 20 && temp <= 24) {
    return { fator: 0.8, texto: 'Reduzir 20%' };
  }

  if (temp >= 25 && temp <= 29) {
    return { fator: 1, texto: 'Fornecer 100%' };
  }

  if (temp > 29 && temp <= 32) {
    return { fator: 0.8, texto: 'Reduzir 20%' };
  }

  if (temp > 32) {
    return { fator: 0, texto: 'Suspender alimentação' };
  }

  return { fator: 0.8, texto: 'Temperatura abaixo da faixa ideal. Reduzir alimentação e monitorar os peixes.' };
}

function horariosSugeridos(refeicoes) {
  const opcoes = {
    2: ['08:00', '16:00'],
    3: ['08:00', '12:00', '16:00'],
    4: ['08:00', '11:00', '14:00', '17:00'],
    5: ['08:00', '10:00', '12:00', '14:00', '16:00']
  };

  return opcoes[refeicoes] || ['08:00', '12:00', '16:00'];
}

function calcularManejoAlimentar() {
  const qtdPeixes = numero('qtdPeixes');
  const pesoMedio = numero('pesoMedio');
  const temp = numero('tempManejo');
  const resultado = document.getElementById('resultadoManejo');

  if ([qtdPeixes, pesoMedio, temp].includes(null)) {
    resultado.innerHTML = '<div class="item-resultado vermelho"><strong>Preencha todos os campos corretamente.</strong></div>';
    return;
  }

  const racao = buscarRacao(pesoMedio);

  if (!racao) {
    resultado.innerHTML = '<div class="item-resultado vermelho"><strong>Peso médio fora da tabela de arraçoamento. Use valores entre 1 g e 1800 g.</strong></div>';
    return;
  }

  const fase = definirFase(pesoMedio);
  const biomassa = (qtdPeixes * pesoMedio) / 1000;
  const racaoDiariaBase = biomassa * (racao.percentual / 100);
  const ajuste = ajusteTemperatura(temp);
  const racaoDiariaAjustada = racaoDiariaBase * ajuste.fator;
  const racaoPorRefeicao = racaoDiariaAjustada / racao.refeicoes;
  const horarios = horariosSugeridos(racao.refeicoes);

  resultado.innerHTML = `
    <div class="item-resultado verde">
      <h3>Resultado do Manejo Alimentar</h3>
      <p><strong>Fase:</strong> ${fase}</p>
      <p><strong>Biomassa:</strong> ${biomassa.toFixed(2)} kg</p>
      <p><strong>Tipo de ração:</strong> ${racao.tipo}</p>
      <p><strong>Taxa de arraçoamento:</strong> ${racao.percentual.toFixed(1)}% PV/dia</p>
      <p><strong>Refeições por dia:</strong> ${racao.refeicoes}</p>
      <p><strong>Ração diária base:</strong> ${racaoDiariaBase.toFixed(2)} kg/dia</p>
      <p><strong>Ajuste pela temperatura:</strong> ${ajuste.texto}</p>
      <p><strong>Ração diária ajustada:</strong> ${racaoDiariaAjustada.toFixed(2)} kg/dia</p>
      <p><strong>Ração por refeição:</strong> ${racaoPorRefeicao.toFixed(2)} kg</p>
      <p><strong>Horários sugeridos:</strong> ${horarios.join(', ')}</p>
    </div>

    <div class="interpretacao">
      <h3>Recomendações automáticas</h3>
      <ul>
        <li>Distribuir a ração gradualmente.</li>
        <li>Fornecer em vários pontos do viveiro.</li>
        <li>Observar a atividade alimentar dos peixes.</li>
        <li>Evitar fornecer toda a ração em um único local.</li>
        <li>Após fornecer a ração, aguarde aproximadamente 10 minutos e observe o consumo.</li>
        <li>Se houver sobras, reduza em 10% a quantidade da próxima refeição.</li>
        <li>Se não houver sobras, mantenha a quantidade programada.</li>
      </ul>
    </div>
  `;
}
