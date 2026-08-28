/**
 * Chave — Motor de Classificação (Fase 2)
 * Calcula a tabela de um grupo a partir dos jogos encerrados, aplicando os
 * critérios de desempate em cascata definidos com o cliente:
 *   a) pontos
 *   b) saldo de gols
 *   c) gols pró
 *   d) confronto direto (só entre os empatados)
 *   e) sorteio (última instância — precisa de intervenção humana/randômica)
 */

function calcularClassificacao(jogosEncerrados, times, config = {}) {
  const pontosVitoria = config.pontosVitoria ?? 3;
  const pontosEmpate = config.pontosEmpate ?? 1;
  const pontosDerrota = config.pontosDerrota ?? 0;

  const tabela = {};
  times.forEach((t) => {
    tabela[t.id] = {
      time_id: t.id,
      nome: t.nome,
      pj: 0, v: 0, e: 0, d: 0,
      gp: 0, gc: 0, sg: 0, pts: 0,
    };
  });

  for (const jogo of jogosEncerrados) {
    const a = tabela[jogo.time_a_id];
    const b = tabela[jogo.time_b_id];
    if (!a || !b) continue; // jogo de time fora deste grupo, ignora

    a.pj++; b.pj++;
    a.gp += jogo.gols_a; a.gc += jogo.gols_b;
    b.gp += jogo.gols_b; b.gc += jogo.gols_a;

    if (jogo.gols_a > jogo.gols_b) {
      a.v++; a.pts += pontosVitoria;
      b.d++; b.pts += pontosDerrota;
    } else if (jogo.gols_a < jogo.gols_b) {
      b.v++; b.pts += pontosVitoria;
      a.d++; a.pts += pontosDerrota;
    } else {
      a.e++; b.e++;
      a.pts += pontosEmpate; b.pts += pontosEmpate;
    }
  }

  Object.values(tabela).forEach((t) => { t.sg = t.gp - t.gc; });

  // ---- ordenação com critérios em cascata ----
  const linhas = Object.values(tabela);

  function confrontoDireto(idsEmpatados) {
    // saldo de gols só entre os jogos que envolvem exclusivamente os empatados
    const saldoEntreSi = {};
    idsEmpatados.forEach((id) => { saldoEntreSi[id] = 0; });
    for (const jogo of jogosEncerrados) {
      if (idsEmpatados.includes(jogo.time_a_id) && idsEmpatados.includes(jogo.time_b_id)) {
        saldoEntreSi[jogo.time_a_id] += jogo.gols_a - jogo.gols_b;
        saldoEntreSi[jogo.time_b_id] += jogo.gols_b - jogo.gols_a;
      }
    }
    return saldoEntreSi;
  }

  linhas.sort((x, y) => y.pts - x.pts || y.sg - x.sg || y.gp - x.gp);

  // agrupa possíveis empates remanescentes (mesmo pts, sg e gp) para aplicar
  // confronto direto e, por fim, sinalizar necessidade de sorteio
  const avisos = [];
  let i = 0;
  while (i < linhas.length) {
    let j = i;
    while (
      j + 1 < linhas.length &&
      linhas[j + 1].pts === linhas[i].pts &&
      linhas[j + 1].sg === linhas[i].sg &&
      linhas[j + 1].gp === linhas[i].gp
    ) j++;

    if (j > i) {
      const empatados = linhas.slice(i, j + 1);
      const ids = empatados.map((t) => t.time_id);
      const saldoEntreSi = confrontoDireto(ids);
      const aindaEmpatam = new Set();

      empatados.sort((x, y) => saldoEntreSi[y.time_id] - saldoEntreSi[x.time_id]);
      for (let k = 0; k < empatados.length - 1; k++) {
        if (saldoEntreSi[empatados[k].time_id] === saldoEntreSi[empatados[k + 1].time_id]) {
          aindaEmpatam.add(empatados[k].time_id);
          aindaEmpatam.add(empatados[k + 1].time_id);
        }
      }

      for (let k = i; k <= j; k++) linhas[k] = empatados[k - i];

      if (aindaEmpatam.size > 0) {
        const nomes = empatados.filter((t) => aindaEmpatam.has(t.time_id)).map((t) => t.nome);
        avisos.push({
          tipo: 'sorteio_necessario',
          times: nomes,
          mensagem: `${nomes.join(' e ')} seguem empatados em pontos, saldo, gols pró e confronto direto — decisão precisa ser por sorteio.`,
        });
      } else {
        const nomes = empatados.map((t) => t.nome);
        avisos.push({
          tipo: 'confronto_direto_decidiu',
          times: nomes,
          mensagem: `${nomes.join(' e ')} empatavam em pontos, saldo e gols pró — desempatado pelo confronto direto.`,
        });
      }
    }
    i = j + 1;
  }

  return { classificacao: linhas, avisos };
}

module.exports = { calcularClassificacao };

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.calcularClassificacao = calcularClassificacao;
}
