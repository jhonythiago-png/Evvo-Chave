/**
 * Chave — Gerador de confrontos (pontos corridos / round-robin)
 * Dado um grupo de times, gera as rodadas de pontos corridos (todo mundo
 * joga contra todo mundo uma vez), usando o método do círculo — o mesmo
 * usado em campeonatos reais.
 *
 * Funciona com número par ou ímpar de times (ímpar = alguém folga a cada
 * rodada, marcado como "bye").
 */

function gerarRodadasRoundRobin(timeIds) {
  let ids = [...timeIds];
  const TEM_BYE = ids.length % 2 !== 0;
  if (TEM_BYE) ids.push(null); // "bye" — folga

  const n = ids.length;
  const numRodadas = n - 1;
  const metade = n / 2;
  const rodadas = [];

  let arr = [...ids];
  for (let r = 0; r < numRodadas; r++) {
    const confrontosDaRodada = [];
    for (let i = 0; i < metade; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== null && b !== null) confrontosDaRodada.push([a, b]);
    }
    rodadas.push(confrontosDaRodada);

    // rotaciona mantendo o primeiro fixo (método do círculo)
    const fixo = arr[0];
    const resto = arr.slice(1);
    resto.unshift(resto.pop());
    arr = [fixo, ...resto];
  }

  return rodadas;
}

if (typeof module !== 'undefined') {
  module.exports = { gerarRodadasRoundRobin };
}

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.gerarRodadasRoundRobin = gerarRodadasRoundRobin;
}
