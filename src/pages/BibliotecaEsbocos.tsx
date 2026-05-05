import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { exportarEsbocoParaPDF } from '../utils/exportPdf'
import { 
  LayoutDashboard, 
  MessageSquareMore, 
  KanbanSquare, 
  HeadphonesIcon, 
  Workflow, 
  Send, 
  Users, 
  Bot, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Wheat,
  BookOpen,
  BarChart2,
  Library,
  Search,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  Calendar,
  X,
  Check,
  Star
} from 'lucide-react'

// Interface para o Esboço
interface Esboco {
  id: number;
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
  data: string;
  categoria: string;
  favorito?: boolean;
}

// Dados Mockados
const mockEsbocos: Esboco[] = [
  {
    id: 1,
    tema: 'Fé em Tempos Difíceis',
    data: '21/04/2026',
    categoria: 'Fé',
    favorito: true,
    textoBiblico: {
      texto: '"Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."',
      referencia: 'Hebreus 11:1'
    },
    referenciasApoio: [
      'Romanos 10:17 - "Consequentemente, a fé vem por se ouvir a mensagem..."',
      'Marcos 11:24 - "Tudo o que vocês pedirem em oração, creiam que já o receberam..."'
    ],
    introducao: 'A fé não é apenas um sentimento, mas uma convicção profunda que nos sustenta quando tudo ao redor parece desmoronar.',
    pontosPrincipais: [
      { titulo: 'A Natureza da Fé', conteudo: 'A fé genuína olha além das circunstâncias visíveis e se apoia na imutabilidade de Deus.' },
      { titulo: 'O Teste da Fé', conteudo: 'Os momentos difíceis não vêm para destruir nossa fé, mas para purificá-la como o ouro no fogo.' }
    ],
    aplicacaoPratica: 'Hoje, decida confiar nas promessas de Deus mais do que no que os seus olhos podem ver.',
    conclusao: 'Manter a fé nos dias difíceis é o que nos garante a vitória amanhã.'
  },
  {
    id: 2,
    tema: 'O Poder da Oração',
    data: '18/04/2026',
    categoria: 'Oração',
    textoBiblico: {
      texto: '"A oração de um justo é poderosa e eficaz."',
      referencia: 'Tiago 5:16'
    },
    referenciasApoio: [
      '1 Tessalonicenses 5:17 - "Orem continuamente."',
      'Jeremias 33:3 - "Clame a mim e eu responderei..."'
    ],
    introducao: 'A oração é a nossa linha direta de comunicação com o Criador, capaz de transformar realidades e corações.',
    pontosPrincipais: [
      { titulo: 'Oração como Relacionamento', conteudo: 'Antes de ser um pedido, a oração é intimidade com o Pai.' },
      { titulo: 'A Eficácia da Oração', conteudo: 'Não existe oração sem resposta; Deus sempre age no tempo certo e do jeito certo.' }
    ],
    aplicacaoPratica: 'Estabeleça um tempo diário e inegociável para estar a sós com Deus em oração.',
    conclusao: 'Uma vida de oração é uma vida de milagres e paz constante.'
  },
  {
    id: 3,
    tema: 'A Família debaixo da Graça',
    data: '15/04/2026',
    categoria: 'Família',
    textoBiblico: {
      texto: '"Porém eu e a minha casa serviremos ao Senhor."',
      referencia: 'Josué 24:15'
    },
    referenciasApoio: [
      'Provérbios 22:6 - "Instrui o menino no caminho em que deve andar..."',
      'Salmos 127:1 - "Se o Senhor não edificar a casa..."'
    ],
    introducao: 'A família é o primeiro ministério que Deus nos confia, e precisa ser guardada e nutrida com princípios eternos.',
    pontosPrincipais: [
      { titulo: 'O Fundamento', conteudo: 'Cristo deve ser a rocha sobre a qual a família é construída.' },
      { titulo: 'A Prática do Amor', conteudo: 'O perdão e a paciência são os cimentos que unem os membros da família.' }
    ],
    aplicacaoPratica: 'Dedique tempo de qualidade para sua família nesta semana e promova um momento de culto no lar.',
    conclusao: 'Famílias fortes constroem igrejas fortes e uma sociedade transformada.'
  }
];

const categoriasCores: Record<string, string> = {
  'Fé': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Oração': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Esperança': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Salvação': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Família': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Milagres': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
};

