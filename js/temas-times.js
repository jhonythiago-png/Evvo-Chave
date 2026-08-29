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
      { nome: 'Argentina', cor: '#75AADB' },
      { nome: 'Brasil', cor: '#FFDF00' },
      { nome: 'Uruguai', cor: '#7DA8D9' },
      { nome: 'Colômbia', cor: '#FCD116' },
      { nome: 'Chile', cor: '#D52B1E' },
      { nome: 'Peru', cor: '#D91023' },
      { nome: 'Equador', cor: '#FFD100' },
      { nome: 'Paraguai', cor: '#D52B1E' },
      { nome: 'Venezuela', cor: '#FFCC00' },
      { nome: 'Bolívia', cor: '#007A33' },
    ],
  },
  selecoes_copa: {
    label: 'Seleções (Copa do Mundo)',
    times: [
      { nome: 'Brasil', cor: '#FFDF00' },
      { nome: 'Argentina', cor: '#75AADB' },
      { nome: 'Alemanha', cor: '#54685D' },
      { nome: 'França', cor: '#0B3D91' },
      { nome: 'Espanha', cor: '#FFB627' },
      { nome: 'Itália', cor: '#22A567' },
      { nome: 'Inglaterra', cor: '#7E9488' },
      { nome: 'Portugal', cor: '#3E8ED9' },
      { nome: 'Holanda', cor: '#FF8A3D' },
      { nome: 'Bélgica', cor: '#E2574C' },
      { nome: 'Uruguai', cor: '#7DA8D9' },
      { nome: 'Croácia', cor: '#E2574C' },
    ],
  },
  generico: {
    label: 'Genérico (Time 1, Time 2...)',
    times: null, // sinaliza pro código gerar "Time 1, Time 2..." dinamicamente
  },
};

if (typeof window !== 'undefined') {
  window.Chave = window.Chave || {};
  window.Chave.TEMAS_TIMES = TEMAS_TIMES;
}

if (typeof module !== 'undefined') {
  module.exports = { TEMAS_TIMES };
}
