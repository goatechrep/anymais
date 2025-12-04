import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, ChevronDown, Globe, Mail, Phone, MapPin, Instagram, Facebook, Youtube, Rocket, Code, Heart, HelpCircle, FileText, ChevronRight, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface StaticPagesProps {
  type: 'about' | 'careers' | 'blog' | 'contact' | 'help';
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ type, lang, setLang, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const getTitle = () => {
    switch (type) {
      case 'about': return t.aboutTitle;
      case 'careers': return t.careersTitle;
      case 'blog': return t.blogTitle;
      case 'contact': return t.contactTitle;
      case 'help': return t.helpTitle;
    }
  };

  const ThreadsIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12a7 7 0 1 0-1.7 4.6c-.7 1.3-1.6 2.3-3.3 2.3-2 0-3-1.8-3-4 0-2.3 1.2-4 3-4 1.5 0 2.5 1 2.5 3v1c0 1.5 1 2.5 2 2.5s2.5-1.5 2.5-3.5C21 8 17 4 12 4 7 4 3 8 3 13.5 3 19 8 22 13 22" />
    </svg>
  );

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa Missão</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                O AnyMais nasceu de um sonho: criar um ecossistema único onde o amor pelos animais se conecta com a facilidade da tecnologia. 
                Não somos apenas um app; somos uma startup apaixonada por transformar a vida de pets e seus donos.
                Nosso objetivo é integrar adoção, saúde, serviços e comunidade em uma única plataforma segura e intuitiva.
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-brand-50 p-8 rounded-2xl text-center">
                 <Heart size={40} className="mx-auto text-brand-600 mb-4" />
                 <h3 className="font-bold text-xl mb-2">Conexão</h3>
                 <p className="text-gray-600">Unimos quem quer adotar, quem quer cuidar e quem oferece serviços.</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-2xl text-center">
                 <Rocket size={40} className="mx-auto text-blue-600 mb-4" />
                 <h3 className="font-bold text-xl mb-2">Inovação</h3>
                 <p className="text-gray-600">Usamos IA e Geolocalização para facilitar a vida dos tutores.</p>
              </div>
              <div className="bg-green-50 p-8 rounded-2xl text-center">
                 <HelpCircle size={40} className="mx-auto text-green-600 mb-4" />
                 <h3 className="font-bold text-xl mb-2">Impacto Social</h3>
                 <p className="text-gray-600">Apoiamos ONGs e promovemos a adoção responsável em todo o país.</p>
              </div>
            </div>
          </div>
        );

      case 'careers':
        return (
          <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Faça parte do nosso bando!</h2>
              <p className="text-lg text-gray-600">
                Estamos construindo o futuro do cuidado animal e precisamos de talentos como você.
                Se você ama tecnologia e pets, este é o seu lugar.
              </p>
            </section>

            <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <Code size={32} className="text-brand-400" />
                    <h3 className="text-2xl font-bold">Área de Tecnologia & Produto</h3>
                 </div>
                 <p className="text-gray-300 mb-6 max-w-xl">
                   Buscamos desenvolvedores apaixonados por código limpo e inovação. 
                   Nossa stack envolve React, Tailwind, Inteligência Artificial e soluções Mobile-first.
                   Valorizamos criatividade, autonomia e vontade de aprender.
                 </p>
                 <ul className="space-y-2 mb-8 text-gray-400">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-500 rounded-full"></div> Frontend Engineer (React/React Native)</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-500 rounded-full"></div> Backend Developer (Node.js/Python)</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-500 rounded-full"></div> UX/UI Designer</li>
                 </ul>
                 <Button className="bg-white text-gray-900 hover:bg-gray-100">Ver Vagas Abertas</Button>
               </div>
               <div className="absolute right-0 bottom-0 opacity-10">
                  <Code size={300} />
               </div>
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-12">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                     <div className="h-48 bg-gray-200 relative">
                        <img src={`https://picsum.photos/seed/blog${i}/400/250`} alt="Blog Cover" className="w-full h-full object-cover" />
                     </div>
                     <div className="p-6">
                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 block">Dicas de Saúde</span>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Como cuidar da alimentação do seu pet no verão?</h3>
                        <p className="text-gray-500 text-sm mb-4">Descubra os melhores alimentos e práticas para manter seu amigo hidratado e saudável...</p>
                        <a href="#" className="text-brand-600 font-bold text-sm hover:underline">Ler mais</a>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-brand-50 rounded-2xl p-8 text-center border border-brand-100">
                <FileText size={40} className="mx-auto text-brand-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ama escrever sobre pets?</h3>
                <p className="text-gray-600 mb-6">Torne-se um redator parceiro do blog AnyMais e compartilhe seu conhecimento com nossa comunidade.</p>
                <Button>{t.blogPartnerBtn}</Button>
             </div>
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
             <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Canais de Atendimento</h2>
                
                <div className="space-y-6">
                   <a href="mailto:contato@anymais.com.br" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                         <Mail size={24} />
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-bold text-gray-500 uppercase">E-mail</p>
                         <p className="font-medium text-gray-900 break-all">contato@anymais.com.br</p>
                      </div>
                   </a>

                   <a href="https://wa.me/5518996475908" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border border-green-100">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                         <Phone size={24} />
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-bold text-green-700 uppercase">WhatsApp Suporte</p>
                         <p className="font-medium text-gray-900">+55 (18) 99647-5908</p>
                      </div>
                   </a>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                   <p className="text-gray-500 mb-4 font-medium">Siga-nos nas redes sociais</p>
                   <div className="flex justify-center gap-4">
                      <a href="https://instagram.com/anymaisbr" target="_blank" className="p-3 bg-gray-100 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"><Instagram size={24} /></a>
                      <a href="https://facebook.com/anymaisbr" target="_blank" className="p-3 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"><Facebook size={24} /></a>
                      <a href="https://threads.com/anymaisbr" target="_blank" className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-black transition-colors"><ThreadsIcon size={24} /></a>
                      <a href="https://youtube.com/anymaisbr" target="_blank" className="p-3 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"><Youtube size={24} /></a>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'help':
        const faqs = [
          { q: "Quais são os planos disponíveis?", a: "Oferecemos o AnyBasic (Gratuito), AnyStart (R$ 29,90/mês) e AnyPremium (R$ 59,90/mês). Cada um com funcionalidades específicas para a necessidade do seu pet." },
          { q: "Como cadastro minha ONG?", a: "É simples! Clique no botão 'Cadastrar Minha ONG' na página inicial ou acesse a área de parceiros. O cadastro é gratuito." },
          { q: "Como funciona o Achados e Perdidos?", a: "Utilizamos a geolocalização do seu dispositivo para alertar a comunidade local sobre pets perdidos ou encontrados na região." },
          { q: "A ferramenta de Namoro é segura?", a: "Sim! Apenas usuários verificados e com plano Premium têm acesso total. Recomendamos sempre encontros em locais públicos." },
          { q: "Posso agendar serviços pelo app?", a: "Com certeza! No plano AnyStart ou superior, você tem acesso à agenda de veterinários, banho e tosa e hotéis parceiros." }
        ];

        return (
          <div className="max-w-3xl mx-auto">
             <div className="space-y-4">
                {faqs.map((faq, index) => (
                   <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                         <span className="font-bold text-gray-900">{faq.q}</span>
                         {openFaqIndex === index ? <ChevronUp className="text-brand-500" /> : <ChevronDown className="text-gray-400" />}
                      </button>
                      {openFaqIndex === index && (
                         <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                            {faq.a}
                         </div>
                      )}
                   </div>
                ))}
             </div>
             <div className="mt-12 text-center bg-brand-50 rounded-2xl p-8">
                <p className="text-gray-800 font-medium mb-4">Ainda tem dúvidas?</p>
                <Button onClick={() => window.open('https://wa.me/5518996475908', '_blank')} className="gap-2">
                   <Phone size={18} /> Fale com o Suporte
                </Button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
       <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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
                <span className="font-bold text-xl text-brand-600">AnyMais</span>
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
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{getTitle()}</h1>
               <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full"></div>
            </div>
            
            {renderContent()}
         </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8 text-center">
         <p className="text-gray-500 text-sm">&copy; 2025 AnyMais. {t.footerRights}.</p>
      </footer>
    </div>
  );
};