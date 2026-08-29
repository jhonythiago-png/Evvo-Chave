/**
 * Chave — Motor de Cronograma (Fase 2)
 * Calcula o horário de cada jogo e o horário estimado de término do evento,
 * considerando: nº de campos disponíveis, duração de cada partida, intervalo
 * de troca entre jogos, e o intervalo (almoço) do torneio.
 *
 * Não lida com atrasos em tempo real (ex: jogo que foi a pênaltis e atrasou
 * os seguintes) — isso é ajustado ao vivo, jogo a jogo, na Fase 3. Esta função
 * calcula a ESTIMATIVA antes do evento começar.
 */

function hhmmParaMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutosParaHhmm(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * @param {Array<Array<object>>} rodadas - jogos agrupados em rodadas; dentro de
 *   uma mesma rodada nenhum time se repete, então podem correr em campos
 *   diferentes ao mesmo tempo sem conflito.
 * @param {object} config
 *   camposDisponiveis: number
 *   horarioInicio: 'HH:MM'
 *   intervaloInicio: 'HH:MM'|null
 *   intervaloFim: 'HH:MM'|null
 *   duracaoPartidaMin: number (jogos normais)
 *   duracaoFinalMin: number (já incluindo o intervalo de 5min do 2º tempo da final)
 *   intervaloTrocaMin: number
 *   ehFinal: (jogo) => boolean
 * @returns {{ jogosAgendados: Array, horarioTerminoEstimado: string }}
 */
function agendarJogos(rodadas, config) {
  const {
    camposDisponiveis,
    horarioInicio,
    intervaloInicio = null,
    intervaloFim = null,
    retornoAposIntervalo = null, // se null, usa intervaloFim (retorno imediato)
    duracaoPartidaMin,
    duracaoFinalMin,
    intervaloTrocaMin,
    ehFinal = () => false,
  } = config;

  if (camposDisponiveis < 1) throw new Error('camposDisponiveis precisa ser >= 1');

  const inicioMin = hhmmParaMinutos(horarioInicio);
  const intervaloInicioMin = intervaloInicio ? hhmmParaMinutos(intervaloInicio) : null;
  const retornoMin = retornoAposIntervalo
    ? hhmmParaMinutos(retornoAposIntervalo)
    : (intervaloFim ? hhmmParaMinutos(intervaloFim) : null);

  // próximo horário livre de cada campo
  const camposLivres = Array(camposDisponiveis).fill(inicioMin);
  const jogosAgendados = [];

  const ajustarParaForaDoIntervalo = (horario, duracao) => {
    if (intervaloInicioMin === null) return horario;
    // já cai dentro do intervalo
    if (horario >= intervaloInicioMin && horario < retornoMin) return retornoMin;
    // começa antes do intervalo, mas a duração do jogo invadiria o intervalo
    if (horario < intervaloInicioMin && horario + duracao > intervaloInicioMin) return retornoMin;
    return horario;
  };

  for (const rodada of rodadas) {
    for (const jogo of rodada) {
      // escolhe o campo que fica livre mais cedo
      let campoIdx = 0;
      for (let i = 1; i < camposLivres.length; i++) {
        if (camposLivres[i] < camposLivres[campoIdx]) campoIdx = i;
      }

      const duracao = ehFinal(jogo) ? duracaoFinalMin : duracaoPartidaMin;
      const horarioInicioJogo = ajustarParaForaDoIntervalo(camposLivres[campoIdx], duracao);

      jogosAgendados.push({
        ...jogo,
        campo_numero: campoIdx + 1,
        horario_previsto: minutosParaHhmm(horarioInicioJogo),
      });

      camposLivres[campoIdx] = horarioInicioJogo + duracao + intervaloTrocaMin;
    }
  }

  const ultimoFim = Math.max(...camposLivres) - intervaloTrocaMin;
  return {
    jogosAgendados,
    horarioTerminoEstimado: minutosParaHhmm(ultimoFim),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { agendarJogos, hhmmParaMinutos, minutosParaHhmm };
}

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.agendarJogos = agendarJogos;
}
