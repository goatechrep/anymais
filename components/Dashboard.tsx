
import React, { useState, useEffect } from 'react';
import { DashboardView, Language, Pet, User, PlanType } from '../types';
import { TRANSLATIONS, MOCK_ADOPTION_PETS, MOCK_DATING_PETS, MOCK_SERVICES } from '../constants';
import { Heart, Home, Stethoscope, Calendar, User as UserIcon, LogOut, Syringe, Pencil, Save, X, Camera, Plus, ChevronDown, Settings, Trash2, CreditCard, Check, AlertCircle, Menu, Lock, PawPrint, Sparkles, MapPin, Navigation, Loader2 } from 'lucide-react';
import { ServiceBooking } from './ServiceBooking';
import { Button } from './Button';
import { db } from '../services/db';
import { generatePetBio } from '../services/geminiService';
import { calculateDistance, mockReverseGeocode } from '../utils';

interface DashboardProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogout: () => void;
}

const getPlaceholderImage = (type: string) => {
  switch (type) {
    case 'dog': return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
    case 'cat': return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80';
    case 'bird': return 'https://images.unsplash.com/photo-1552728089-57bdde30beb8?auto=format&fit=crop&w=400&q=80';
    case 'other': return 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=400&q=80';
    default: return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
  }
};

// Image optimization helper
const optimizeImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
           // Fallback if canvas fails
           resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(""); // Fail gracefully
    };
    reader.onerror = () => resolve("");
  });
};

