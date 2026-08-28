// Chave — Cliente Supabase
// Reaproveita o padrão já usado no Rachômetro/Evvo (supabase-js via CDN ou npm)

const SUPABASE_URL = 'https://amvhlrumeeghahlnangz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdmhscnVtZWVnaGFobG5hbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NDIzMzAsImV4cCI6MjEwMzUxODMzMH0.ANAQOifxNFoVgAhEV48zg-G0RPSFvQPjhvIfK5Gg9bs';

// Uso com supabase-js (via <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// A chave acima é a "anon public" — segura para expor no client-side por design
// do Supabase. O isolamento real de dados é feito pelas policies de RLS
// (ver 001_fase0_fundacao.sql e 002_fase1_cadastro_sorteio.sql), nunca pela
// chave em si. Nunca usar a "service_role key" no front-end.
