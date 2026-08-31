/**
 * Chave — Temas de nomes de times
 * Listas prontas de nomes (+ cor de destaque) que o sorteio pode usar em vez
 * de "Time 1, Time 2...". O admin escolhe um tema na tela de Sorteio, ou
 * digita uma lista personalizada.
 */

const TEMAS_TIMES = {
  sulamericano: {
    label: 'Seleções Sul-Americanas',
    times: [
      { nome: 'Argentina', cor: '#75AADB', bandeira: 'ar' },
      { nome: 'Brasil', cor: '#FFDF00', bandeira: 'br' },
      { nome: 'Uruguai', cor: '#7DA8D9', bandeira: 'uy' },
      { nome: 'Colômbia', cor: '#FCD116', bandeira: 'co' },
      { nome: 'Chile', cor: '#D52B1E', bandeira: 'cl' },
      { nome: 'Peru', cor: '#D91023', bandeira: 'pe' },
      { nome: 'Equador', cor: '#FFD100', bandeira: 'ec' },
      { nome: 'Paraguai', cor: '#D52B1E', bandeira: 'py' },
      { nome: 'Venezuela', cor: '#FFCC00', bandeira: 've' },
      { nome: 'Bolívia', cor: '#007A33', bandeira: 'bo' },
    ],
  },
  selecoes_copa: {
    label: 'Seleções (Copa do Mundo)',
    times: [
      { nome: 'Brasil', cor: '#FFDF00', bandeira: 'br' },
      { nome: 'Argentina', cor: '#75AADB', bandeira: 'ar' },
      { nome: 'Alemanha', cor: '#54685D', bandeira: 'de' },
      { nome: 'França', cor: '#0B3D91', bandeira: 'fr' },
      { nome: 'Espanha', cor: '#FFB627', bandeira: 'es' },
      { nome: 'Itália', cor: '#22A567', bandeira: 'it' },
      { nome: 'Inglaterra', cor: '#7E9488', bandeira: 'gb' },
      { nome: 'Portugal', cor: '#3E8ED9', bandeira: 'pt' },
      { nome: 'Holanda', cor: '#FF8A3D', bandeira: 'nl' },
      { nome: 'Bélgica', cor: '#E2574C', bandeira: 'be' },
      { nome: 'Uruguai', cor: '#7DA8D9', bandeira: 'uy' },
      { nome: 'Croácia', cor: '#E2574C', bandeira: 'hr' },
    ],
  },
  generico: {
    label: 'Genérico (Time 1, Time 2...)',
    times: null, // sinaliza pro código gerar "Time 1, Time 2..." dinamicamente
  },
  clubes_brasileiros: {
    label: 'Clubes Brasileiros',
    times: [
      { nome: 'Flamengo', cor: '#E2231A', abrev: 'FLA' },
      { nome: 'Palmeiras', cor: '#006437', abrev: 'PAL' },
      { nome: 'Corinthians', cor: '#1A1A1A', abrev: 'COR' },
      { nome: 'São Paulo', cor: '#FE0000', abrev: 'SAO' },
      { nome: 'Santos', cor: '#2B2B2B', abrev: 'SAN' },
      { nome: 'Grêmio', cor: '#0D80C4', abrev: 'GRE' },
      { nome: 'Internacional', cor: '#E30613', abrev: 'INT' },
      { nome: 'Cruzeiro', cor: '#003DA5', abrev: 'CRU' },
      { nome: 'Atlético-MG', cor: '#3D3D3D', abrev: 'CAM' },
      { nome: 'Fluminense', cor: '#7A1F2B', abrev: 'FLU' },
      { nome: 'Botafogo', cor: '#2B2B2B', abrev: 'BOT' },
      { nome: 'Vasco da Gama', cor: '#1A1A1A', abrev: 'VAS' },
      { nome: 'Bahia', cor: '#003DA5', abrev: 'BAH' },
      { nome: 'Fortaleza', cor: '#1560BD', abrev: 'FOR' },
      { nome: 'Athletico-PR', cor: '#C8102E', abrev: 'CAP' },
      { nome: 'Vitória', cor: '#C8102E', abrev: 'VIT' },
      { nome: 'Sport', cor: '#C8102E', abrev: 'SPT' },
      { nome: 'Coritiba', cor: '#00693E', abrev: 'CFC' },
    ],
  },
};

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.TEMAS_TIMES = TEMAS_TIMES;

  // mapa nome->bandeira pra exibição, sem precisar guardar isso no banco
  window.Chave.BANDEIRA_POR_NOME = {};
  window.Chave.ABREVIACAO_POR_NOME = {};
  Object.values(TEMAS_TIMES).forEach((tema) => {
    (tema.times || []).forEach((t) => {
      if (t.bandeira) window.Chave.BANDEIRA_POR_NOME[t.nome] = t.bandeira;
      if (t.abrev) window.Chave.ABREVIACAO_POR_NOME[t.nome] = t.abrev;
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { TEMAS_TIMES };
}
