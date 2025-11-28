
import React, { useState, useEffect } from 'react';
import { Language, AppView, User, PlanType } from './types';
import { TRANSLATIONS } from './constants';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/Button';
import { Globe, Check, Lock } from 'lucide-react';
import { db } from './services/db';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.PT);
  const [view, setView] = useState<AppView>('landing');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // UI State
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('basic');

  const t = TRANSLATIONS[lang];

  // Check for existing session on load
  useEffect(() => {
    const session = db.auth.getSession();
    if (session) {
      setView('dashboard');
    }
  }, []);

  // Handle Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = (l: Language) => setLang(l);

  // Phone Mask Helper
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    if (numbers.length > 10) {
      // (11) 91234-5678
      return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (numbers.length > 6) {
      // (11) 1234-5678 (Fixed line or partial mobile)
      return numbers.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (numbers.length > 2) {
      return numbers.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else {
      return numbers.replace(/^(\d*)/, '($1');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isLoginMode) {
      const user = db.auth.login(email, password);
      if (user) {
        setShowLogin(false);
        setView('dashboard');
        resetForm();
      } else {
        setAuthError(lang === Language.PT ? 'E-mail ou senha inválidos.' : 'Invalid email or password.');
      }
    } else {
      // Signup
      if (password !== confirmPassword) {
        setAuthError(lang === Language.PT ? 'As senhas não conferem.' : 'Passwords do not match.');
        return;
      }
      
      const newUser = db.auth.signup({
        name,
        email,
        password, // Note: In production, never store plain text passwords
        phone,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        plan: selectedPlan
      });

      if (newUser) {
        setShowLogin(false);
        setView('dashboard');
        resetForm();
      } else {
        setAuthError(lang === Language.PT ? 'E-mail já cadastrado.' : 'Email already exists.');
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
    setAuthError('');
    setSelectedPlan('basic');
  };

  const openLogin = () => {
    setIsLoginMode(true);
    setShowLogin(true);
    setAuthError('');
  };

  const openSignup = (plan: PlanType = 'basic') => {
    setSelectedPlan(plan);
    setIsLoginMode(false);
    setShowLogin(true);
    setAuthError('');
  };

  const handleLogout = () => {
    db.auth.logout();
    setView('landing');
  };

  if (view === 'dashboard') {
    return <Dashboard lang={lang} setLang={setLang} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm py-1' 
          : 'bg-transparent border-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
               <span className="text-3xl">🐾</span>
               <span className="font-bold text-2xl text-brand-600">AnyMais</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-2">
                {Object.values(Language).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => toggleLang(l)}
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${lang === l ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={openLogin}>{t.ctaLogin}</Button>
              <Button onClick={() => openSignup('basic')}>{t.createAccount}</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" onClick={() => openSignup('start')}>{t.ctaStart}</Button>
            <Button size="lg" variant="outline" onClick={openLogin}>{t.ctaLogin}</Button>
          </div>
        </div>
        {/* Decorative background blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-50 rounded-full blur-3xl -z-10 opacity-50" />
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Planos para todos os momentos</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:border-brand-200 transition-all">
              <h3 className="text-xl font-bold text-gray-900">{t.planBasic}</h3>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-extrabold">{t.priceFree}</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-green-500 mr-2" /> {t.featProfile}
                </li>
                <li className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-green-500 mr-2" /> {t.featAdoption}
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-8" onClick={() => openSignup('basic')}>{t.btnChooseBasic}</Button>
            </div>

            {/* Start */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-brand-500 relative transform md:-translate-y-4">
              <span className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">{t.popular}</span>
              <h3 className="text-xl font-bold text-gray-900">{t.planStart}</h3>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-extrabold">{t.priceStart}</span>
                <span className="ml-1 text-xl text-gray-500">{t.perMonth}</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-brand-500 mr-2" /> {t.featBasic}
                </li>
                <li className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-brand-500 mr-2" /> {t.featVaccines}
                </li>
                 <li className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-brand-500 mr-2" /> {t.featScheduling}
                </li>
              </ul>
              <Button className="w-full mt-8" onClick={() => openSignup('start')}>{t.btnChooseStart}</Button>
            </div>

            {/* Premium */}
            <div className="bg-gray-900 rounded-2xl shadow-sm p-8 text-white border border-gray-800">
              <h3 className="text-xl font-bold text-white">{t.planPremium}</h3>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold">{t.pricePremium}</span>
                <span className="ml-1 text-xl text-gray-400">{t.perMonth}</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center text-sm text-gray-300">
                  <Check size={16} className="text-brand-400 mr-2" /> {t.featStart}
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <Check size={16} className="text-brand-400 mr-2" /> {t.featDating}
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <Check size={16} className="text-brand-400 mr-2" /> {t.featAIBio}
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <Check size={16} className="text-brand-400 mr-2" /> {t.featSupport}
                </li>
              </ul>
              <Button variant="secondary" className="w-full mt-8" onClick={() => openSignup('premium')}>{t.btnChoosePremium}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 AnyMais. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <span className="text-4xl">🐾</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                  {isLoginMode ? t.loginTitle : t.signupTitle}
                </h2>
                {!isLoginMode && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected Plan: <span className="font-bold uppercase text-brand-600">{selectedPlan}</span>
                  </p>
                )}
              </div>
              
              {authError && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLoginMode && (
                   <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                   </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full py-3 mt-2">
                  {isLoginMode ? t.loginButton : t.signupButton}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }}
                  className="text-sm text-brand-600 hover:text-brand-800 font-medium"
                >
                  {isLoginMode ? t.noAccount : t.haveAccount}
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <Lock size={14} className="inline mr-1" />
                Secure connection via SSL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
