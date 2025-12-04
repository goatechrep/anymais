import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, ChevronDown, Globe } from 'lucide-react';

interface LegalPagesProps {
  type: 'terms' | 'privacy';
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, lang, setLang, onBack }) => {
  const t = TRANSLATIONS[lang];
  const title = type === 'terms' ? t.termsTitle : t.privacyTitle;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
       <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">{t.backToHome}</span>
              </button>
              <div className="ml-6 flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <span className="font-bold text-xl">
                   <span className="text-brand-600">Any</span>
                   <span className="text-secondary-500">Mais</span>
               </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Globe size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as Language)}
                        className="pl-8 pr-8 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer hover:bg-gray-50 outline-none uppercase"
                    >
                        {Object.values(Language).map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
            </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
          
          <div className="prose prose-brand text-gray-600 leading-relaxed space-y-6">
            <p className="font-medium text-gray-900">
              {lang === Language.PT ? 'Última atualização: Outubro 2024' : 'Last updated: October 2024'}
            </p>

            {type === 'terms' ? (
              <>
                 <p>
                   {lang === Language.PT 
                    ? 'Bem-vindo ao AnyMais. Ao acessar ou usar nossa plataforma, você concorda em cumprir estes Termos de Uso. Nossos serviços são destinados a conectar donos de pets, prestadores de serviço e promover a adoção responsável.'
                    : 'Welcome to AnyMais. By accessing or using our platform, you agree to comply with these Terms of Use. Our services are intended to connect pet owners, service providers, and promote responsible adoption.'}
                 </p>
                 <h3 className="text-lg font-bold text-gray-900 mt-6">1. {lang === Language.PT ? 'Uso da Plataforma' : 'Platform Usage'}</h3>
                 <p>
                   {lang === Language.PT
                    ? 'Você é responsável por manter a confidencialidade de sua conta e senha. O AnyMais não se responsabiliza por perdas decorrentes do uso não autorizado de sua conta.'
                    : 'You are responsible for maintaining the confidentiality of your account and password. AnyMais is not liable for losses resulting from unauthorized use of your account.'}
                 </p>
                 <h3 className="text-lg font-bold text-gray-900 mt-6">2. {lang === Language.PT ? 'Conteúdo do Usuário' : 'User Content'}</h3>
                 <p>
                    {lang === Language.PT
                     ? 'Ao postar fotos e informações sobre seus pets, você garante que possui os direitos sobre esse conteúdo e concede ao AnyMais uma licença para exibi-lo na plataforma.'
                     : 'By posting photos and information about your pets, you warrant that you own the rights to this content and grant AnyMais a license to display it on the platform.'}
                 </p>
              </>
            ) : (
              <>
                <p>
                  {lang === Language.PT 
                   ? 'Sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD).' 
                   : 'Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.'}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-6">1. {lang === Language.PT ? 'Coleta de Dados' : 'Data Collection'}</h3>
                <p>
                   {lang === Language.PT
                    ? 'Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e dados do seu pet. Também podemos coletar dados de localização se você autorizar, para melhorar a experiência de busca.'
                    : 'We collect information you provide directly to us, such as name, email, phone, and pet details. We may also collect location data if authorized, to improve search experience.'}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-6">2. {lang === Language.PT ? 'Uso dos Dados' : 'Data Usage'}</h3>
                <p>
                   {lang === Language.PT
                    ? 'Usamos seus dados para fornecer nossos serviços, processar pagamentos (planos Premium) e enviar notificações relevantes. Não vendemos seus dados pessoais a terceiros.'
                    : 'We use your data to provide our services, process payments (Premium plans), and send relevant notifications. We do not sell your personal data to third parties.'}
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};