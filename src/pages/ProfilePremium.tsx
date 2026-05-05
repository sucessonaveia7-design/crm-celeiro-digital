import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { 
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Camera,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Check
} from 'lucide-react'

export default function ProfilePremium() {
  const [isThemeFading, setIsThemeFading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // Estados do Modal de Senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: 'Sucesso na Veia',
    email: 'Sucessonaveia7@gmail.com',
    phone: '',
    role: 'Administrador Principal',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    systemNotifications: true
  });

  const handleThemeToggle = () => {
    setIsThemeFading(true);
    setTimeout(() => {
      toggleDarkMode();
      setIsThemeFading(false);
    }, 200);
  };

  const handlePasswordSave = () => {
    setPasswordError('');
    
    // Validação da Senha Atual (Mock)
    if (formData.currentPassword !== '123456') {
      setPasswordError('A senha atual está incorreta.');
      return;
    }
    
    // Validação de Senha Forte
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres, incluindo letras e números.');
      return;
    }
    
    // Confirmação de Senha
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('As novas senhas não conferem.');
      return;
    }

    setPasswordSuccess('Senha alterada com sucesso');
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordSuccess('');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }, 2000);
  };

  return (
    <div 
      className="flex flex-col w-full min-h-screen bg-transparent font-sans transition-colors duration-300 pb-12"
      style={{ animation: 'fadeUpProfile 300ms ease-out forwards' }}
    >
      <style>
        {`
          @keyframes fadeUpProfile {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          /* Custom Toggle Switch Styles */
          .custom-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }
          .custom-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15,23,42,0.1);
            transition: .3s;
            border-radius: 34px;
          }
          .dark .slider {
            background-color: rgba(255,255,255,0.1);
          }
          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          input:checked + .slider {
            background-color: #FACC15;
          }
          input:checked + .slider:before {
            transform: translateX(20px);
          }
        `}
      </style>

      {/* Header Simples de Navegação */}
      <div className="w-full max-w-[1000px] mx-auto px-[24px] pt-[32px] pb-[24px] flex items-center justify-between">
         <button 
           onClick={() => navigate('/')}
           className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors text-[14px] font-[500]"
         >
          <ChevronLeft className="w-[18px] h-[18px]" />
          Voltar ao Dashboard
        </button>
      </div>

      {/* Cabeçalho da Página */}
      <div className="w-full max-w-[1000px] mx-auto px-[24px] mb-[32px]">
        <h1 className="text-[28px] font-[700] text-[#0F172A] dark:text-white tracking-tight mb-[6px]">
          Meu Perfil
        </h1>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
          Gerencie suas informações pessoais e preferências da conta.
        </p>
      </div>

      {/* Grid Principal */}
      <div className="w-full max-w-[1000px] mx-auto px-[24px] grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[24px]">
        
        {/* Coluna Esquerda: Avatar e Info Básica */}
        <div className="flex flex-col gap-[24px]">
          {/* Card Avatar */}
          <div className="bg-[#FFFFFF] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-[24px] flex flex-col items-center text-center relative overflow-hidden group">
            {/* Background Decorativo Superior */}
            <div className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-[rgba(250,204,21,0.1)] dark:from-[rgba(250,204,21,0.05)] to-transparent pointer-events-none"></div>
            
            <div className="relative mb-[20px] z-10 group/avatar cursor-pointer">
              <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#FACC15] to-[#EAB308] text-[#0F172A] font-[700] flex items-center justify-center text-[48px] shadow-[0_12px_24px_rgba(250,204,21,0.25)] dark:shadow-[0_12px_24px_rgba(250,204,21,0.15)] border-[4px] border-[#FFFFFF] dark:border-[#0F172A] transition-transform duration-300 group-hover/avatar:scale-[1.02]">
                {formData.name.charAt(0)}
              </div>
              
              {/* Hover overlay para alterar foto */}
              <div 
                className="absolute inset-0 rounded-full bg-[#0F172A]/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.click();
                }}
              >
                <Camera className="w-[24px] h-[24px] mb-[4px] text-white" />
                <span className="text-[12px] font-[600]">Alterar foto</span>
              </div>
            </div>
            
            <h2 className="text-[20px] font-[700] text-[#0F172A] dark:text-white leading-tight mb-[4px] relative z-10">
              {formData.name}
            </h2>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-[8px] relative z-10">
              {formData.email}
            </p>
            <div className="inline-flex items-center gap-[6px] px-[12px] py-[4px] bg-[rgba(250,204,21,0.1)] dark:bg-[rgba(250,204,21,0.05)] rounded-full relative z-10">
              <Shield className="w-[12px] h-[12px] text-[#B45309] dark:text-[#FACC15]" />
              <span className="text-[11px] font-[600] text-[#B45309] dark:text-[#FACC15] uppercase tracking-wide">
                {formData.role}
              </span>
            </div>
          </div>

          {/* Card de Preferências Rápidas */}
          <div className="bg-[#FFFFFF] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-[24px] flex flex-col gap-[20px]">
            <h3 className="text-[15px] font-[700] text-[#0F172A] dark:text-white">Preferências</h3>
            
            {/* Toggle Tema */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-[16px] h-[16px] text-[#64748B] dark:text-[#94A3B8]" /> : <Sun className="w-[16px] h-[16px] text-[#64748B] dark:text-[#94A3B8]" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-[600] text-[#0F172A] dark:text-white leading-tight">Modo Escuro</span>
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Tema atual do sistema</span>
                </div>
              </div>
              <label className="custom-switch">
                <input 
                  type="checkbox" 
                  checked={isDarkMode} 
                  onChange={handleThemeToggle}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] w-full"></div>

            {/* Toggle Notificações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <Bell className="w-[16px] h-[16px] text-[#64748B] dark:text-[#94A3B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-[600] text-[#0F172A] dark:text-white leading-tight">Notificações</span>
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Alertas no sistema</span>
                </div>
              </div>
              <label className="custom-switch">
                <input 
                  type="checkbox" 
                  checked={preferences.systemNotifications}
                  onChange={(e) => setPreferences({...preferences, systemNotifications: e.target.checked})}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário Completo */}
        <div className="flex flex-col gap-[24px]">
          <div className="bg-[#FFFFFF] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] rounded-[20px] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-[32px] flex flex-col">
            
            <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-[24px] flex items-center gap-[8px]">
              <User className="w-[18px] h-[18px] text-[#D4AF37] dark:text-[#FFD700]" />
              Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[32px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">Nome Completo</label>
                <div className="relative">
                  <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#64748B]">
                    <User className="w-[16px] h-[16px]" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-[46px] pl-[40px] pr-[16px] rounded-[12px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#FACC15] dark:focus:border-[#FACC15] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">E-mail</label>
                <div className="relative">
                  <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#64748B]">
                    <Mail className="w-[16px] h-[16px]" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-[46px] pl-[40px] pr-[16px] rounded-[12px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#FACC15] dark:focus:border-[#FACC15] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">Telefone (Opcional)</label>
                <div className="relative">
                  <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#64748B]">
                    <Phone className="w-[16px] h-[16px]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-[46px] pl-[40px] pr-[16px] rounded-[12px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[14px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#FACC15] dark:focus:border-[#FACC15] focus:bg-[#FFFFFF] dark:focus:bg-[#0F172A] transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]"
                  />
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] w-full mb-[32px]"></div>

            <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-[24px] flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <Lock className="w-[18px] h-[18px] text-[#D4AF37] dark:text-[#FFD700]" />
                Segurança
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-[13px] font-[600] text-[#0F172A] dark:text-[#0F172A] bg-gradient-to-r from-[#FACC15] to-[#EAB308] px-[16px] py-[8px] rounded-[10px] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(250,204,21,0.3)] transition-all duration-200"
              >
                Alterar Senha
              </button>
            </h3>

            <div className="h-[1px] bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] w-full mb-[32px]"></div>

            <h3 className="text-[18px] font-[700] text-[#0F172A] dark:text-white mb-[24px] flex items-center gap-[8px]">
              <Monitor className="w-[18px] h-[18px] text-[#D4AF37] dark:text-[#FFD700]" />
              Sessões e Dispositivos
            </h3>

            <div className="flex flex-col gap-[16px] mb-[40px]">
              {/* Dispositivo Atual */}
              <div className="flex items-start justify-between p-[16px] rounded-[16px] border border-[rgba(250,204,21,0.3)] dark:border-[rgba(250,204,21,0.2)] bg-[rgba(250,204,21,0.05)] dark:bg-[rgba(250,204,21,0.02)]">
                <div className="flex gap-[14px]">
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[rgba(250,204,21,0.2)] dark:border-[rgba(255,255,255,0.06)] shadow-sm flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-[20px] h-[20px] text-[#D4AF37] dark:text-[#FFD700]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[14px] font-[700] text-[#0F172A] dark:text-white leading-tight">Windows • Chrome</span>
                      <span className="text-[10px] font-[600] text-[#B45309] dark:text-[#FACC15] bg-[rgba(250,204,21,0.2)] px-[8px] py-[2px] rounded-full uppercase tracking-wider">Dispositivo Atual</span>
                    </div>
                    <div className="flex items-center gap-[12px] mt-[6px]">
                      <div className="flex items-center gap-[4px] text-[#64748B] dark:text-[#94A3B8]">
                        <MapPin className="w-[12px] h-[12px]" />
                        <span className="text-[12px]">São Paulo, Brasil</span>
                      </div>
                      <div className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] dark:bg-[#475569]"></div>
                      <div className="flex items-center gap-[4px] text-[#64748B] dark:text-[#94A3B8]">
                        <Clock className="w-[12px] h-[12px]" />
                        <span className="text-[12px]">Ativo agora</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outro Dispositivo */}
              <div className="flex items-start justify-between p-[16px] rounded-[16px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-[#F8FAFC] dark:bg-[#1E293B] hover:border-[rgba(15,23,42,0.1)] dark:hover:border-[rgba(255,255,255,0.1)] transition-colors">
                <div className="flex gap-[14px]">
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FFFFFF] dark:bg-[#0F172A] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-sm flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-[20px] h-[20px] text-[#64748B] dark:text-[#94A3B8]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-[600] text-[#0F172A] dark:text-white leading-tight">iPhone 14 Pro • Safari</span>
                    <div className="flex items-center gap-[12px] mt-[6px]">
                      <div className="flex items-center gap-[4px] text-[#64748B] dark:text-[#94A3B8]">
                        <MapPin className="w-[12px] h-[12px]" />
                        <span className="text-[12px]">São Paulo, Brasil</span>
                      </div>
                      <div className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] dark:bg-[#475569]"></div>
                      <div className="flex items-center gap-[4px] text-[#64748B] dark:text-[#94A3B8]">
                        <Clock className="w-[12px] h-[12px]" />
                        <span className="text-[12px]">Ontem às 14:30</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-[13px] font-[600] text-[#DC2626] dark:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] px-[12px] py-[6px] rounded-[8px] transition-colors mt-[4px]">
                  Desconectar
                </button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-[12px] mt-auto">
               <button 
                 onClick={() => navigate('/')}
                 className="px-[20px] py-[12px] rounded-[12px] font-[600] text-[14px] text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white transition-all duration-200"
               >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowSaveToast(true);
                  setTimeout(() => setShowSaveToast(false), 3000);
                }}
                className="px-[24px] py-[12px] rounded-[12px] font-[600] text-[14px] text-[#0F172A] bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#D97706] shadow-[0_4px_14px_rgba(250,204,21,0.4)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.5)] hover:-translate-y-[2px] transition-all duration-200"
              >Salvar Alterações</button>
            </div>

          </div>
        </div>
      </div>

      {/* Toast de Sucesso ao Salvar Perfil */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#16A34A] text-white px-5 py-4 rounded-[12px] shadow-[0_10px_30px_rgba(22,163,74,0.3)] flex items-center gap-3 animate-[modalOpen_0.3s_ease-out]">
          <Check className="w-5 h-5" />
          <div>
            <p className="text-[14px] font-[700]">Perfil atualizado</p>
            <p className="text-[12px] opacity-90">Suas alterações foram salvas com sucesso.</p>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.45)] backdrop-blur-[4px] p-[16px] animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-[#FFFFFF] dark:bg-[#020617] rounded-[18px] border border-[rgba(15,23,42,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_20px_40px_rgba(15,23,42,0.10)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-[24px] flex flex-col relative animate-in slide-in-from-bottom-4 duration-300">
            
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-[20px] right-[20px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              <X className="w-[20px] h-[20px]" />
            </button>

            <h3 className="text-[20px] font-[700] text-[#0F172A] dark:text-white leading-tight mb-[4px]">Alterar senha</h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-[24px]">Atualize sua senha para manter sua conta segura.</p>

            {passwordSuccess ? (
              <div className="flex flex-col items-center justify-center py-[30px] text-center">
                <CheckCircle2 className="w-[48px] h-[48px] text-[#16A34A] mb-[16px] animate-in zoom-in duration-300" />
                <span className="text-[16px] font-[600] text-[#16A34A]">{passwordSuccess}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-[16px]">
                {/* Senha Atual */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">Senha atual</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="w-full p-[12px] rounded-[12px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all pr-[40px]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">Nova senha</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({...formData, newPassword: e.target.value});
                        setPasswordError('');
                      }}
                      className="w-full p-[12px] rounded-[12px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all pr-[40px]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-[600] text-[#334155] dark:text-[#E2E8F0] ml-[4px]">Confirmar nova senha</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({...formData, confirmPassword: e.target.value});
                        setPasswordError('');
                      }}
                      className="w-full p-[12px] rounded-[12px] border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-transparent text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FACC15] focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all pr-[40px]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <span className="text-[12px] font-[500] text-[#DC2626] dark:text-[#EF4444] ml-[4px]">
                    {passwordError}
                  </span>
                )}

                <div className="flex items-center justify-end gap-[12px] mt-[16px]">
                  <button 
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-[18px] py-[12px] rounded-[12px] font-[500] text-[14px] text-[#475569] dark:text-[#94A3B8] bg-transparent border border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handlePasswordSave}
                    className="px-[18px] py-[12px] rounded-[12px] font-[600] text-[14px] text-[#0F172A] bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:translate-y-[-2px] shadow-sm hover:shadow-[0_8px_16px_rgba(250,204,21,0.18)] transition-all duration-200"
                  >
                    Salvar nova senha
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