export const Dashboard: React.FC<DashboardProps> = ({ lang, setLang, onLogout }) => {
  const t = TRANSLATIONS[lang];
  
  // --- State: User ---
  // Initialize with a placeholder, then load from DB
  const [currentUser, setCurrentUser] = useState<User>({
    id: '', name: '', email: '', phone: '', image: '', plan: 'basic', favorites: []
  });
  
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(currentUser);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>('');

  // --- State: Pets ---
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  
  // UI State
  const [activeView, setActiveView] = useState<DashboardView>('profile');
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editedPet, setEditedPet] = useState<Pet | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [datingAlert, setDatingAlert] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // New Pet State
  const [newPet, setNewPet] = useState<Pet>({
    id: '',
    name: '',
    breed: '',
    age: 0,
    weight: 0,
    type: 'dog',
    image: getPlaceholderImage('dog'),
    bio: '',
    availableForDating: false
  });

  // Update new pet image when type changes, but only if user hasn't uploaded a custom one
  useEffect(() => {
     if (newPet.image.startsWith('http')) {
        setNewPet(prev => ({ ...prev, image: getPlaceholderImage(prev.type) }));
     }
  }, [newPet.type]);

  // --- Effects: Load Data ---
  useEffect(() => {
    const session = db.auth.getSession();
    if (session) {
      setCurrentUser(session);
      setEditedUser(session);
      
      // Load pets for this user
      const userPets = db.pets.listByOwner(session.id);
      setPets(userPets);
      if (userPets.length > 0) {
        setActivePetId(userPets[0].id);
      }
    } else {
      onLogout(); // Should not happen if App.tsx handles auth correctly
    }
  }, []);

  // Effect: Resolve User Address from Coords
  useEffect(() => {
    const targetUser = isEditingUser ? editedUser : currentUser;
    if (targetUser.location) {
        const fetchAddress = async () => {
            try {
                const addr = await mockReverseGeocode(targetUser.location!.lat, targetUser.location!.lng);
                setLocationAddress(addr);
            } catch (e) {
                setLocationAddress('');
            }
        };
        fetchAddress();
    } else {
        setLocationAddress('');
    }
  }, [currentUser.location, editedUser.location, isEditingUser]);

  // Derived State
  const activePet = pets.find(p => p.id === activePetId) || null;

  // Update edited pet when active pet changes
  useEffect(() => {
    if (activePet) {
      setEditedPet(activePet);
    }
  }, [activePet, activePetId]);

  // --- Plan Logic ---
  const checkPlanAccess = (view: DashboardView) => {
      if (view === 'profile' || view === 'adoption' || view === 'user-profile' || view === 'create-pet') return true;
      if (currentUser.plan === 'basic') return false;
      if (currentUser.plan === 'start') {
          if (view === 'health' || view === 'services') return true;
          return false;
      }
      if (currentUser.plan === 'premium') return true;
      return false;
  };

  const getPlanDescription = (plan: PlanType) => {
    switch(plan) {
      case 'basic': return t.planDescBasic;
      case 'start': return t.planDescStart;
      case 'premium': return t.planDescPremium;
      default: return '';
    }
  };

  // --- Handlers: User ---
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length > 10) return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (numbers.length > 6) return numbers.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (numbers.length > 2) return numbers.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    else return numbers.replace(/^(\d*)/, '($1');
  };

  const handleUserPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file);
        setEditedUser(prev => ({ ...prev, image: optimized }));
      } catch (error) {
        console.error("Error processing image", error);
      }
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setIsUpdatingLocation(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const updated = { ...editedUser, location: coords };
        setEditedUser(updated);
        // Also update immediately if not in full edit mode, for better UX
        if (!isEditingUser) {
           setCurrentUser(updated);
           db.auth.updateUser(updated);
           alert(t.locationUpdated);
        }
        setIsUpdatingLocation(false);
      }, (error) => {
        console.error("Error getting location", error);
        alert(t.locationError);
        setIsUpdatingLocation(false);
      });
    } else {
      alert("Geolocation not supported");
    }
  };

  const saveUser = () => {
    db.auth.updateUser(editedUser); // Save to DB
    setCurrentUser(editedUser);
    setIsEditingUser(false);
  };

  const handleUpdatePlan = (newPlan: PlanType) => {
    const updatedUser = { ...currentUser, plan: newPlan };
    db.auth.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setEditedUser(updatedUser); // Sync edited state
    setShowPlanModal(false);
  };

  const toggleFavorite = (petId: string) => {
    const currentFavorites = currentUser.favorites || [];
    let newFavorites: string[];
    
    if (currentFavorites.includes(petId)) {
      newFavorites = currentFavorites.filter(id => id !== petId);
    } else {
      newFavorites = [...currentFavorites, petId];
    }
    
    const updatedUser = { ...currentUser, favorites: newFavorites };
    setCurrentUser(updatedUser);
    setEditedUser(updatedUser);
    db.auth.updateUser(updatedUser);
  };

  // --- Handlers: Pet Actions ---
  const handlePetPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file);
        if (editedPet) {
          setEditedPet({ ...editedPet, image: optimized });
        }
      } catch (error) {
        console.error("Error processing image", error);
      }
    }
  };

  const handleNewPetPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file);
        setNewPet(prev => ({ ...prev, image: optimized }));
      } catch (error) {
        console.error("Error processing image", error);
      }
    }
  };

  const savePetChanges = () => {
    if (editedPet && activePetId) {
      db.pets.update(editedPet); // Save to DB
      setPets(prev => prev.map(p => p.id === activePetId ? editedPet : p));
      setIsEditingPet(false);
    }
  };

  const handleDeletePet = () => {
    if (window.confirm(t.confirmDeletePet)) {
      if (activePetId) {
        db.pets.delete(activePetId); // Remove from DB
      }
      const remainingPets = pets.filter(p => p.id !== activePetId);
      setPets(remainingPets);
      setIsEditingPet(false);
      setEditedPet(null);
      if (remainingPets.length > 0) {
        setActivePetId(remainingPets[0].id);
      } else {
        setActivePetId(null);
      }
    }
  };

  const handleCreatePet = () => {
    if (!currentUser.id) return;
    const petToCreate = { ...newPet, ownerId: currentUser.id };
    const createdPet = db.pets.create(petToCreate); // Save to DB
    setPets([...pets, createdPet]);
    setActivePetId(createdPet.id);
    setActiveView('profile');
    setNewPet({
      id: '',
      name: '',
      breed: '',
      age: 0,
      weight: 0,
      type: 'dog',
      image: getPlaceholderImage('dog'),
      bio: '',
      availableForDating: false
    });
    setDatingAlert(false);
  };

  const handleGenerateBio = async (target: 'new' | 'edit') => {
    if (currentUser.plan !== 'premium') {
        setShowPlanModal(true);
        return;
    }
    const data = target === 'new' ? newPet : editedPet;
    if (!data) return;
    
    setIsGeneratingBio(true);
    try {
        const traits = `${data.age} ${lang === Language.PT ? 'anos' : 'years old'}, ${data.type}, ${data.weight}kg`;
        const bio = await generatePetBio(data.name || 'Pet', data.breed || 'Unknown', traits);
        if (target === 'new') {
            setNewPet(prev => ({ ...prev, bio }));
        } else {
            setEditedPet(prev => prev ? ({ ...prev, bio }) : null);
        }
    } catch (e) {
        console.error("Bio gen failed", e);
    } finally {
        setIsGeneratingBio(false);
    }
  };

  const getPlanName = (plan: PlanType) => {
    switch(plan) {
      case 'basic': return t.planBasic;
      case 'start': return t.planStart;
      case 'premium': return t.planPremium;
      default: return plan;
    }
  };

  const getPlanColor = (plan: PlanType) => {
    switch(plan) {
      case 'basic': return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'start': return 'bg-pink-100 text-pink-900 border-pink-200';
      case 'premium': return 'bg-purple-100 text-purple-900 border-purple-200';
      default: return 'bg-gray-100 text-gray-900 border-gray-300';
    }
  };
  
  const getPetTypeLabel = (type: Pet['type']) => {
    switch (type) {
      case 'dog': return t.typeDog;
      case 'cat': return t.typeCat;
      case 'bird': return t.typeBird;
      case 'other': return t.typeOther;
      default: return t.typeOther;
    }
  };

  // Helper to get distance string
  const getDistanceText = (itemLocation?: {lat: number, lng: number}) => {
      if (!currentUser.location || !itemLocation) return null;
      const dist = calculateDistance(currentUser.location.lat, currentUser.location.lng, itemLocation.lat, itemLocation.lng);
      return `${dist} ${t.kmAway}`;
  };

  // --- Render Components ---

  const NavItem = ({ view, icon: Icon, label, locked, description, planReq }: { view: DashboardView, icon: any, label: string, locked?: boolean, description?: string, planReq?: string }) => (
    <button
      onClick={() => { setActiveView(view); setMobileMenuOpen(false); }}
      disabled={!activePet && view !== 'user-profile' && view !== 'create-pet'}
      className={`relative group flex items-center w-full p-3 rounded-lg mb-2 transition-colors justify-between ${
        activeView === view 
          ? 'bg-brand-50 text-brand-600 font-medium' 
          : (!activePet && view !== 'user-profile' && view !== 'create-pet')
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center">
        <Icon size={20} className="mr-3" />
        {label}
      </div>
      {locked && <Lock size={14} className="text-gray-400 group-hover:text-brand-500" />}

      {/* Tooltip (Desktop Only) */}
      <div className="hidden md:block invisible group-hover:visible absolute left-full top-1/2 -translate-y-1/2 ml-3 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="font-bold mb-1 text-sm">{label}</div>
          <div className="text-gray-300 mb-2 leading-tight">{description}</div>
          {planReq && (
              <div className={`font-bold uppercase text-[10px] tracking-wider ${locked ? 'text-red-300' : 'text-green-300'}`}>
                  {planReq}
              </div>
          )}
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </button>
  );

  const LockedFeature = ({ feature }: { feature: string }) => (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
           <Lock size={40} className="text-gray-400" />
       </div>
       <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.featureLocked}</h2>
       <p className="text-gray-500 mb-8 max-w-md">{t.upgradeToAccess}</p>
       <Button onClick={() => setShowPlanModal(true)} className="flex items-center gap-2 shadow-lg shadow-brand-100">
          <CreditCard size={18} /> {t.unlockNow}
       </Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:z-20 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand & Pet Switcher */}
        <div className="p-6 border-b border-gray-100 relative">
           <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 md:hidden"><X size={24} /></button>
          <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span> AnyMais
          </h1>
          <div className="relative">
            <button 
              onClick={() => setShowPetDropdown(!showPetDropdown)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-2 hover:border-pink-300 transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-center gap-3 w-full">
                {activePet ? (
                  <>
                    <img src={activePet.image} alt={activePet.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500 ring-offset-1 flex-shrink-0 bg-gray-100" />
                    <div className="flex flex-col items-start overflow-hidden min-w-0">
                      <span className="font-bold text-brand-900 text-sm leading-tight truncate w-full text-left">{activePet.name}</span>
                      <span className="text-xs font-medium text-gray-500 truncate w-full text-left">{activePet.breed}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><Plus size={20} className="text-gray-400" /></div>
                    <span className="text-gray-500 font-medium text-sm">{t.selectPet}</span>
                  </div>
                )}
              </div>
              <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-500 transition-colors ml-1 flex-shrink-0" />
            </button>
            {showPetDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in ring-1 ring-black/5">
                <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                  {pets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => { setActivePetId(pet.id); setShowPetDropdown(false); if (activeView === 'create-pet' || activeView === 'user-profile') setActiveView('profile'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl mb-1 hover:bg-gray-50 text-left transition-all ${activePetId === pet.id ? 'bg-brand-50 ring-1 ring-pink-200' : ''}`}
                    >
                      <div className={`relative rounded-full flex-shrink-0`}>
                        <img src={pet.image} alt={pet.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                        {activePetId === pet.id && (<div className="absolute -bottom-1 -right-1 bg-brand-600 text-white rounded-full p-[2px] border-2 border-white"><Check size={8} strokeWidth={4} /></div>)}
                      </div>
                      <div className="flex flex-col overflow-hidden min-w-0">
                        <span className={`font-bold text-sm truncate ${activePetId === pet.id ? 'text-brand-900' : 'text-gray-900'}`}>{pet.name}</span>
                        <span className="text-xs text-gray-500 truncate">{pet.breed}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-1 border-t border-gray-100">
                  <button onClick={() => { setActiveView('create-pet'); setShowPetDropdown(false); setActivePetId(null); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl text-brand-600 hover:bg-brand-50 text-sm font-bold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center"><Plus size={16} /></div>
                    {t.addNewPet}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 overflow-y-auto md:overflow-visible overflow-x-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</p>
          <div className="relative z-30">
            <NavItem view="profile" icon={Home} label={t.dashProfile} description={t.tooltipProfile} planReq={t.reqPlanBasic} />
            <NavItem view="adoption" icon={PawPrint} label={t.dashAdoption} description={t.tooltipAdoption} planReq={t.reqPlanBasic} />
            <NavItem view="dating" icon={Heart} label={t.dashDating} locked={!checkPlanAccess('dating')} description={t.tooltipDating} planReq={t.reqPlanPremium} />
            <NavItem view="health" icon={Stethoscope} label={t.dashHealth} locked={!checkPlanAccess('health')} description={t.tooltipHealth} planReq={t.reqPlanStart} />
            <NavItem view="services" icon={Calendar} label={t.dashServices} locked={!checkPlanAccess('services')} description={t.tooltipServices} planReq={t.reqPlanStart} />
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <div className="flex justify-center gap-2 mb-3">
            {Object.values(Language).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-xs font-bold uppercase border ${lang === l ? 'bg-brand-100 text-brand-900 border-brand-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => { setActiveView('user-profile'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white hover:shadow-sm ${activeView === 'user-profile' ? 'bg-white shadow-sm ring-1 ring-pink-200' : ''}`}>
            <img src={currentUser.image || 'https://i.pravatar.cc/150'} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{t.userSettings}</p>
            </div>
            <Settings size={16} className="ml-auto text-gray-400" />
          </button>
          <button onClick={onLogout} className="mt-3 flex items-center justify-center text-red-500 p-2 hover:bg-red-50 w-full rounded-lg transition-colors text-sm font-medium">
            <LogOut size={16} className="mr-2" /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-10 border-b p-4 flex justify-between items-center">
         <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><Menu size={24} /></button>
         <span className="font-bold text-brand-600 text-lg">AnyMais</span>
         <button onClick={() => setShowPetDropdown(!showPetDropdown)} className="bg-gray-100 p-1 rounded-full relative">
            {activePet ? (<img src={activePet.image} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500 ring-offset-1" />) : (<div className="w-8 h-8 flex items-center justify-center"><Plus size={20} className="text-gray-500" /></div>)}
         </button>
      </div>
      {showPetDropdown && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPetDropdown(false)}>
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-gray-700 mb-4">{t.switchPet}</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                     {pets.map(pet => (
                        <button key={pet.id} onClick={() => { setActivePetId(pet.id); setShowPetDropdown(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${activePetId === pet.id ? 'bg-brand-50 border-pink-200 text-brand-900' : 'border-transparent hover:bg-gray-50'}`}>
                            <img src={pet.image} className={`w-12 h-12 rounded-full object-cover ${activePetId === pet.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`} />
                            <div className="flex flex-col items-start"><span className="font-medium text-gray-900">{pet.name}</span><span className="text-xs text-gray-500">{pet.breed}</span></div>
                            {activePetId === pet.id && <div className="bg-brand-600 text-white rounded-full p-1 ml-auto"><Check size={14} /></div>}
                        </button>
                     ))}
                     <button onClick={() => { setActiveView('create-pet'); setShowPetDropdown(false); setActivePetId(null); }} className="flex items-center gap-3 w-full p-3 text-brand-600 font-bold border-t mt-2 pt-4 hover:bg-brand-50 rounded-xl transition-colors">
                         <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><Plus size={20} /></div> {t.addNewPet}
                     </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 pt-20 md:pt-10 pb-24 md:pb-10">
        
        {/* CREATE NEW PET VIEW */}
        {activeView === 'create-pet' && (
           <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.addNewPet}</h2>
              {/* ... (Create Pet UI similar to previous version) ... */}
              <div className="flex justify-center mb-6">
                  <div className="relative group">
                      <img src={newPet.image} alt="New Pet" className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 bg-gray-50" />
                      <label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-700 shadow-lg transition-transform hover:scale-110 z-10">
                          <Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleNewPetPhotoUpload}/>
                      </label>
                  </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.petName}</label>
                    <input type="text" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" placeholder="Rex"/>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.petType}</label>
                    <select value={newPet.type} onChange={e => setNewPet({...newPet, type: e.target.value as Pet['type']})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900">
                        {Object.keys(t).filter(k => k.startsWith('type')).map(key => {
                             const val = key === 'typeDog' ? 'dog' : key === 'typeCat' ? 'cat' : key === 'typeBird' ? 'bird' : 'other';
                             return <option key={val} value={val}>{getPetTypeLabel(val as Pet['type'])}</option>
                        })}
                    </select>
                 </div>
                 <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.breedLabel}</label><input type="text" value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.ageLabel}</label><input type="number" value={newPet.age} onChange={e => setNewPet({...newPet, age: parseInt(e.target.value) || 0})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.weight}</label><input type="number" value={newPet.weight} onChange={e => setNewPet({...newPet, weight: parseFloat(e.target.value) || 0})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-bold text-gray-700">Bio</label>
                        <button onClick={() => handleGenerateBio('new')} disabled={isGeneratingBio} className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full transition-all ${currentUser.plan === 'premium' ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}>
                            {currentUser.plan === 'premium' ? (<Sparkles size={12} className={isGeneratingBio ? "animate-spin" : ""} />) : (<Lock size={10} />)} {t.generateBio}
                        </button>
                    </div>
                    <textarea value={newPet.bio} onChange={e => setNewPet({...newPet, bio: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24 bg-white text-gray-900 resize-none" placeholder={t.bioPlaceholder}/>
                 </div>
                 <div className="pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                            <input type="checkbox" className="peer sr-only" checked={newPet.availableForDating} onChange={(e) => { if (e.target.checked && currentUser.plan !== 'premium') { setDatingAlert(true); return; } setDatingAlert(false); setNewPet({...newPet, availableForDating: e.target.checked}); }}/>
                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-600 transition-colors"></div>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{t.availableForDatingLabel}</span>
                    </label>
                    {datingAlert && (<div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-center animate-fade-in"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{t.datingPlanWarning}</div>)}
                 </div>
                 <Button onClick={handleCreatePet} className="w-full mt-4" disabled={!newPet.name}>{t.saveChanges}</Button>
              </div>
           </div>
        )}

        {/* USER PROFILE VIEW */}
        {activeView === 'user-profile' && (
             <div className="max-w-2xl mx-auto space-y-6">
                 {/* Profile Card */}
                 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                         <h2 className="text-2xl font-bold text-gray-800">{t.userProfile}</h2>
                         {!isEditingUser ? (
                             <Button variant="outline" size="sm" onClick={() => { setEditedUser(currentUser); setIsEditingUser(true); }}>
                                 <Pencil size={16} className="mr-2" /> {t.editProfile}
                             </Button>
                         ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsEditingUser(false)}>{t.cancel}</Button>
                                <Button onClick={saveUser}>{t.saveChanges}</Button>
                            </div>
                         )}
                     </div>

                     <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <img src={isEditingUser ? editedUser.image : currentUser.image} alt="User" className="w-32 h-32 rounded-full object-cover border-4 border-gray-100" />
                            {isEditingUser && (
                                 <label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-600 transition-transform hover:scale-110">
                                    <Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleUserPhotoUpload} />
                                 </label>
                            )}
                        </div>
                     </div>

                     <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.name}</label>
                            {isEditingUser ? (
                                <input type="text" value={editedUser.name} onChange={e => setEditedUser({...editedUser, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" />
                            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.name}</p>)}
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.email}</label>
                            {isEditingUser ? (
                                <input type="email" value={editedUser.email} onChange={e => setEditedUser({...editedUser, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" />
                            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.email}</p>)}
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t.phone}</label>
                             {isEditingUser ? (
                                <input type="tel" value={editedUser.phone} onChange={e => setEditedUser({...editedUser, phone: formatPhone(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" placeholder="(XX) XXXXX-XXXX" />
                            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.phone}</p>)}
                         </div>

                         {/* Location Section Redesign */}
                         <div>
                             <label className="block text-sm font-bold text-gray-500 mb-2">{t.locationLabel}</label>
                             <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-brand-200 transition-colors">
                                 {/* Background Pattern to simulate map */}
                                 <div className="absolute inset-0 opacity-[0.03]" 
                                     style={{ 
                                         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                                     }} 
                                 />
                                 
                                 <div className="relative p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                                     <div className="flex items-center gap-4 w-full sm:w-auto">
                                         <div className={`p-4 rounded-full shadow-lg border-4 border-white ${currentUser.location ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                             <MapPin size={24} />
                                         </div>
                                         <div>
                                             <h4 className="text-lg font-bold text-gray-900">
                                                 {locationAddress || (currentUser.location ? t.detecting : t.locationNotFound)}
                                             </h4>
                                             {currentUser.location ? (
                                                 <p className="text-xs font-mono text-gray-500 bg-white/50 px-2 py-1 rounded-md inline-block border border-gray-200 mt-1">
                                                     LAT: {currentUser.location.lat.toFixed(5)} • LNG: {currentUser.location.lng.toFixed(5)}
                                                 </p>
                                             ) : (
                                                 <p className="text-sm text-gray-500">{t.locationError}</p>
                                             )}
                                         </div>
                                     </div>
                                     
                                     {isEditingUser && (
                                        <Button 
                                            onClick={handleGetLocation} 
                                            disabled={isUpdatingLocation}
                                            variant="primary"
                                            className="shrink-0 shadow-md flex items-center gap-2"
                                        >
                                        {isUpdatingLocation ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                                        {t.getLocationBtn}
                                        </Button>
                                     )}
                                 </div>
                                 
                                 {/* Banner if not editing */}
                                 {!isEditingUser && currentUser.location && (
                                      <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                                         GPS Ativo
                                      </div>
                                 )}
                             </div>
                         </div>
                     </div>
                 </div>
                
                 {/* Plan Management Card */}
                 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div><h3 className="text-lg font-bold text-gray-800 mb-2">{t.currentPlan}</h3><span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getPlanColor(currentUser.plan || 'basic')}`}>{getPlanName(currentUser.plan || 'basic')}</span></div>
                        <Button variant="outline" size="sm" onClick={() => setShowPlanModal(true)}><CreditCard size={16} className="mr-2" /> {t.upgradePlan}</Button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">{t.planBenefits}: {getPlanDescription(currentUser.plan || 'basic')}</div>
                 </div>

                 {/* Pets Management Card */}
                 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                     <h3 className="font-bold text-gray-800 mb-4">{t.myPets} ({pets.length})</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {pets.map(p => (
                             <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:border-brand-200 hover:bg-white transition-all" onClick={() => { setActivePetId(p.id); setActiveView('profile'); }}>
                                 <img src={p.image} className="w-12 h-12 rounded-full object-cover" />
                                 <div className="overflow-hidden"><p className="font-bold text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-500 truncate">{p.breed}</p></div>
                             </div>
                         ))}
                         <button onClick={() => setActiveView('create-pet')} className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-all"><Plus size={20} /> {t.addNewPet}</button>
                     </div>
                 </div>

                 {/* Favorites Card */}
                 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                     <h3 className="font-bold text-gray-800 mb-4">{t.myFavorites}</h3>
                     {currentUser.favorites && currentUser.favorites.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {MOCK_ADOPTION_PETS.filter(pet => currentUser.favorites?.includes(pet.id)).map(pet => (
                                 <div key={pet.id} className="relative group flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                                     <img src={pet.image} className="w-16 h-16 rounded-lg object-cover" />
                                     <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 truncate">{pet.name}</h4>
                                            <button 
                                              onClick={() => toggleFavorite(pet.id)}
                                              className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Heart size={16} fill="currentColor" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-2">{pet.breed}</p>
                                        <div className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                                          {getDistanceText(pet.location)}
                                        </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                             <Heart className="mx-auto text-gray-300 mb-2" size={32} />
                             <p className="text-gray-500 text-sm">{t.noFavorites}</p>
                             <Button variant="ghost" size="sm" className="mt-2 text-brand-600" onClick={() => setActiveView('adoption')}>
                                 {t.landingAdoptionBtn}
                             </Button>
                         </div>
                     )}
                 </div>
             </div>
        )}

        {/* IF NO ACTIVE PET AND NOT CREATING/EDITING USER */}
        {!activePet && activeView !== 'create-pet' && activeView !== 'user-profile' && (
             <div className="text-center py-20">
                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🐾</span></div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.noPets}</h2>
                 <p className="text-gray-500 mb-8">{t.createFirstPet}</p>
                 <Button onClick={() => setActiveView('create-pet')}>{t.addNewPet}</Button>
             </div>
        )}

        {/* PET PROFILE VIEW */}
        {activePet && activeView === 'profile' && editedPet && (
          <div className="max-w-3xl mx-auto">
             <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 relative animate-fade-in">
                <div className="absolute top-6 right-6 flex gap-2">
                  {!isEditingPet ? (
                    <Button variant="outline" size="sm" onClick={() => { setEditedPet(activePet); setIsEditingPet(true); }} className="flex items-center gap-2"><Pencil size={16} /> {t.editProfile}</Button>
                  ) : (
                    <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setIsEditingPet(false); setEditedPet(activePet); }} className="text-gray-500 hover:bg-gray-100"><X size={20} /></Button><Button variant="primary" size="sm" onClick={savePetChanges} className="flex items-center gap-2"><Save size={16} /> {t.saveChanges}</Button></div>
                  )}
                </div>
                {/* ... (Pet Profile UI same as before) ... */}
                <div className="flex flex-col md:flex-row gap-8 items-start mt-4">
                  <div className="flex flex-col items-center space-y-4 relative">
                    <div className="relative">
                      <img src={isEditingPet ? editedPet.image : activePet.image} alt={activePet.name} className="w-40 h-40 rounded-full object-cover border-4 border-brand-100 shadow-sm bg-gray-100" />
                      {isEditingPet && (<label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-700 shadow-lg transition-transform hover:scale-110"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handlePetPhotoUpload} /></label>)}
                    </div>
                    {isEditingPet && (<p className="text-xs text-gray-500">{t.changePhoto}</p>)}
                  </div>
                  <div className="flex-1 w-full">
                    {!isEditingPet ? (
                      <>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{activePet.name}</h2>
                        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.breedLabel}: <span className="font-semibold text-gray-800">{activePet.breed}</span></span>
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.ageLabel}: <span className="font-semibold text-gray-800">{activePet.age}</span></span>
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.weight}: <span className="font-semibold text-gray-800">{activePet.weight}kg</span></span>
                        </div>
                        <div><h3 className="text-lg font-semibold text-gray-800 mb-2">Bio</h3><p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{activePet.bio}</p></div>
                        {activePet.availableForDating && (<div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm font-bold border border-pink-100"><Heart size={14} fill="currentColor" />{t.availableForDatingLabel}</div>)}
                      </>
                    ) : (
                      <div className="space-y-4 w-full animate-fade-in">
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.petName}</label><input type="text" value={editedPet.name} onChange={(e) => setEditedPet({...editedPet, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.breedLabel}</label><input type="text" value={editedPet.breed} onChange={(e) => setEditedPet({...editedPet, breed: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.ageLabel}</label><input type="number" value={editedPet.age} onChange={(e) => setEditedPet({...editedPet, age: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.weight}</label><input type="number" value={editedPet.weight} onChange={(e) => setEditedPet({...editedPet, weight: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">{t.petType}</label>
                            <select value={editedPet.type} onChange={e => setEditedPet({...editedPet, type: e.target.value as Pet['type']})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900">
                                <option value="dog">{t.typeDog}</option><option value="cat">{t.typeCat}</option><option value="bird">{t.typeBird}</option><option value="other">{t.typeOther}</option>
                            </select>
                        </div>
                         <div className="pt-2">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" checked={editedPet.availableForDating || false} onChange={(e) => { if (e.target.checked && currentUser.plan !== 'premium') { setDatingAlert(true); return; } setDatingAlert(false); setEditedPet({...editedPet, availableForDating: e.target.checked}); }}/>
                                    <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-600 transition-colors"></div>
                                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{t.availableForDatingLabel}</span>
                            </label>
                             {datingAlert && (<div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-center animate-fade-in"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{t.datingPlanWarning}</div>)}
                         </div>
                        <div>
                          <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-bold text-gray-700">Bio</label>
                                <button onClick={() => handleGenerateBio('edit')} disabled={isGeneratingBio} className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full transition-all ${currentUser.plan === 'premium' ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}>
                                    {currentUser.plan === 'premium' ? (<Sparkles size={12} className={isGeneratingBio ? "animate-spin" : ""} />) : (<Lock size={10} />)} {t.generateBio}
                                </button>
                          </div>
                          <textarea value={editedPet.bio} onChange={(e) => setEditedPet({...editedPet, bio: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-32 bg-white text-gray-900" />
                        </div>
                        <div className="pt-8 mt-8 border-t border-gray-100">
                          <h3 className="text-sm font-bold text-red-600 mb-2">{t.deletePetWarning}</h3>
                          <button onClick={handleDeletePet} className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm"><Trash2 size={16} />{t.deletePet}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Adoption View */}
        {activeView === 'adoption' && activePet && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t.dashAdoption}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_ADOPTION_PETS.map(pet => (
                <div key={pet.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                  <div className="overflow-hidden h-48 relative">
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover bg-gray-100 transition-transform duration-500 group-hover:scale-105" />
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(pet.id); }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
                    >
                        <Heart 
                          size={20} 
                          className={`transition-colors ${currentUser.favorites?.includes(pet.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                    </button>

                    {getDistanceText(pet.location) && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Navigation size={10} />
                            {getDistanceText(pet.location)}
                        </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{pet.breed}</p>
                    <p className="text-sm mt-2 text-gray-600 line-clamp-2">{pet.bio}</p>
                    <Button className="w-full mt-4">{t.adoptMe}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dating View */}
        {activeView === 'dating' && activePet && (
          checkPlanAccess('dating') ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{t.dashDating}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_DATING_PETS.map(pet => (
                  <div key={pet.id} className="relative bg-white rounded-2xl overflow-hidden shadow-lg aspect-[3/4] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group">
                    <img src={pet.image} alt={pet.name} className="absolute inset-0 w-full h-full object-cover bg-gray-100 transition-transform duration-700 group-hover:scale-105" />
                    
                    {getDistanceText(pet.location) && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                            <MapPin size={12} />
                            {getDistanceText(pet.location)}
                        </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 text-white">
                      <h3 className="text-3xl font-bold">{pet.name}, {pet.age}</h3>
                      <p className="text-lg opacity-90">{pet.breed}</p>
                      <div className="flex gap-4 mt-4">
                        <button className="flex-1 bg-white/20 backdrop-blur-md py-3 rounded-full text-white font-bold hover:bg-white/30 transition">❌</button>
                        <button className="flex-1 bg-brand-500 py-3 rounded-full text-white font-bold hover:bg-brand-600 transition shadow-lg flex justify-center items-center gap-2">
                          <Heart fill="white" size={20} /> {t.match}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <LockedFeature feature={t.dashDating} />
          )
        )}

        {/* Health View */}
        {activeView === 'health' && activePet && (
          checkPlanAccess('health') ? (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Syringe className="text-brand-600" /> {t.vaccines} - <span className="text-brand-500">{activePet.name}</span>
              </h2>
              {/* ... (Health table UI same as before) ... */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr><th className="px-6 py-3">{t.healthVaccine}</th><th className="px-6 py-3">{t.healthDate}</th><th className="px-6 py-3">{t.healthNextDue}</th><th className="px-6 py-3">{t.healthStatus}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activePet.vaccines && activePet.vaccines.length > 0 ? (
                      activePet.vaccines.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                        <td className="px-6 py-4 text-gray-500">{v.date}</td>
                        <td className="px-6 py-4 text-brand-600 font-medium">{v.nextDueDate}</td>
                        <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span></td>
                      </tr>
                    ))) : (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t.healthNoRecords}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">{t.healthTip}</div>
            </div>
          ) : (
            <LockedFeature feature={t.dashHealth} />
          )
        )}

        {/* Services View */}
        {activeView === 'services' && activePet && (
          checkPlanAccess('services') ? (
             <ServiceBooking providers={MOCK_SERVICES} lang={lang} userLocation={currentUser.location} />
          ) : (
             <LockedFeature feature={t.dashServices} />
          )
        )}

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-10 pb-safe">
          <button onClick={() => setActiveView('profile')} disabled={!activePet} className={`p-2 rounded-lg transition-colors flex flex-col items-center ${activeView === 'profile' ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-50'}`}><Home size={24} /></button>
          <button onClick={() => setActiveView('adoption')} disabled={!activePet} className={`p-2 rounded-lg transition-colors flex flex-col items-center ${activeView === 'adoption' ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-50'}`}><PawPrint size={24} /></button>
          <button onClick={() => setActiveView('health')} disabled={!activePet} className={`p-2 rounded-lg transition-colors flex flex-col items-center ${activeView === 'health' ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-50'}`}><div className="relative"><Stethoscope size={24} />{!checkPlanAccess('health') && <div className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-[2px]"><Lock size={10} className="text-gray-500" /></div>}</div></button>
          <button onClick={() => setActiveView('services')} disabled={!activePet} className={`p-2 rounded-lg transition-colors flex flex-col items-center ${activeView === 'services' ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-50'}`}><div className="relative"><Calendar size={24} />{!checkPlanAccess('services') && <div className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-[2px]"><Lock size={10} className="text-gray-500" /></div>}</div></button>
           <button onClick={() => setActiveView('user-profile')} className={`p-2 rounded-lg transition-colors flex flex-col items-center ${activeView === 'user-profile' ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-50'}`}><UserIcon size={24} /></button>
        </div>

      </main>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             {/* ... (Plan Modal UI same as before) ... */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-fade-in max-h-[90vh] overflow-y-auto">
                <button onClick={() => setShowPlanModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={24} /></button>
                <div className="p-8">
                    <div className="text-center mb-8"><h2 className="text-2xl font-bold text-gray-900">{t.managePlan}</h2><p className="text-gray-500 mt-1">{t.upgradePlan}</p></div>
                    <div className="grid md:grid-cols-3 gap-4">
                         <div className={`bg-white rounded-xl p-6 border-2 cursor-pointer hover:shadow-md transition-all flex flex-col ${currentUser.plan === 'basic' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-brand-200'}`}>
                            <h3 className="text-lg font-bold text-gray-900">{t.planBasic}</h3>
                            <div className="mt-2 text-2xl font-bold text-gray-900">{t.priceFree}</div>
                            <div className="mt-4 flex-1 space-y-2">
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-green-500 mr-2" /> {t.featProfile}</div>
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-green-500 mr-2" /> {t.featAdoption}</div>
                            </div>
                            <Button variant={currentUser.plan === 'basic' ? 'outline' : 'primary'} className="w-full mt-6" onClick={() => handleUpdatePlan('basic')} disabled={currentUser.plan === 'basic'}>{currentUser.plan === 'basic' ? 'Atual' : 'Selecionar'}</Button>
                        </div>
                         <div className={`bg-white rounded-xl p-6 border-2 cursor-pointer hover:shadow-md transition-all flex flex-col ${currentUser.plan === 'start' ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-100 hover:border-brand-200'}`}>
                            <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-gray-900">{t.planStart}</h3><span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-1 rounded-full">POPULAR</span></div>
                            <div className="mt-2 text-2xl font-bold text-gray-900">{t.priceStart}</div>
                            <div className="mt-4 flex-1 space-y-2">
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-brand-500 mr-2" /> {t.featBasic}</div>
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-brand-500 mr-2" /> {t.featVaccines}</div>
                                 <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-brand-500 mr-2" /> {t.featScheduling}</div>
                            </div>
                            <Button variant={currentUser.plan === 'start' ? 'outline' : 'primary'} className="w-full mt-6" onClick={() => handleUpdatePlan('start')} disabled={currentUser.plan === 'start'}>{currentUser.plan === 'start' ? 'Atual' : 'Selecionar'}</Button>
                        </div>
                         <div className={`bg-white rounded-xl p-6 border-2 cursor-pointer hover:shadow-md transition-all flex flex-col ${currentUser.plan === 'premium' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-100 hover:border-purple-200'}`}>
                            <h3 className="text-lg font-bold text-gray-900">{t.planPremium}</h3>
                            <div className="mt-2 text-2xl font-bold text-gray-900">{t.pricePremium}</div>
                            <div className="mt-4 flex-1 space-y-2">
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-purple-500 mr-2" /> {t.featStart}</div>
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-purple-500 mr-2" /> {t.featDating}</div>
                                <div className="flex items-center text-sm text-gray-500"><Check size={14} className="text-purple-500 mr-2" /> {t.featAIBio}</div>
                            </div>
                            <Button variant={currentUser.plan === 'premium' ? 'outline' : 'primary'} className={`w-full mt-6 ${currentUser.plan !== 'premium' ? '!bg-purple-600 hover:!bg-purple-700' : '!text-purple-600 !border-purple-600 hover:!bg-purple-50'}`} onClick={() => handleUpdatePlan('premium')} disabled={currentUser.plan === 'premium'}>{currentUser.plan === 'premium' ? 'Atual' : 'Selecionar'}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
