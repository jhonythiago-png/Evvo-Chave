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

  // ---- gera avisos explicando QUALQUER empate em pontos, não só os mais
  // apertados — mesmo quando o saldo de gols já resolve sozinho (é o caso
  // mais comum na prática, e o usuário precisa ver o porquê na tela) ----
  const avisos = [];

  function agruparPorChaveIgual(lista, chave) {
    const grupos = [];
    let atual = [lista[0]];
    for (let k = 1; k < lista.length; k++) {
      if (lista[k][chave] === atual[0][chave]) atual.push(lista[k]);
      else { grupos.push(atual); atual = [lista[k]]; }
    }
    grupos.push(atual);
    return grupos;
  }

  const gruposPorPontos = agruparPorChaveIgual(linhas, 'pts');
  gruposPorPontos.forEach((grupoPts) => {
    if (grupoPts.length < 2) return;
    const nomesGrupoPts = grupoPts.map((t) => t.nome);

    const gruposPorSaldo = agruparPorChaveIgual(grupoPts, 'sg');
    if (gruposPorSaldo.length > 1) {
      avisos.push({
        tipo: 'saldo_decidiu',
        times: nomesGrupoPts,
        mensagem: `${nomesGrupoPts.join(' e ')} empataram em pontos (${grupoPts[0].pts}) — desempate pelo saldo de gols.`,
      });
    }

    gruposPorSaldo.forEach((grupoSg) => {
      if (grupoSg.length < 2) return;
      const nomesGrupoSg = grupoSg.map((t) => t.nome);

      const gruposPorGp = agruparPorChaveIgual(grupoSg, 'gp');
      if (gruposPorGp.length > 1) {
        avisos.push({
          tipo: 'gols_pro_decidiu',
          times: nomesGrupoSg,
          mensagem: `${nomesGrupoSg.join(' e ')} empataram em pontos e saldo de gols — desempate pelos gols pró.`,
        });
      }

      gruposPorGp.forEach((grupoGp) => {
        if (grupoGp.length < 2) return; // empate total (pts+sg+gp) — vai pro confronto direto
        const ids = grupoGp.map((t) => t.time_id);
        const saldoEntreSi = confrontoDireto(ids);
        const empatadosOrdenados = [...grupoGp].sort((x, y) => saldoEntreSi[y.time_id] - saldoEntreSi[x.time_id]);

        // reflete a ordem do confronto direto na tabela final (o sort global
        // não sabia desse critério, só entra em pts/sg/gp)
        const indiceInicial = linhas.findIndex((t) => t.time_id === grupoGp[0].time_id);
        for (let k = 0; k < empatadosOrdenados.length; k++) linhas[indiceInicial + k] = empatadosOrdenados[k];

        const aindaEmpatam = new Set();
        for (let k = 0; k < empatadosOrdenados.length - 1; k++) {
          if (saldoEntreSi[empatadosOrdenados[k].time_id] === saldoEntreSi[empatadosOrdenados[k + 1].time_id]) {
            aindaEmpatam.add(empatadosOrdenados[k].time_id);
            aindaEmpatam.add(empatadosOrdenados[k + 1].time_id);
          }
        }

        if (aindaEmpatam.size > 0) {
          const nomes = empatadosOrdenados.filter((t) => aindaEmpatam.has(t.time_id)).map((t) => t.nome);
          avisos.push({
            tipo: 'sorteio_necessario',
            times: nomes,
            mensagem: `${nomes.join(' e ')} seguem empatados em pontos, saldo, gols pró e confronto direto — decisão precisa ser por sorteio.`,
          });
        } else {
          const nomes = empatadosOrdenados.map((t) => t.nome);
          avisos.push({
            tipo: 'confronto_direto_decidiu',
            times: nomes,
            mensagem: `${nomes.join(' e ')} empatavam em pontos, saldo e gols pró — desempatado pelo confronto direto.`,
          });
        }
      });
    });
  });

  return { classificacao: linhas, avisos };
}

if (typeof module !== 'undefined') {
  module.exports = { calcularClassificacao };
}

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.calcularClassificacao = calcularClassificacao;
}
