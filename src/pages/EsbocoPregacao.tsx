import { useState } from 'react'
import { exportarEsbocoParaPDF } from '../utils/exportPdf'
import {
  BookOpen,
  Loader2,
  History,
  Eye,
  Trash2,
  Save,
  Copy,
  Download,
  Pencil,
  Check
} from 'lucide-react'

interface Esboco {
  tema: string;
  textoBiblico: {
    texto: string;
    referencia: string;
  };
  referenciasApoio: string[];
  introducao: string;
  pontosPrincipais: {
    titulo: string;
    conteudo: string;
  }[];
  aplicacaoPratica: string;
  conclusao: string;
  apeloFinal: string;
}

interface HistoricoItem {
  id: number;
  tema: string;
  data: string;
  esboco: Esboco;
}

export default function EsbocoPregacao() {
  const [temaDigitado, setTemaDigitado] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [esbocoGerado, setEsbocoGerado] = useState<Esboco | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [esbocoOriginal, setEsbocoOriginal] = useState<Esboco | null>(null);

  const [historicoEsbocos, setHistoricoEsbocos] = useState<HistoricoItem[]>([
    {
      id: 1,
      tema: 'A Fé no Deserto',
      data: '21 de Abril, 2026',
      esboco: {
        tema: 'A Fé no Deserto',
        textoBiblico: {
          texto: '"Sem fé é impossível agradar a Deus, pois quem dele se aproxima precisa crer que ele existe e que recompensa aqueles que o buscam."',
          referencia: 'Hebreus 11:6'
        },
        referenciasApoio: [
          'Hebreus 11:1 - "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."',
          'Romanos 10:17 - "Consequentemente, a fé vem por se ouvir a mensagem, e a mensagem é ouvida mediante a palavra de Cristo."',
          'Marcos 11:24 - "Tudo o que vocês pedirem em oração, creiam que já o receberam, e assim sucederá."'
        ],
        introducao: 'O tema "A Fé no Deserto" nos convida a refletir sobre como manter a confiança em Deus nos momentos de seca espiritual e dificuldade. É exatamente no deserto que a fé verdadeira é testada e fortalecida, pois quando não há respostas imediatas, somos levados a confiar apenas Naquele que é fiel.',
        pontosPrincipais: [
          {
            titulo: 'A Fé que Persevera',
            conteudo: 'A fé bíblica não é a ausência de dúvidas, mas a escolha de confiar mesmo quando não enxergamos o caminho. No deserto, Deus prova que é suficiente para todas as nossas necessidades, mesmo quando não conseguimos ver além do horizonte.'
          },
          {
            titulo: 'O Deserto como Escola',
            conteudo: 'As temporadas de deserto moldam o caráter e aprofundam nossa dependência de Deus. Foi no deserto que Israel aprendeu a depender do maná diário — provisão diária de Deus que ensina a não acumular, mas a confiar.'
          },
          {
            titulo: 'A Recompensa da Fé',
            conteudo: 'Deus não abandona aqueles que persistem na fé. Cada deserto tem um propósito e uma saída preparada por Aquele que nunca falha. O deserto não é o fim da jornada — é o caminho para a terra prometida.'
          }
        ],
        aplicacaoPratica: 'Como você tem mantido sua fé nas estações de seca? Hoje é um convite para renovar sua confiança, não baseada nas circunstâncias, mas na fidelidade imutável de Deus. Que tal dedicar 10 minutos diários esta semana para declarar em voz alta as promessas de Deus sobre sua vida?',
        conclusao: 'A fé no deserto não é ingenuidade — é a certeza fundamentada nas promessas de Deus. O mesmo Deus que abriu o Mar Vermelho, que enviou maná do céu, que trouxe água da rocha, está com você neste deserto. Ele é o mesmo ontem, hoje e para sempre.',
        apeloFinal: 'Se você está passando por um deserto hoje, eu te convido a renovar sua fé agora mesmo. Venha à frente para orarmos juntos e declarar a fidelidade de Deus sobre sua vida. Quem crê que Deus pode transformar o seu deserto?'
      }
    },
    {
      id: 2,
      tema: 'O Poder da Oração',
      data: '18 de Abril, 2026',
      esboco: {
        tema: 'O Poder da Oração',
        textoBiblico: {
          texto: '"A oração de um justo é poderosa e eficaz."',
          referencia: 'Tiago 5:16'
        },
        referenciasApoio: [
          'Filipenses 4:6 - "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus."',
          '1 Tessalonicenses 5:17 - "Orem continuamente."',
          'Jeremias 33:3 - "Clame a mim e eu responderei e direi a você coisas grandiosas e insondáveis que você não conhece."'
        ],
        introducao: 'A oração é a ferramenta mais poderosa que o cristão possui. Não é uma prática religiosa vazia, mas uma comunhão real com o Deus que criou o universo e que se importa com cada detalhe de nossas vidas. Quando oramos, não estamos falando para o vazio — estamos conversando com o Pai.',
        pontosPrincipais: [
          {
            titulo: 'A Oração como Comunhão',
            conteudo: 'Antes de ser um pedido, a oração é uma conversa. Deus nos convida a trazer não apenas nossas necessidades, mas nosso coração inteiro diante dele. A oração mais poderosa começa com adoração e termina com rendição à vontade de Deus.'
          },
          {
            titulo: 'A Oração que Move Montanhas',
            conteudo: 'Jesus prometeu que a oração sincera e persistente move montanhas. Não se trata de repetição de palavras, mas de fé ativa combinada com a vontade de Deus. A oração não muda Deus — ela nos transforma e alinha nossa vontade à dele.'
          },
          {
            titulo: 'Persistência na Oração',
            conteudo: 'A parábola da viúva persistente nos ensina que Deus honra a perseverança. Não porque ele precisa ser convencido, mas porque a persistência revela nossa dependência genuína e nossa confiança no caráter de Deus.'
          }
        ],
        aplicacaoPratica: 'Que tal estabelecer um horário fixo de oração esta semana? Comece com 10 minutos e aumente gradualmente. Escreva seus pedidos em um diário de oração e registre as respostas de Deus. A oração é um músculo — quanto mais exercitada, mais forte se torna.',
        conclusao: 'Uma vida de oração transforma não apenas as circunstâncias, mas o próprio caráter do crente. O homem ou mulher que ora muito, preocupa-se pouco. Que esta mensagem nos inspire a sermos uma geração de intercessores que movem o coração de Deus.',
        apeloFinal: 'Hoje, que tal fazermos um pacto de oração? Convido cada um a se comprometer com uma vida de comunhão diária com Deus. Quem aceita o desafio de orar pelo menos 10 minutos por dia durante os próximos 30 dias?'
      }
    },
    {
      id: 3,
      tema: 'A Família debaixo da Graça',
      data: '15 de Abril, 2026',
      esboco: {
        tema: 'A Família debaixo da Graça',
        textoBiblico: {
          texto: '"Se o Senhor não edificar a casa, em vão trabalham os que a edificam."',
          referencia: 'Salmos 127:1'
        },
        referenciasApoio: [
          'Josué 24:15 - "Porém, se vos parece mal aos vossos olhos servir ao Senhor, escolhei hoje a quem sirvais... porém eu e a minha casa serviremos ao Senhor."',
          'Provérbios 22:6 - "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele."',
          'Salmos 127:3 - "Os filhos são herança do Senhor, uma recompensa que ele dá."'
        ],
        introducao: 'A família foi a primeira instituição criada por Deus. Antes da igreja, antes do governo, Deus estabeleceu a família como o núcleo da sociedade e o ambiente onde a fé é transmitida de geração em geração. Uma família debaixo da graça não é uma família perfeita, mas uma família rendida.',
        pontosPrincipais: [
          {
            titulo: 'O Fundamento Correto',
            conteudo: 'Uma família edificada sobre a graça de Deus tem como base o perdão mútuo, a Palavra de Deus e a presença do Espírito Santo. Sem este fundamento, qualquer estrutura familiar é frágil diante das tempestades da vida.'
          },
          {
            titulo: 'O Papel de Cada Membro',
            conteudo: 'Deus tem um propósito específico para pais, mães, filhos e cônjuges. Quando cada um cumpre seu papel debaixo da graça — não da lei, mas do amor de Deus — a família se torna um testemunho vivo do Reino de Deus na terra.'
          },
          {
            titulo: 'Restauração pela Graça',
            conteudo: 'Não existe família perfeita, mas existe graça suficiente para restaurar o que foi quebrado. A graça de Deus é maior do que qualquer disfunção familiar, trauma ou erro do passado. Deus é especialista em fazer coisas novas.'
          }
        ],
        aplicacaoPratica: 'Esta semana, que tal fazer uma oração em família? Abra a Bíblia com seus filhos ou cônjuge e leiam um Salmo juntos. Diga uma palavra de amor e encorajamento para cada membro da família. Pequenos atos de fé em família constroem legados eternos.',
        conclusao: 'A família debaixo da graça é aquela que, apesar dos erros e imperfeições, continua se arrependendo, perdoando e avançando juntos em direção ao propósito de Deus. Não desista da sua família — Deus não desistiu dela.',
        apeloFinal: 'Se a sua família está passando por dificuldades, saiba que Deus pode restaurar tudo que parece perdido. Quem quer orar pela sua família hoje? Venha, vamos crer juntos por restauração e unidade familiar.'
      }
    }
  ]);

  const buscarVersiculosRelacionados = (tema: string) => {
    const t = tema.toLowerCase();
    if (t.includes('fé') || t.includes('confian') || t.includes('acreditar') || t.includes('crer')) {
      return [
        'Hebreus 11:1 - "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."',
        'Romanos 10:17 - "Consequentemente, a fé vem por se ouvir a mensagem, e a mensagem é ouvida mediante a palavra de Cristo."',
        'Marcos 11:24 - "Portanto, eu digo: Tudo o que vocês pedirem em oração, creiam que já o receberam, e assim sucederá."'
      ];
    }
    if (t.includes('amor') || t.includes('amar') || t.includes('perdão') || t.includes('perdoar')) {
      return [
        '1 Coríntios 13:4-7 - "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha."',
        '1 João 4:8 - "Quem não ama não conhece a Deus, porque Deus é amor."',
        'Colossenses 3:14 - "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito."'
      ];
    }
    if (t.includes('oração') || t.includes('orar') || t.includes('clamor') || t.includes('jejum')) {
      return [
        'Filipenses 4:6 - "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus."',
        '1 Tessalonicenses 5:17 - "Orem continuamente."',
        'Jeremias 33:3 - "Clame a mim e eu responderei e direi a você coisas grandiosas e insondáveis que você não conhece."'
      ];
    }
    if (t.includes('paz') || t.includes('ansiedade') || t.includes('medo') || t.includes('depressão') || t.includes('angústia')) {
      return [
        'João 14:27 - "Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo."',
        'Isaías 26:3 - "Tu, Senhor, guardarás em perfeita paz aquele cujo propósito é firme, porque em ti confia."',
        'Salmos 4:8 - "Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes viver em segurança."'
      ];
    }
    if (t.includes('família') || t.includes('casamento') || t.includes('filhos') || t.includes('lar')) {
      return [
        'Josué 24:15 - "Porém, se vos parece mal aos vossos olhos servir ao Senhor, escolhei hoje a quem sirvais... porém eu e a minha casa serviremos ao Senhor."',
        'Provérbios 22:6 - "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele."',
        'Salmos 127:3 - "Os filhos são herança do Senhor, uma recompensa que ele dá."'
      ];
    }
    return [
      'Salmos 119:105 - "A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho."',
      'Provérbios 3:5-6 - "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento."',
      'Josué 1:9 - "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar."'
    ];
  };

  const obterBaseBiblica = (tema: string) => {
    const t = tema.toLowerCase();
    if (t.includes('fé') || t.includes('confian')) return { texto: '"Sem fé é impossível agradar a Deus, pois quem dele se aproxima precisa crer que ele existe e que recompensa aqueles que o buscam."', referencia: 'Hebreus 11:6' };
    if (t.includes('amor') || t.includes('amar')) return { texto: '"Nisto consiste o amor: não em que nós tenhamos amado a Deus, mas em que ele nos amou e enviou seu Filho como propiciação pelos nossos pecados."', referencia: '1 João 4:10' };
    if (t.includes('oração') || t.includes('orar')) return { texto: '"A oração de um justo é poderosa e eficaz."', referencia: 'Tiago 5:16' };
    if (t.includes('paz') || t.includes('medo')) return { texto: '"E a paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus."', referencia: 'Filipenses 4:7' };
    if (t.includes('família') || t.includes('lar')) return { texto: '"Se o Senhor não edificar a casa, em vão trabalham os que a edificam."', referencia: 'Salmos 127:1' };
    return { texto: '"Ainda que a figueira não floresça, nem haja fruto na vide... todavia, eu me alegrarei no Senhor, exultarei no Deus da minha salvação."', referencia: 'Habacuque 3:17-18' };
  };

  const handleGerarEsboço = () => {
    if (!temaDigitado.trim()) return;

    setIsGenerating(true);
    setIsEditing(false);
    setEditingHistoryId(null);

    setTimeout(() => {
      const baseBiblica = obterBaseBiblica(temaDigitado);
      const versiculosRelacionados = buscarVersiculosRelacionados(temaDigitado);

      const mockEsboco: Esboco = {
        tema: temaDigitado,
        textoBiblico: baseBiblica,
        referenciasApoio: versiculosRelacionados,
        introducao: `O tema "${temaDigitado}" nos leva a refletir profundamente sobre a nossa caminhada cristã. Em nossa jornada, muitas vezes somos desafiados a compreender os propósitos do Senhor, mas é exatamente no meio dos desafios cotidianos que a verdadeira mensagem da Palavra se manifesta, nos guiando e fortalecendo.`,
        pontosPrincipais: [
          {
            titulo: 'O Contexto da Palavra',
            conteudo: 'A Palavra não nos ensina a ignorar a realidade ao nosso redor. Ela nos convida a olhar para as circunstâncias com uma nova perspectiva, fundamentada nas promessas que nunca falham. É importante compreender onde estamos firmados.'
          },
          {
            titulo: 'A Decisão de Seguir',
            conteudo: 'Muitas vezes, a nossa reação inicial diante das adversidades define o resultado. A alegria e a confiança não devem ser baseadas em circunstâncias passageiras, mas na essência imutável de quem Deus é em nossas vidas.'
          },
          {
            titulo: 'A Fonte Inesgotável',
            conteudo: 'A força que nos sustenta não provém da nossa própria resiliência humana. A verdadeira fonte de renovação e sabedoria vem do alto. É necessário nos conectarmos diariamente com essa fonte para não desfalecermos.'
          }
        ],
        aplicacaoPratica: `Como você tem reagido em relação a "${temaDigitado}" em sua vida prática? Precisamos aprender a aplicar esses princípios diariamente. Hoje, escolha focar na Palavra e permitir que ela molde suas atitudes e decisões.`,
        conclusao: 'A verdadeira caminhada cristã não é aquela isenta de obstáculos, mas aquela que se mantém firme na Palavra, não importando a situação. O Senhor é o nosso guia constante, iluminando o nosso caminho passo a passo.',
        apeloFinal: 'Se o seu coração foi tocado por esta mensagem, eu te convido a entregar suas preocupações nas mãos do Senhor. Quem deseja renovar sua aliança e compromisso hoje? Venha à frente e vamos orar juntos.'
      };

      setEsbocoGerado(mockEsboco);
      setIsGenerating(false);
    }, 2500);
  };

  const handleUpdateEsboco = (field: keyof Esboco, value: any) => {
    if (!esbocoGerado) return;
    setEsbocoGerado({ ...esbocoGerado, [field]: value });
  };

  const handleUpdatePontoPrincipal = (index: number, field: 'titulo' | 'conteudo', value: string) => {
    if (!esbocoGerado) return;
    const novosPontos = [...esbocoGerado.pontosPrincipais];
    novosPontos[index] = { ...novosPontos[index], [field]: value };
    handleUpdateEsboco('pontosPrincipais', novosPontos);
  };

  const handleUpdateVersiculoAdicional = (index: number, value: string) => {
    if (!esbocoGerado) return;
    const novasReferencias = [...esbocoGerado.referenciasApoio];
    novasReferencias[index] = value;
    handleUpdateEsboco('referenciasApoio', novasReferencias);
  };

  const handleVisualizar = (item: HistoricoItem) => {
    setEsbocoGerado(item.esboco);
    setEsbocoOriginal(null);
    setIsEditing(false);
    setEditingHistoryId(null);
  };

  const handleEditarDoHistorico = (item: HistoricoItem) => {
    setEsbocoOriginal(item.esboco);
    setEsbocoGerado(item.esboco);
    setIsEditing(true);
    setEditingHistoryId(item.id);
  };

  const handleIniciarEdicao = () => {
    if (esbocoGerado) setEsbocoOriginal(esbocoGerado);
    setIsEditing(true);
  };

  const handleCancelarEdicao = () => {
    if (esbocoOriginal) setEsbocoGerado(esbocoOriginal);
    setEsbocoOriginal(null);
    setIsEditing(false);
    setEditingHistoryId(null);
  };

  const handleExcluir = (id: number) => {
    setHistoricoEsbocos(prev => prev.filter(e => e.id !== id));
    if (editingHistoryId === id) {
      setEsbocoGerado(null);
      setEsbocoOriginal(null);
      setIsEditing(false);
      setEditingHistoryId(null);
    }
  };

  const handleSalvarEdicoes = () => {
    if (editingHistoryId !== null && esbocoGerado) {
      setHistoricoEsbocos(prev =>
        prev.map(item =>
          item.id === editingHistoryId
            ? { ...item, tema: esbocoGerado.tema, esboco: esbocoGerado }
            : item
        )
      );
      setEditingHistoryId(null);
    }
    setEsbocoOriginal(null);
    setIsEditing(false);
  };

  const handleSalvarNoHistorico = () => {
    if (!esbocoGerado) return;
    const novoItem: HistoricoItem = {
      id: Date.now(),
      tema: esbocoGerado.tema,
      data: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      esboco: esbocoGerado
    };
    setHistoricoEsbocos(prev => [novoItem, ...prev]);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FFFFFF] dark:bg-[#020617] transition-colors duration-300 p-6 md:p-10 flex gap-8">
          {/* Main Column */}
          <div className="flex-1 max-w-4xl flex flex-col mt-[24px]">
            {/* Cabeçalho */}
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white tracking-tight transition-colors duration-300">Gerador de Esboço</h1>
              <p className="text-[#64748B] dark:text-slate-400 mt-2 text-[15px] font-medium transition-colors duration-300">Digite um tema e gere um esboço completo com referências bíblicas.</p>
            </div>

            {/* Campo de Tema e Botão */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] dark:bg-[#0F172A] p-6 rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none">
              <div className="relative">
                <textarea
                  id="temaPregacao"
                  rows={4}
                  value={temaDigitado}
                  onChange={(e) => setTemaDigitado(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Digite o tema da pregação...&#10;Exemplo:&#10;Fé em tempos difíceis&#10;Confiança em Deus&#10;O poder da oração"
                  className="w-full bg-[#FFFFFF] dark:bg-[#020617] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#0F172A] dark:text-white rounded-[14px] p-[14px] focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all duration-300 resize-none placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 disabled:opacity-50 text-[15px]"
                ></textarea>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleGerarEsboço}
                  disabled={isGenerating || !temaDigitado.trim()}
                  className="flex justify-center items-center rounded-[12px] bg-[linear-gradient(135deg,#FACC15,#EAB308)] py-[12px] px-[20px] text-[15px] font-[600] text-[#0F172A] shadow-[0_4px_12px_rgba(250,204,21,0.15)] hover:shadow-[0_8px_16px_rgba(250,204,21,0.18)] hover:-translate-y-[2px] active:scale-[0.97] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-[220ms] ease-out gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 text-[#0F172A] animate-spin" />
                      <span>Gerando esboço...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5 text-[#0F172A]" />
                      <span>Gerar Esboço</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Estado de Carregamento */}
            {isGenerating && !esbocoGerado && (
              <div className="mt-[40px] flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 border-4 border-[#FACC15]/30 border-t-[#FACC15] rounded-full animate-spin"></div>
                <p className="text-[#64748B] dark:text-slate-400 font-medium text-[16px]">Gerando esboço...</p>
              </div>
            )}

            {/* Estado Vazio */}
            {!isGenerating && !esbocoGerado && (
              <div className="mt-[60px] flex flex-col items-center justify-center py-12 gap-3 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-2">
                  <BookOpen className="w-8 h-8 text-[#94A3B8] dark:text-slate-500" />
                </div>
                <p className="text-[#64748B] dark:text-slate-400 font-medium text-[16px]">Digite um tema para gerar um esboço.</p>
              </div>
            )}

            {/* Resultado do Esboço */}
            {esbocoGerado && !isGenerating && (
              <div
                className="mt-[20px] bg-[#FFFFFF] dark:bg-[#020617] p-[24px] rounded-[18px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col gap-8 transition-colors duration-300 mb-10"
                style={{ animation: 'fadeUpResult 400ms ease-out forwards' }}
              >
                <style>
                  {`
                    @keyframes fadeUpResult {
                      0% { opacity: 0; transform: translateY(10px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                  `}
                </style>

                {/* Cabeçalho do Resultado */}
                <div className="border-b border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] pb-6 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[#FACC15] font-bold text-sm uppercase tracking-wider mb-2 block">Tema</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={esbocoGerado.tema}
                        onChange={(e) => handleUpdateEsboco('tema', e.target.value)}
                        className="w-full text-[26px] font-bold text-[#0F172A] dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 focus:outline-none focus:border-[#FACC15]"
                      />
                    ) : (
                      <h2 className="text-[26px] font-bold text-[#0F172A] dark:text-white transition-colors duration-300">{esbocoGerado.tema}</h2>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelarEdicao}
                        className="flex-none flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[14px] bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSalvarEdicoes}
                        className="flex-none flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[14px] bg-[#FACC15] text-[#0F172A] hover:bg-[#EAB308] transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        {editingHistoryId !== null ? 'Salvar alterações' : 'Salvar edições'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleIniciarEdicao}
                      className="flex-none flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[14px] bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar esboço
                    </button>
                  )}
                </div>

                {/* Introdução */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Introdução</h3>
                  {isEditing ? (
                    <textarea
                      value={esbocoGerado.introducao}
                      onChange={(e) => handleUpdateEsboco('introducao', e.target.value)}
                      rows={4}
                      className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                    />
                  ) : (
                    <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                      {esbocoGerado.introducao}
                    </p>
                  )}
                </div>

                {/* Versículo Base */}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-[12px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                  <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-2">Versículo base</h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={esbocoGerado.textoBiblico.texto}
                        onChange={(e) => handleUpdateEsboco('textoBiblico', { ...esbocoGerado.textoBiblico, texto: e.target.value })}
                        rows={2}
                        className="w-full text-[#475569] dark:text-slate-300 italic leading-relaxed text-[16px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                      />
                      <input
                        type="text"
                        value={esbocoGerado.textoBiblico.referencia}
                        onChange={(e) => handleUpdateEsboco('textoBiblico', { ...esbocoGerado.textoBiblico, referencia: e.target.value })}
                        className="w-full text-right text-[15px] font-semibold text-[#0F172A] dark:text-white bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FACC15]"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-[#475569] dark:text-slate-300 italic leading-relaxed text-[16px]">
                        {esbocoGerado.textoBiblico.texto}
                      </p>
                      <p className="text-right text-[15px] font-semibold text-[#0F172A] dark:text-white mt-3">— {esbocoGerado.textoBiblico.referencia}</p>
                    </>
                  )}
                </div>

                {/* Tópicos Principais */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-4">Tópicos principais</h3>
                  <div className="space-y-6">
                    {esbocoGerado.pontosPrincipais.map((ponto, index) => (
                      <div key={index} className="pl-4 border-l-4 border-[#FACC15]">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={ponto.titulo}
                              onChange={(e) => handleUpdatePontoPrincipal(index, 'titulo', e.target.value)}
                              className="w-full font-bold text-[17px] text-[#0F172A] dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FACC15]"
                            />
                            <textarea
                              value={ponto.conteudo}
                              onChange={(e) => handleUpdatePontoPrincipal(index, 'conteudo', e.target.value)}
                              rows={3}
                              className="w-full text-[#475569] dark:text-slate-300 text-[16px] leading-relaxed bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-bold text-[17px] text-[#0F172A] dark:text-white mb-2">- {ponto.titulo}</h4>
                            <p className="text-[#475569] dark:text-slate-300 text-[16px] leading-relaxed whitespace-pre-wrap">
                              {ponto.conteudo}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aplicação Prática */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Aplicação prática</h3>
                  {isEditing ? (
                    <textarea
                      value={esbocoGerado.aplicacaoPratica}
                      onChange={(e) => handleUpdateEsboco('aplicacaoPratica', e.target.value)}
                      rows={3}
                      className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                    />
                  ) : (
                    <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                      {esbocoGerado.aplicacaoPratica}
                    </p>
                  )}
                </div>

                {/* Conclusão */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Conclusão</h3>
                  {isEditing ? (
                    <textarea
                      value={esbocoGerado.conclusao}
                      onChange={(e) => handleUpdateEsboco('conclusao', e.target.value)}
                      rows={3}
                      className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                    />
                  ) : (
                    <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                      {esbocoGerado.conclusao}
                    </p>
                  )}
                </div>

                {/* Versículos Adicionais */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Versículos adicionais</h3>
                  <ul className="space-y-3">
                    {esbocoGerado.referenciasApoio.map((ref, index) => (
                      <li key={index} className="text-[#475569] dark:text-slate-300 text-[16px] flex items-start gap-2">
                        <span className="text-[#FACC15] mt-1">•</span>
                        {isEditing ? (
                          <textarea
                            value={ref}
                            onChange={(e) => handleUpdateVersiculoAdicional(index, e.target.value)}
                            rows={2}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-[#FACC15] resize-y"
                          />
                        ) : (
                          <span>{ref}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botões Extras */}
                <div className="flex flex-wrap gap-3 mt-4 pt-6 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]">
                  <button
                    onClick={handleSalvarNoHistorico}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white font-medium text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Salvar esboço
                  </button>
                  <button
                    onClick={() => {
                      const text = `Tema: ${esbocoGerado.tema}\n\nVersículo: ${esbocoGerado.textoBiblico.texto} - ${esbocoGerado.textoBiblico.referencia}\n\nIntrodução:\n${esbocoGerado.introducao}\n\nTópicos:\n${esbocoGerado.pontosPrincipais.map((p: any) => `- ${p.titulo}\n${p.conteudo}`).join('\n\n')}\n\nAplicação:\n${esbocoGerado.aplicacaoPratica}\n\nConclusão:\n${esbocoGerado.conclusao}`;
                      navigator.clipboard.writeText(text);
                      alert("Esboço copiado para a área de transferência!");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white font-medium text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar esboço
                  </button>
                  <button
                    onClick={() => exportarEsbocoParaPDF(esbocoGerado)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white font-medium text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Histórico de Esboços */}
          <div className="hidden lg:flex w-[340px] flex-col mt-[24px]">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-[#FACC15]" />
              <h2 className="text-[20px] font-bold text-[#0F172A] dark:text-white">Histórico de esboços</h2>
            </div>

            <div className="flex flex-col gap-3">
              {historicoEsbocos.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#FFFFFF] dark:bg-[#0F172A] p-[18px] rounded-[16px] border shadow-sm hover:shadow-md transition-shadow ${
                    editingHistoryId === item.id
                      ? 'border-[#FACC15]/50 dark:border-[#FACC15]/40'
                      : 'border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-1 line-clamp-1" title={item.tema}>{item.tema}</h3>
                  <p className="text-[13px] text-[#64748B] dark:text-slate-400 font-medium mb-4">{item.data}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizar(item)}
                      className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#0F172A] dark:text-white bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => handleEditarDoHistorico(item)}
                      className="flex-none flex justify-center items-center p-2 text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExcluir(item.id)}
                      className="flex-none flex justify-center items-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {historicoEsbocos.length === 0 && (
                <p className="text-[13px] text-[#64748B] dark:text-slate-400 text-center py-6">Nenhum esboço salvo ainda.</p>
              )}
            </div>
          </div>
        </div>
  )
}