export default function BibliotecaEsbocos() {
  const { isDarkMode } = useThemeStore()
  const navigate = useNavigate();

  // Estados da Biblioteca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [esbocos, setEsbocos] = useState<Esboco[]>(mockEsbocos);
  
  // Estado para Modal de Visualização/Edição
  const [esbocoAtivo, setEsbocoAtivo] = useState<Esboco | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Lista de Categorias Únicas
  const categorias = Array.from(new Set(mockEsbocos.map(e => e.categoria)));
  
  // Lista de Datas Únicas
  const datas = Array.from(new Set(mockEsbocos.map(e => e.data)));

  // Filtragem
  const filteredEsbocos = esbocos.filter(esboco => {
    const term = searchTerm.toLowerCase().trim();
    
    const matchesSearch = term === '' || 
                          esboco.tema.toLowerCase().includes(term) || 
                          esboco.textoBiblico.referencia.toLowerCase().includes(term) ||
                          esboco.textoBiblico.texto.toLowerCase().includes(term) ||
                          esboco.introducao.toLowerCase().includes(term) ||
                          esboco.aplicacaoPratica.toLowerCase().includes(term) ||
                          esboco.conclusao.toLowerCase().includes(term) ||
                          esboco.pontosPrincipais.some(p => 
                            p.titulo.toLowerCase().includes(term) || 
                            p.conteudo.toLowerCase().includes(term)
                          );

    const matchesCategory = selectedCategory ? esboco.categoria === selectedCategory : true;
    const matchesDate = selectedDate ? esboco.data === selectedDate : true;
    const matchesFavorite = showFavoritesOnly ? esboco.favorito : true;
    
    return matchesSearch && matchesCategory && matchesDate && matchesFavorite;
  });

  const handleToggleFavorito = (id: number) => {
    setEsbocos(esbocos.map(e => e.id === id ? { ...e, favorito: !e.favorito } : e));
    if (esbocoAtivo?.id === id) {
      setEsbocoAtivo({ ...esbocoAtivo, favorito: !esbocoAtivo.favorito });
    }
  };

  const handleExcluir = (id: number) => {
    setEsbocos(esbocos.filter(e => e.id !== id));
    if (esbocoAtivo?.id === id) {
      setEsbocoAtivo(null);
    }
  };

  const handleUpdateEsboco = (field: keyof Esboco, value: any) => {
    if (!esbocoAtivo) return;
    setEsbocoAtivo({ ...esbocoAtivo, [field]: value });
  };

  const handleUpdatePontoPrincipal = (index: number, field: 'titulo' | 'conteudo', value: string) => {
    if (!esbocoAtivo) return;
    const novosPontos = [...esbocoAtivo.pontosPrincipais];
    novosPontos[index] = { ...novosPontos[index], [field]: value };
    handleUpdateEsboco('pontosPrincipais', novosPontos);
  };

  const handleUpdateVersiculoAdicional = (index: number, value: string) => {
    if (!esbocoAtivo) return;
    const novasReferencias = [...esbocoAtivo.referenciasApoio];
    novasReferencias[index] = value;
    handleUpdateEsboco('referenciasApoio', novasReferencias);
  };

  const handleSalvarEdicao = () => {
    if (!esbocoAtivo) return;
    setEsbocos(esbocos.map(e => e.id === esbocoAtivo.id ? esbocoAtivo : e));
    setIsEditing(false);
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 transition-opacity duration-[220ms] ease-in-out h-full">
      <div className="max-w-[1200px] mx-auto w-full">
            
            {/* Topo: Título e Ações */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h1 className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight mb-2 tracking-tight">Biblioteca de Esboços</h1>
                <p className="text-[16px] text-[#64748B] dark:text-slate-400 font-medium">Gerencie seus esboços e encontre rapidamente o que precisa.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por tema ou palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#020617] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#0F172A] dark:text-white rounded-[14px] focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all duration-300 text-[14px] placeholder:text-slate-400"
                  />
                </div>

                <div className="relative w-full sm:w-[180px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#020617] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#0F172A] dark:text-white rounded-[14px] focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all duration-300 text-[14px] appearance-none cursor-pointer"
                  >
                    <option value="">Todas as datas</option>
                    {datas.map(data => (
                      <option key={data} value={data}>{data}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/esboco-pregacao')}
                  className="flex justify-center items-center rounded-[14px] bg-[linear-gradient(135deg,#FACC15,#EAB308)] py-3 px-6 text-[15px] font-[600] text-[#0F172A] shadow-[0_4px_12px_rgba(250,204,21,0.15)] hover:shadow-[0_8px_16px_rgba(250,204,21,0.18)] hover:-translate-y-[2px] active:scale-[0.97] transition-all duration-[220ms] ease-out gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Novo Esboço
                </button>
              </div>
            </div>

            {/* Filtros de Categorias */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 custom-scrollbar">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtrar:</span>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors border ${
                  selectedCategory === null 
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200' 
                    : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors border ${
                  showFavoritesOnly 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30' 
                    : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoritos
              </button>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors border ${
                    selectedCategory === cat 
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200' 
                      : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Esboços ou Estado Vazio */}
            {filteredEsbocos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEsbocos.map((esboco) => (
                  <div 
                    key={esboco.id} 
                    className="bg-[#FFFFFF] dark:bg-[#020617] rounded-[16px] p-6 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col h-full hover:shadow-[0_14px_30px_rgba(15,23,42,0.1)] dark:hover:border-slate-700 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${categoriasCores[esboco.categoria] || 'bg-slate-100 text-slate-700'}`}>
                        {esboco.categoria}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorito(esboco.id); }}
                        className={`p-1.5 rounded-full transition-colors ${
                          esboco.favorito 
                            ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10' 
                            : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                        }`}
                        title={esboco.favorito ? "Remover dos favoritos" : "Favoritar esboço"}
                      >
                        <Star className={`w-5 h-5 ${esboco.favorito ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <h3 className="text-[20px] font-bold text-[#0F172A] dark:text-white mb-3 line-clamp-2 group-hover:text-[#FACC15] transition-colors">{esboco.tema}</h3>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-[rgba(15,23,42,0.04)] dark:border-[rgba(255,255,255,0.04)] mb-4 flex-1">
                      <p className="text-[14px] text-[#475569] dark:text-slate-400 italic line-clamp-2 mb-2">
                        {esboco.textoBiblico.texto}
                      </p>
                      <p className="text-[13px] font-semibold text-[#0F172A] dark:text-slate-300">
                        — {esboco.textoBiblico.referencia}
                      </p>
                    </div>

                    <div className="flex items-center text-[13px] text-slate-500 dark:text-slate-400 mb-5 font-medium">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Criado em {esboco.data}
                    </div>

                    {/* Botões de Ação no Card */}
                    <div className="grid grid-cols-4 gap-2 border-t border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] pt-4 mt-auto">
                      <button 
                        onClick={() => { setEsbocoAtivo(esboco); setIsEditing(false); }}
                        className="flex flex-col items-center justify-center py-2 text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group/btn"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium">Ver</span>
                      </button>
                      <button 
                        onClick={() => { setEsbocoAtivo(esboco); setIsEditing(true); }}
                        className="flex flex-col items-center justify-center py-2 text-[#475569] dark:text-slate-400 hover:text-[#FACC15] hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg transition-colors group/btn"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium">Editar</span>
                      </button>
                      <button 
                        onClick={() => exportarEsbocoParaPDF(esboco)}
                        className="flex flex-col items-center justify-center py-2 text-[#475569] dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors group/btn"
                        title="Exportar PDF"
                      >
                        <Download className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium">PDF</span>
                      </button>
                      <button 
                        onClick={() => handleExcluir(esboco.id)}
                        className="flex flex-col items-center justify-center py-2 text-[#475569] dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 mb-1 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium">Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#020617] rounded-[20px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                  <Library className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-[20px] font-bold text-[#0F172A] dark:text-white mb-2">Nenhum esboço encontrado</h3>
                <p className="text-[#64748B] dark:text-slate-400 mb-6 text-center max-w-md">
                  {searchTerm || selectedCategory 
                    ? "Não encontramos esboços com os filtros atuais. Tente limpar a busca." 
                    : "Você ainda não salvou nenhum esboço na sua biblioteca."}
                </p>
                <button 
                  onClick={() => navigate('/esboco-pregacao')}
                  className="flex justify-center items-center rounded-xl bg-slate-900 dark:bg-slate-100 py-3 px-6 text-[15px] font-[600] text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar primeiro esboço
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Modal de Visualização/Edição */}
      {esbocoAtivo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setEsbocoAtivo(null)}
          />
          
          <div className="relative bg-white dark:bg-[#020617] w-full max-w-[800px] max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-4">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${categoriasCores[esbocoAtivo.categoria] || 'bg-slate-100 text-slate-700'}`}>
                  {esbocoAtivo.categoria}
                </span>
                <span className="text-[14px] text-slate-500 font-medium">{esbocoAtivo.data}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[14px] transition-colors ${
                    isEditing 
                      ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#EAB308]' 
                      : 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isEditing ? (
                    <><Check className="w-4 h-4" /> Salvar edições</>
                  ) : (
                    <><Pencil className="w-4 h-4" /> Editar</>
                  )}
                </button>
                <button 
                  onClick={() => exportarEsbocoParaPDF(esbocoAtivo)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Exportar PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setEsbocoAtivo(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
              {/* Tema */}
              <div className="mb-8">
                <span className="text-[#FACC15] font-bold text-sm uppercase tracking-wider mb-2 block">Tema</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={esbocoAtivo.tema}
                    onChange={(e) => handleUpdateEsboco('tema', e.target.value)}
                    className="w-full text-[32px] font-bold text-[#0F172A] dark:text-white bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FACC15]"
                  />
                ) : (
                  <h2 className="text-[32px] font-bold text-[#0F172A] dark:text-white">{esbocoAtivo.tema}</h2>
                )}
              </div>

              {/* Introdução */}
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Introdução</h3>
                {isEditing ? (
                  <textarea
                    value={esbocoAtivo.introducao}
                    onChange={(e) => handleUpdateEsboco('introducao', e.target.value)}
                    rows={4}
                    className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 focus:outline-none focus:border-[#FACC15] resize-y"
                  />
                ) : (
                  <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                    {esbocoAtivo.introducao}
                  </p>
                )}
              </div>

              {/* Versículo Base */}
              <div className="mb-8 bg-white dark:bg-slate-800/30 p-6 rounded-[16px] border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white mb-3">Versículo base</h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={esbocoAtivo.textoBiblico.texto}
                      onChange={(e) => handleUpdateEsboco('textoBiblico', { ...esbocoAtivo.textoBiblico, texto: e.target.value })}
                      rows={2}
                      className="w-full text-[#475569] dark:text-slate-300 italic leading-relaxed text-[16px] bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                    />
                    <input
                      type="text"
                      value={esbocoAtivo.textoBiblico.referencia}
                      onChange={(e) => handleUpdateEsboco('textoBiblico', { ...esbocoAtivo.textoBiblico, referencia: e.target.value })}
                      className="w-full text-right text-[15px] font-semibold text-[#0F172A] dark:text-white bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-[#475569] dark:text-slate-300 italic leading-relaxed text-[16px]">
                      {esbocoAtivo.textoBiblico.texto}
                    </p>
                    <p className="text-right text-[15px] font-semibold text-[#0F172A] dark:text-white mt-3">— {esbocoAtivo.textoBiblico.referencia}</p>
                  </>
                )}
              </div>

              {/* Tópicos Principais */}
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-5">Tópicos principais</h3>
                <div className="space-y-6">
                  {esbocoAtivo.pontosPrincipais.map((ponto, index) => (
                    <div key={index} className="pl-5 border-l-4 border-[#FACC15]">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={ponto.titulo}
                            onChange={(e) => handleUpdatePontoPrincipal(index, 'titulo', e.target.value)}
                            className="w-full font-bold text-[17px] text-[#0F172A] dark:text-white bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FACC15]"
                          />
                          <textarea
                            value={ponto.conteudo}
                            onChange={(e) => handleUpdatePontoPrincipal(index, 'conteudo', e.target.value)}
                            rows={3}
                            className="w-full text-[#475569] dark:text-slate-300 text-[16px] leading-relaxed bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 focus:outline-none focus:border-[#FACC15] resize-y"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-[18px] text-[#0F172A] dark:text-white mb-2">{index + 1}. {ponto.titulo}</h4>
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
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Aplicação prática</h3>
                {isEditing ? (
                  <textarea
                    value={esbocoAtivo.aplicacaoPratica}
                    onChange={(e) => handleUpdateEsboco('aplicacaoPratica', e.target.value)}
                    rows={3}
                    className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 focus:outline-none focus:border-[#FACC15] resize-y"
                  />
                ) : (
                  <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                    {esbocoAtivo.aplicacaoPratica}
                  </p>
                )}
              </div>

              {/* Conclusão */}
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Conclusão</h3>
                {isEditing ? (
                  <textarea
                    value={esbocoAtivo.conclusao}
                    onChange={(e) => handleUpdateEsboco('conclusao', e.target.value)}
                    rows={3}
                    className="w-full text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 focus:outline-none focus:border-[#FACC15] resize-y"
                  />
                ) : (
                  <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-[16px] whitespace-pre-wrap">
                    {esbocoAtivo.conclusao}
                  </p>
                )}
              </div>

              {/* Versículos Adicionais */}
              <div>
                <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white mb-3">Versículos adicionais</h3>
                <ul className="space-y-3">
                  {esbocoAtivo.referenciasApoio.map((ref, index) => (
                    <li key={index} className="text-[#475569] dark:text-slate-300 text-[16px] flex items-start gap-2">
                      <span className="text-[#FACC15] mt-1 font-bold">•</span>
                      {isEditing ? (
                        <textarea
                          value={ref}
                          onChange={(e) => handleUpdateVersiculoAdicional(index, e.target.value)}
                          rows={2}
                          className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-[#FACC15] resize-y"
                        />
                      ) : (
                        <span>{ref}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Footer Modal se em modo de edição */}
            {isEditing && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSalvarEdicao}
                  className="px-6 py-2.5 rounded-xl font-medium bg-[#FACC15] text-[#0F172A] hover:bg-[#EAB308] shadow-md hover:shadow-lg transition-all"
                >
                  Salvar Edições
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
