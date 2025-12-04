

import React, { useState, useEffect, useRef } from 'react';
import { Language, Ong, Pet } from '../types';
import { TRANSLATIONS, MOCK_ADOPTION_PETS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Mail, Phone, Globe, Copy, Check, Info, Dog, Cat, Heart, Calendar, TrendingUp, DollarSign, Users, PieChart, HelpingHand, Camera, Loader2 } from 'lucide-react';
import { db } from '../services/db';

// Declare Leaflet globally since it's added via CDN
declare const L: any;

interface OngProfileProps {
  lang: Language;
  ong: Ong;
  onBack: () => void;
  onViewPet: (pet: Pet) => void;
}

export const OngProfile: React.FC<OngProfileProps> = ({ lang, ong, onBack, onViewPet }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transparency'>('overview');
  const [ongImage, setOngImage] = useState(ong.image);
  const [isUploading, setIsUploading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Check if current user is the owner of this ONG
  const session = db.auth.getSession();
  const isOwner = session && ong.ownerId && session.id === ong.ownerId;

  // Filter pets that belong to this NGO
  const availablePets = MOCK_ADOPTION_PETS.filter(pet => pet.ongId === ong.id);

  const handleCopyPix = () => {
    if (ong.pixKey) {
        navigator.clipboard.writeText(ong.pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validation
        if (!file.type.startsWith('image/')) {
            alert(t.invalidFileType);
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert(t.fileTooLarge);
            return;
        }

        setIsUploading(true);
        
        // Simulate upload delay and processing
        const reader = new FileReader();
        reader.onload = (event) => {
            setTimeout(() => {
                const result = event.target?.result as string;
                setOngImage(result);
                setIsUploading(false);
            }, 800);
        };
        reader.readAsDataURL(file);
    }
  };

  const financials = ong.financials || {
     revenue: 5000,
     expenses: 4800,
     donors: 45,
     breakdown: { food: 2000, vet: 1500, maintenance: 800, meds: 500 }
  };

  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat(lang === Language.PT ? 'pt-BR' : 'en-US', {
          style: 'currency',
          currency: lang === Language.PT ? 'BRL' : 'USD'
      }).format(value);
  };

  const maxExpense = Math.max(...(Object.values(financials.breakdown) as number[]));

  // Initialize Map
  useEffect(() => {
    if (activeTab === 'overview' && mapContainerRef.current && ong.coordinates && !mapRef.current) {
         mapRef.current = L.map(mapContainerRef.current).setView([ong.coordinates.lat, ong.coordinates.lng], 15);

         L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapRef.current);

        const iconHtml = `
            <div class="relative w-10 h-10">
                <div class="absolute inset-0 bg-brand-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    <img src="${ongImage}" class="w-full h-full object-cover opacity-90" />
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-brand-600"></div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-map-marker',
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -48]
        });

        L.marker([ong.coordinates.lat, ong.coordinates.lng], { icon: customIcon })
            .addTo(mapRef.current)
            .bindPopup(`<b>${ong.name}</b><br>${ong.location}`)
            .openPopup();
    }

    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [activeTab, ong, ongImage]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </button>
            <span className="font-bold text-xl">
               <span className="text-brand-600">Any</span>
               <span className="text-secondary-500">Mais</span>
           </span>
        </div>
      </nav>

      <main className="pt-24 pb-20">
         {/* Hero */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-xl group">
                <img src={ongImage} alt={ong.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Photo Upload Button - Only visible to owner */}
                {isOwner && (
                    <label className="absolute bottom-6 right-6 md:bottom-10 md:right-10 cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 p-3 rounded-full text-white transition-all transform hover:scale-110 z-20">
                        {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                    </label>
                )}

                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white pointer-events-none">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-sm">{ong.name}</h1>
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                        <MapPin size={18} className="text-brand-300" /> {ong.location}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === 'overview' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    {t.tabOverview}
                    {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('transparency')}
                    className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === 'transparency' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    {t.tabTransparency}
                    {activeTab === 'transparency' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-t-full"></div>}
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Info & Pets */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-brand-500 pl-4">{t.aboutOng}</h2>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <p className="text-gray-600 text-lg leading-relaxed">{ong.description}</p>
                            </div>
                        </section>
                        
                        {/* Map Section */}
                        {ong.coordinates && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-brand-500 pl-4">{t.locationMap}</h2>
                                <div className="h-64 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
                                    <div ref={mapContainerRef} className="absolute inset-0"></div>
                                </div>
                            </section>
                        )}
                        
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-brand-500 pl-4">{t.availablePets}</h2>
                                <span className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transform hover:scale-105 transition-transform">
                                    {availablePets.length} pets
                                </span>
                            </div>
                            
                            {availablePets.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {availablePets.map(pet => (
                                        <div key={pet.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="h-56 relative overflow-hidden">
                                                <img src={pet.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={pet.name} />
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-brand-600">
                                                    {pet.type === 'cat' ? <Cat size={20} /> : <Dog size={20} />}
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                    <h3 className="font-bold text-xl text-white">{pet.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Info size={14} className="text-brand-500" />
                                                        <span>{pet.breed}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-brand-500" />
                                                        <span>{pet.age} {t.ageLabel.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    "{pet.bio}"
                                                </p>

                                                <Button 
                                                    onClick={() => onViewPet(pet)}
                                                    className="w-full flex items-center justify-center gap-2 font-bold py-3"
                                                >
                                                    <Heart size={18} className="fill-white/20" /> {t.interestBtn}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Dog size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-lg">{t.noPets}</p>
                                    <p className="text-gray-400 text-sm mt-2">Esta ONG não tem pets cadastrados no momento.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Contact & Donate */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                {t.contactOng}
                            </h3>
                            <div className="space-y-5">
                                {ong.phone && (
                                    <a href={`tel:${ong.phone}`} className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">{t.phone}</p>
                                            <span className="font-medium text-lg">{ong.phone}</span>
                                        </div>
                                    </a>
                                )}
                                {ong.email && (
                                    <a href={`mailto:${ong.email}`} className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400 font-bold uppercase">{t.email}</p>
                                            <span className="font-medium truncate block">{ong.email}</span>
                                        </div>
                                    </a>
                                )}
                                {ong.website && (
                                    <a href="#" className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Website</p>
                                            <span className="font-medium">Visitar site</span>
                                        </div>
                                    </a>
                                )}
                            </div>

                            <hr className="my-6 border-gray-100" />

                            {/* Updated Donation Card with Solid Dark Background */}
                            <div className="bg-gray-900 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden">
                                <h3 className="text-xl font-bold mb-3 relative z-10 text-white">{t.donateBtn}</h3>
                                <p className="text-gray-300 mb-6 text-sm relative z-10 leading-relaxed">Ajude {ong.name} a continuar salvando vidas. Sua contribuição faz a diferença.</p>
                                
                                {ong.pixKey && (
                                    <div className="mb-6 relative z-10">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">Chave Pix</label>
                                        <div className="bg-black/50 rounded-lg p-3 flex items-center justify-between gap-2 border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer group" onClick={handleCopyPix}>
                                            <span className="font-mono text-sm truncate select-all text-white">{ong.pixKey}</span>
                                            <button className="text-gray-400 group-hover:text-white transition-colors shrink-0">
                                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        {copied && <p className="text-green-400 text-xs mt-1 text-right font-medium animate-pulse">{t.pixCopied}</p>}
                                    </div>
                                )}

                                {ong.bankInfo && (
                                    <div className="relative z-10">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">{t.bankDetails}</label>
                                        <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm border border-gray-700">
                                            <p className="flex justify-between"><span className="text-gray-400">{t.bankName}:</span> <span className="font-medium text-white">{ong.bankInfo.bank}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-400">{t.agency}:</span> <span className="font-medium text-white">{ong.bankInfo.agency}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-400">{t.account}:</span> <span className="font-medium text-white">{ong.bankInfo.account}</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">{t.totalRaised}</h3>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(financials.revenue)}</p>
                            <p className="text-sm text-green-600 mt-2 font-medium">+12% vs mês anterior</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                    <DollarSign size={24} />
                                </div>
                                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">{t.totalExpenses}</h3>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(financials.expenses)}</p>
                            <p className="text-sm text-gray-500 mt-2">Dentro do orçamento</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Users size={24} />
                                </div>
                                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">{t.activeDonors}</h3>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">{financials.donors}</p>
                            <p className="text-sm text-blue-600 mt-2 font-medium">Junte-se a eles!</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-8">
                                <PieChart className="text-brand-500" />
                                <h3 className="text-xl font-bold text-gray-900">{t.monthlyBreakdown}</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                                        <span>{t.expenseFood}</span>
                                        <span>{formatCurrency(financials.breakdown.food)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div className="bg-orange-400 h-3 rounded-full" style={{ width: `${(financials.breakdown.food / maxExpense) * 80}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                                        <span>{t.expenseVet}</span>
                                        <span>{formatCurrency(financials.breakdown.vet)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div className="bg-blue-400 h-3 rounded-full" style={{ width: `${(financials.breakdown.vet / maxExpense) * 80}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                                        <span>{t.expenseMaintenance}</span>
                                        <span>{formatCurrency(financials.breakdown.maintenance)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div className="bg-gray-400 h-3 rounded-full" style={{ width: `${(financials.breakdown.maintenance / maxExpense) * 80}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                                        <span>{t.expenseMeds}</span>
                                        <span>{formatCurrency(financials.breakdown.meds)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div className="bg-purple-400 h-3 rounded-full" style={{ width: `${(financials.breakdown.meds / maxExpense) * 80}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100">
                             <div className="flex items-center gap-3 mb-6">
                                <HelpingHand className="text-brand-600" />
                                <h3 className="text-xl font-bold text-brand-900">{t.howToHelpTitle}</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600 shrink-0"><Check size={16} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Doação Recorrente</h4>
                                        <p className="text-sm text-gray-600 mt-1">Ajude com um valor fixo mensal e garanta a alimentação de um pet.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Check size={16} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Voluntariado</h4>
                                        <p className="text-sm text-gray-600 mt-1">{t.helpTip1}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm">
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600 shrink-0"><Check size={16} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Materiais</h4>
                                        <p className="text-sm text-gray-600 mt-1">{t.helpTip2}</p>
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-8">
                                <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 shadow-lg" onClick={handleCopyPix}>
                                    Quero Ajudar Agora
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

         </div>
      </main>
    </div>
  );
};