import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FeatureGate from '@/components/FeatureGate'

function AIServiceContent() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F0C840] transition-colors duration-150 mb-5 text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Atendimento com IA</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0F172A] rounded-xl shadow-sm text-gray-400 space-y-4">
        <span className="text-6xl">🤖</span>
        <p>Configuração do Bot de Atendimento em desenvolvimento...</p>
      </div>
    </div>
  )
}

export default function AIService() {
  return (
    <FeatureGate feature="ia">
      <AIServiceContent />
    </FeatureGate>
  )
}
