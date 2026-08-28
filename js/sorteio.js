/**
 * Chave — Motor de Sorteio (Fase 1)
 * Generaliza o motor "Campo Suíço" do Rachômetro (que só fazia 2 times)
 * para N times de tamanho configurável, a partir da lista de participantes.
 *
 * Regras de negócio já fechadas com o cliente:
 * - Sobra (divisão não fecha): retorna os excedentes separados, não erro.
 * - Escassez de posição: sorteia mesmo assim, sinaliza quais times ficaram
 *   sem aquela posição (ex: sem goleiro) para resolução manual do admin.
 * - Esportes individuais (sem posição, ex: tênis): balanceia só por nível.
 */

const POSICOES_ORDEM = ['GOL', 'ZAG', 'MEI', 'ATA'];

/**
 * @param {Array} participantes - [{id, nome, nivel_tecnico, posicao}]
 * @param {number} tamanhoTime - quantos participantes por time
 * @param {object} opcoes - { usarPosicao: boolean, nomesTimes: string[] }
 * @returns {{
 *   times: Array<{nome:string, jogadores:Array, nivelMedio:number, posicoesFaltando:string[]}>,
 *   sobra: Array,
 *   numTimes: number,
 *   avisoSobra: string|null,
 *   avisoPosicao: string|null
 * }}
 */
function sortearTimes(participantes, tamanhoTime, opcoes = {}) {
  const usarPosicao = opcoes.usarPosicao !== false; // default true (esporte coletivo)
  const total = participantes.length;

  if (tamanhoTime < 1) throw new Error('tamanhoTime precisa ser >= 1');
  if (total < tamanhoTime) {
    return {
      times: [],
      sobra: [...participantes],
      numTimes: 0,
      avisoSobra: `Só há ${total} participante(s) cadastrado(s), menos que o tamanho de time definido (${tamanhoTime}). Cadastre mais participantes ou reduza o tamanho do time.`,
      avisoPosicao: null,
    };
  }

  const numTimes = Math.floor(total / tamanhoTime);
  const numAlocaveis = numTimes * tamanhoTime;
  const qtdSobra = total - numAlocaveis;

  // Ordena por nível (desc) para poder distribuir em zigue-zague (snake draft)
  // — garante que times não fiquem muito desbalanceados em nível técnico.
  const ordenados = [...participantes].sort((a, b) => (b.nivel_tecnico || 0) - (a.nivel_tecnico || 0));

  // Só os "alocáveis" entram no sorteio; o restante vira sobra.
  // Reserva-se primeiro os melhores/posições críticas proporcionalmente:
  // fatia simplesmente os N*tamanhoTime primeiros após ordenar por nível
  // dentro de cada posição (ver distribuição abaixo).
  let pool = ordenados;
  let sobra = [];

  if (qtdSobra > 0) {
    // Deixa de fora os últimos da lista (nível mais baixo) como sobra,
    // mantendo o pool de alocação com o tamanho exato necessário.
    pool = ordenados.slice(0, numAlocaveis);
    sobra = ordenados.slice(numAlocaveis);
  }

  const nomesTimes = opcoes.nomesTimes || Array.from({ length: numTimes }, (_, i) => `Time ${i + 1}`);
  const cores = opcoes.cores || Array.from({ length: numTimes }, () => '#7E9488');

  const times = nomesTimes.slice(0, numTimes).map((nome, i) => ({
    nome,
    cor: cores[i] || '#7E9488',
    jogadores: [],
  }));

  const distribuirBucket = (bucket, estado) => {
    // snake draft: 0,1,2,...,N-1,N-1,...,2,1,0,0,1,2,...
    // IMPORTANTE: o estado (idx/dir) é compartilhado entre buckets de posição
    // diferentes — se resetar a cada posição, os restos de buckets que não são
    // múltiplos de numTimes sempre caem nos mesmos times (times "iniciais"
    // ficam sistematicamente maiores). Continuando o zigue-zague, os restos
    // se compensam ao longo das posições.
    for (const p of bucket) {
      times[estado.idx].jogadores.push(p);
      estado.idx += estado.dir;
      if (estado.idx === numTimes) { estado.idx = numTimes - 1; estado.dir = -1; }
      else if (estado.idx === -1) { estado.idx = 0; estado.dir = 1; }
    }
  };

  const estadoSnake = { idx: 0, dir: 1 };

  if (usarPosicao) {
    for (const pos of POSICOES_ORDEM) {
      const bucket = pool
        .filter((p) => p.posicao === pos)
        .sort((a, b) => (b.nivel_tecnico || 0) - (a.nivel_tecnico || 0));
      distribuirBucket(bucket, estadoSnake);
    }
    // participantes sem posição definida (não deveria acontecer em esporte coletivo,
    // mas evita perder gente cadastrada sem esse campo preenchido)
    const semPosicao = pool.filter((p) => !POSICOES_ORDEM.includes(p.posicao));
    distribuirBucket(semPosicao, estadoSnake);
  } else {
    // esporte individual: só balanceia por nível técnico
    distribuirBucket(pool, estadoSnake);
  }

  // Diagnóstico de escassez de posição por time
  let timesComFalta = [];
  if (usarPosicao) {
    times.forEach((t) => {
      const posicoesFaltando = POSICOES_ORDEM.filter(
        (pos) => !t.jogadores.some((j) => j.posicao === pos)
      );
      t.posicoesFaltando = posicoesFaltando;
      if (posicoesFaltando.length > 0) timesComFalta.push({ time: t.nome, faltando: posicoesFaltando });
    });
  }

  times.forEach((t) => {
    const soma = t.jogadores.reduce((s, j) => s + (j.nivel_tecnico || 0), 0);
    t.nivelMedio = t.jogadores.length ? Number((soma / t.jogadores.length).toFixed(1)) : 0;
  });

  const avisoSobra =
    qtdSobra > 0
      ? `${qtdSobra} participante(s) ficaram sem time (a divisão de ${total} por ${tamanhoTime} não fecha exata). Aloque manualmente como reserva de algum time, se quiser.`
      : null;

  const avisoPosicao =
    timesComFalta.length > 0
      ? `Faltam jogadores de posição específica para cobrir todos os times: ${timesComFalta
          .map((t) => `${t.time} sem ${t.faltando.join('/')}`)
          .join('; ')}. Defina manualmente quando resolver.`
      : null;

  return { times, sobra, numTimes, avisoSobra, avisoPosicao };
}

module.exports = { sortearTimes };

// Compatível também com uso direto no navegador (sem bundler/build step),
// igual ao padrão já usado no Rachômetro e no Evvo — expõe em window.Chave.
if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.sortearTimes = sortearTimes;
}
