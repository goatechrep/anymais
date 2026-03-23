import React, { Suspense, lazy, useState, useEffect } from 'react';
import { DashboardView, Language, Pet, User, PlanType, Ong, AdoptionInterest } from '../types';
import { TRANSLATIONS } from '../constants';
import { Heart, Home, Stethoscope, Calendar, User as UserIcon, LogOut, Syringe, Pencil, Save, X, Camera, Plus, ChevronDown, Settings, Trash2, CreditCard, Check, AlertCircle, Menu, Lock, PawPrint, Sparkles, MapPin, Navigation, Loader2, CheckCircle, Crosshair, Search, Building2, LayoutDashboard, Clock, Activity, ArrowRight, AlertTriangle, FileText, QrCode } from 'lucide-react';
import { Button } from './Button';
import { DashboardNavItem } from './dashboard/DashboardNavItem';
import { LockedFeature } from './dashboard/LockedFeature';
import { db } from '../services/db';
import { generatePetBio } from '../services/geminiService';
import { calculateDistance, formatPhone } from '../utils';
import { authService } from '../services/auth/authService';
import { adoptionService } from '../services/adoption/adoptionService';
import { ongService } from '../services/ongs/ongService';
import { providerService } from '../services/providers/providerService';
import { appointmentService } from '../services/appointments/appointmentService';
import { locationService } from '../services/location/locationService';
import { feedbackService } from '../services/browser/feedbackService';

const ServiceBooking = lazy(() => import('./ServiceBooking').then((module) => ({ default: module.ServiceBooking })));
const AdoptionView = lazy(() => import('./dashboard/views/AdoptionView').then((module) => ({ default: module.AdoptionView })));
const DatingView = lazy(() => import('./dashboard/views/DatingView').then((module) => ({ default: module.DatingView })));
const OverviewView = lazy(() => import('./dashboard/views/OverviewView').then((module) => ({ default: module.OverviewView })));
const HealthView = lazy(() => import('./dashboard/views/HealthView').then((module) => ({ default: module.HealthView })));
const UserProfileView = lazy(() => import('./dashboard/views/UserProfileView').then((module) => ({ default: module.UserProfileView })));
const PetProfileView = lazy(() => import('./dashboard/views/PetProfileView').then((module) => ({ default: module.PetProfileView })));

interface DashboardProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogout: () => void;
  onViewPet: (pet: Pet) => void;
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

export const Dashboard: React.FC<DashboardProps> = ({ lang, setLang, onLogout, onViewPet }) => {
  const t = TRANSLATIONS[lang];
  const adoptionPets = adoptionService.listPublicPets();
  const datingPets = adoptionService.listDatingPets();
  const serviceProviders = providerService.listAll();
  
  // --- State: User ---
  // Initialize with a placeholder, then load from DB
  const [currentUser, setCurrentUser] = useState<User>({
    id: '', name: '', email: '', phone: '', image: '', plan: 'basic', favorites: []
  });
  
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(currentUser);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [locationAddress, setLocationAddress] = useState<string>('');

  // --- State: Pets & Interests ---
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [myOngs, setMyOngs] = useState<Ong[]>([]);
  const [adoptionInterests, setAdoptionInterests] = useState<AdoptionInterest[]>([]);
  const [adoptionTab, setAdoptionTab] = useState<'find' | 'interests'>('find');
  
  // UI State
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editedPet, setEditedPet] = useState<Pet | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [datingAlert, setDatingAlert] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '', nextDueDate: '' });

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
    const session = authService.getSession();
    if (session) {
      setCurrentUser(session);
      setEditedUser(session);
      
      // Load pets for this user
      const userPets = db.pets.listByOwner(session.id);
      setPets(userPets);
      if (userPets.length > 0) {
        setActivePetId(userPets[0].id);
      }
      
      // Load ONGs for this user
      const userOngs = ongService.listByOwner(session.id);
      setMyOngs(userOngs);

      // Load Adoption Interests
      const interests = adoptionService.listInterestsByUser(session.id);
      setAdoptionInterests(interests);
    } else {
      onLogout(); 
    }
  }, []);

  // Effect: Resolve User Address from Coords (Fix for Owner Location Error)
  useEffect(() => {
    // Determine which user object to use for display
    const targetUser = isEditingUser ? editedUser : currentUser;

    if (targetUser.location) {
        const fetchAddress = async () => {
            try {
                // If we have lat/lng but no text address, fetch it
                const addr = await locationService.reverseGeocode(targetUser.location!.lat, targetUser.location!.lng);
                setLocationAddress(addr);
            } catch (e) {
                // Fallback or empty if error
                setLocationAddress('');
            }
        };
        fetchAddress();
    } else {
        setLocationAddress('');
    }
  }, [currentUser.location, editedUser.location, isEditingUser]); 

  // Reset verification status when entering edit mode or changing location
  useEffect(() => {
      setVerificationStatus('idle');
  }, [isEditingUser, currentUser.location]);

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
      if (view === 'profile' || view === 'overview' || view === 'adoption' || view === 'user-profile' || view === 'create-pet' || view === 'lost-found' || view === 'my-ongs') return true;
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
           authService.updateUser(updated);
           feedbackService.alert(t.locationUpdated);
        }
        setIsUpdatingLocation(false);
      }, (error) => {
        console.error("Error getting location:", error.message);
        // Fallback for demo
        const coords = { lat: -23.5505, lng: -46.6333 }; // Default SP
        const updated = { ...editedUser, location: coords };
        setEditedUser(updated);
        if (!isEditingUser) {
           setCurrentUser(updated);
           authService.updateUser(updated);
        }
        feedbackService.alert(t.locationError + " (Usando localização padrão para demonstração)");
        setIsUpdatingLocation(false);
      });
    } else {
      feedbackService.alert("Geolocation not supported");
    }
  };

  const handleVerifyLocation = () => {
      if (!currentUser.location) {
          feedbackService.alert(t.locationNotFound);
          return;
      }
      
      if ("geolocation" in navigator) {
          setIsVerifyingLocation(true);
          setVerificationStatus('idle');
          
          navigator.geolocation.getCurrentPosition((position) => {
              const currentLat = position.coords.latitude;
              const currentLng = position.coords.longitude;
              
              const distance = calculateDistance(
                  currentLat, 
                  currentLng, 
                  currentUser.location!.lat, 
                  currentUser.location!.lng
              );
              
              // Threshold of 1km
              if (distance < 1.0) {
                  setVerificationStatus('match');
              } else {
                  setVerificationStatus('mismatch');
              }
              setIsVerifyingLocation(false);
          }, (error) => {
              console.error("Error verifying location", error);
              feedbackService.alert(t.locationError);
              setIsVerifyingLocation(false);
          });
      }
  };

  const saveUser = () => {
    authService.updateUser(editedUser); // Save to DB
    setCurrentUser(editedUser);
    setIsEditingUser(false);
  };

  const handleUpdatePlan = (newPlan: PlanType) => {
    const updatedUser = { ...currentUser, plan: newPlan };
    authService.updateUser(updatedUser);
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
    authService.updateUser(updatedUser);
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmPetDeletion = () => {
    if (activePetId) {
      db.pets.delete(activePetId); // Remove from DB
    }
    const remainingPets = pets.filter(p => p.id !== activePetId);
    setPets(remainingPets);
    setIsEditingPet(false);
    setEditedPet(null);
    setShowDeleteModal(false);
    
    if (remainingPets.length > 0) {
      setActivePetId(remainingPets[0].id);
    } else {
      setActivePetId(null);
      setActiveView('overview');
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
        // Pass the selected language to the service
        const bio = await generatePetBio(data.name || 'Pet', data.breed || 'Unknown', traits, lang);
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

  const handleAddVaccine = () => {
      if (activePetId && newVaccine.name && newVaccine.date) {
          db.pets.addVaccine(activePetId, newVaccine);
          // Refresh pets
          const userPets = db.pets.listByOwner(currentUser.id);
          setPets(userPets);
          setShowAddVaccineModal(false);
          setNewVaccine({ name: '', date: '', nextDueDate: '' });
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

  // --- Overview Calculations ---
  const getStats = () => {
      const totalPets = pets.length;
      let pendingVaccines = 0;
      let activeMatches = 0;
      const today = new Date();
      
      const upcomingVaccineList: Array<{petName: string, vaccineName: string, date: string, daysLeft: number, petId: string}> = [];

      pets.forEach(pet => {
          if (pet.vaccines) {
              pet.vaccines.forEach(v => {
                  const dueDate = new Date(v.nextDueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  // If due within 30 days or overdue
                  if (diffDays <= 30) {
                      pendingVaccines++;
                      if (diffDays >= -30) { // Don't show extremely old ones in "upcoming"
                          upcomingVaccineList.push({
                              petName: pet.name,
                              vaccineName: v.name,
                              date: v.nextDueDate,
                              daysLeft: diffDays,
                              petId: pet.id
                          });
                      }
                  }
              });
          }
          if (pet.availableForDating) activeMatches++; // Mock calculation
      });

      // Get real appointments count
      const userAppointments = currentUser.id ? appointmentService.listByUser(currentUser.id) : [];
      const upcomingAppointments = userAppointments.filter(a => new Date(a.date) >= today);

      // Sort upcoming vaccines by date
      upcomingVaccineList.sort((a, b) => a.daysLeft - b.daysLeft);

      return { totalPets, pendingVaccines, activeMatches, upcomingAppointments, upcomingVaccineList };
  };

  const overviewStats = getStats();
  const renderNavItem = (
    view: DashboardView,
    icon: React.ComponentType<{ size?: number; className?: string }>,
    label: string,
    locked?: boolean,
    description?: string,
    planReq?: string
  ) => {
    const isAlwaysAvailable = view === 'overview' || view === 'user-profile' || view === 'create-pet' || view === 'lost-found' || view === 'my-ongs' || view === 'adoption';
    const isDisabled = !activePet && !isAlwaysAvailable;

    return (
      <DashboardNavItem
        view={view}
        icon={icon}
        label={label}
        activeView={activeView}
        onSelect={(nextView) => {
          setActiveView(nextView);
          setMobileMenuOpen(false);
        }}
        locked={locked}
        disabled={isDisabled}
        description={description}
        planReq={planReq}
      />
    );
  };

  const renderViewLoader = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
      <div className="flex items-center gap-3 text-brand-600 font-bold">
        <Loader2 size={18} className="animate-spin" />
        <span>Carregando...</span>
      </div>
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
            {renderNavItem('overview', LayoutDashboard, t.dashOverview)}
            {renderNavItem('profile', Home, t.dashProfile, false, t.tooltipProfile, t.reqPlanBasic)}
            {renderNavItem('dating', Heart, t.dashDating, !checkPlanAccess('dating'), t.tooltipDating, t.reqPlanPremium)}
            {renderNavItem('health', Stethoscope, t.dashHealth, !checkPlanAccess('health'), t.tooltipHealth, t.reqPlanStart)}
            {renderNavItem('services', Calendar, t.dashServices, !checkPlanAccess('services'), t.tooltipServices, t.reqPlanStart)}
            
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-6">Comunidade</p>
            {renderNavItem('adoption', PawPrint, t.dashAdoption, false, undefined, t.reqPlanBasic)}
            {renderNavItem('lost-found', Search, t.dashLostFound, false, undefined, t.reqPlanBasic)}
            {renderNavItem('my-ongs', Building2, t.dashMyOngs, false, undefined, t.reqPlanBasic)}
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
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
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
        
        {/* OVERVIEW DASHBOARD */}
        {activeView === 'overview' && (
          <Suspense fallback={renderViewLoader()}>
            <OverviewView
              lang={lang}
              currentUser={currentUser}
              pets={pets}
              activePetId={activePetId}
              overviewStats={overviewStats}
              favoritePets={adoptionService.listFavoritePets(currentUser.favorites || [])}
              onSetView={setActiveView}
              onSelectPet={setActivePetId}
              onToggleFavorite={toggleFavorite}
              getDistanceText={getDistanceText}
            />
          </Suspense>
        )}

        {/* ... (Create Pet, Lost & Found, My ONGs, User Profile Views - No Changes) ... */}
        {activeView === 'create-pet' && (
           <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.addNewPet}</h2>
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

        {activeView === 'lost-found' && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                   <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.lostFoundTitle}</h2>
                   <p className="text-gray-500">{t.lostFoundSubtitle}</p>
                </div>
                <div className="flex justify-center gap-4 mb-8">
                   <Button className="shadow-lg shadow-brand-100 flex gap-2"><Search size={18} /> {t.reportLost}</Button>
                   <Button variant="outline" className="flex gap-2"><CheckCircle size={18} /> {t.reportFound}</Button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Search size={32} className="text-gray-300" /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noLostPets}</h3>
                    <p className="text-gray-500">Se você perdeu ou encontrou um pet, reporte agora para ajudar a comunidade.</p>
                </div>
             </div>
        )}

        {activeView === 'my-ongs' && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-900">{t.myOngsTitle}</h2></div>
                {myOngs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myOngs.map(ong => (
                           <div key={ong.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
                               <img src={ong.image} alt={ong.name} className="w-16 h-16 rounded-xl object-cover" />
                               <div><h3 className="font-bold text-lg text-gray-900">{ong.name}</h3><p className="text-sm text-gray-500 mb-2">{ong.description}</p><div className="flex items-center text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-md w-fit"><MapPin size={12} className="mr-1" /> {ong.location}</div></div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Building2 size={32} className="text-gray-300" /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noMyOngs}</h3>
                        <p className="text-gray-500 mb-6">Cadastre sua organização para ajudar mais animais.</p>
                        <Button onClick={() => feedbackService.alert('Use o link na página inicial para cadastrar (fluxo simplificado).')} variant="outline">{t.ongBtn}</Button>
                    </div>
                )}
             </div>
        )}

        {activeView === 'user-profile' && (
          <Suspense fallback={renderViewLoader()}>
            <UserProfileView
              lang={lang}
              currentUser={currentUser}
              editedUser={editedUser}
              isEditingUser={isEditingUser}
              setEditedUser={setEditedUser}
              setIsEditingUser={setIsEditingUser}
              saveUser={saveUser}
              handleUserPhotoUpload={handleUserPhotoUpload}
              handleGetLocation={handleGetLocation}
              handleVerifyLocation={handleVerifyLocation}
              isUpdatingLocation={isUpdatingLocation}
              isVerifyingLocation={isVerifyingLocation}
              verificationStatus={verificationStatus}
              locationAddress={locationAddress}
              getPlanColor={getPlanColor}
              getPlanName={getPlanName}
              getPlanDescription={getPlanDescription}
              setShowPlanModal={setShowPlanModal}
              pets={pets}
              onSelectPet={setActivePetId}
              onSetView={(view) => setActiveView(view)}
              favoritePets={adoptionService.listFavoritePets(currentUser.favorites || [])}
              toggleFavorite={toggleFavorite}
              getDistanceText={getDistanceText}
            />
          </Suspense>
        )}

        {!activePet && activeView !== 'create-pet' && activeView !== 'user-profile' && activeView !== 'lost-found' && activeView !== 'my-ongs' && activeView !== 'adoption' && activeView !== 'overview' && (
             <div className="text-center py-20">
                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🐾</span></div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.noPets}</h2>
                 <p className="text-gray-500 mb-8">{t.createFirstPet}</p>
                 <Button onClick={() => setActiveView('create-pet')}>{t.addNewPet}</Button>
             </div>
        )}
        
        {activePet && activeView === 'profile' && editedPet && (
          <Suspense fallback={renderViewLoader()}>
            <PetProfileView
              lang={lang}
              activePet={activePet}
              editedPet={editedPet}
              currentUser={currentUser}
              isEditingPet={isEditingPet}
              isGeneratingBio={isGeneratingBio}
              datingAlert={datingAlert}
              setEditedPet={setEditedPet}
              setIsEditingPet={setIsEditingPet}
              setDatingAlert={setDatingAlert}
              savePetChanges={savePetChanges}
              handlePetPhotoUpload={handlePetPhotoUpload}
              handleGenerateBio={handleGenerateBio}
              handleDeleteClick={handleDeleteClick}
            />
          </Suspense>
        )}

        {/* Adoption View */}
        {activeView === 'adoption' && (
          <Suspense fallback={renderViewLoader()}>
            <AdoptionView
              lang={lang}
              adoptionTab={adoptionTab}
              setAdoptionTab={setAdoptionTab}
              adoptionPets={adoptionPets}
              currentUser={currentUser}
              adoptionInterests={adoptionInterests}
              toggleFavorite={toggleFavorite}
              onViewPet={onViewPet}
              getDistanceText={getDistanceText}
            />
          </Suspense>
        )}

        {/* Dating View */}
        {activeView === 'dating' && activePet && (
          checkPlanAccess('dating') ? (
            <Suspense fallback={renderViewLoader()}>
              <DatingView
                lang={lang}
                activePet={activePet}
                datingPets={datingPets}
                getDistanceText={getDistanceText}
              />
            </Suspense>
          ) : (
             <LockedFeature title={t.featureLocked} description={t.upgradeToAccess} ctaLabel={t.unlockNow} onUnlock={() => setShowPlanModal(true)} />
          )
        )}

        {/* Health View */}
        {activeView === 'health' && activePet && (
          checkPlanAccess('health') ? (
            <Suspense fallback={renderViewLoader()}>
              <HealthView
                lang={lang}
                activePet={activePet}
                onOpenAddVaccine={() => setShowAddVaccineModal(true)}
                onOpenQrModal={() => setShowQrModal(true)}
              />
            </Suspense>
          ) : (
            <LockedFeature title={t.featureLocked} description={t.upgradeToAccess} ctaLabel={t.unlockNow} onUnlock={() => setShowPlanModal(true)} />
          )
        )}

        {/* Services View */}
        {activeView === 'services' && activePet && (
          checkPlanAccess('services') ? (
             <Suspense fallback={renderViewLoader()}>
               <ServiceBooking 
                  providers={serviceProviders} 
                  lang={lang} 
                  userLocation={currentUser.location}
                  pets={pets}
                  userId={currentUser.id}
               />
             </Suspense>
          ) : (
             <LockedFeature title={t.featureLocked} description={t.upgradeToAccess} ctaLabel={t.unlockNow} onUnlock={() => setShowPlanModal(true)} />
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

      {/* Delete Pet Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={32} className="text-red-600" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">{t.deletePet}</h3>
             <p className="text-gray-500 mb-6">{t.confirmDeletePet}</p>
             <div className="flex gap-3">
               <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                 {t.cancel}
               </Button>
               <Button 
                className="flex-1 !bg-red-600 hover:!bg-red-700" 
                onClick={confirmPetDeletion}
               >
                 {t.confirm}
               </Button>
             </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                    <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode size={32} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.qrModalTitle}</h3>
                    <p className="text-gray-500 text-sm mb-6 px-4">{t.qrModalInstruction}</p>
                    
                    <div className="bg-white p-4 rounded-xl border-4 border-gray-900 inline-block shadow-xl mb-6">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AnyMais-User-${currentUser.id || 'guest'}`} 
                            alt="QR Code" 
                            className="w-48 h-48"
                        />
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-400 font-mono break-all">
                        ID: {currentUser.id || 'guest-session'}
                    </div>

                    <Button onClick={() => setShowQrModal(false)} className="w-full mt-6" variant="outline">{t.close}</Button>
               </div>
           </div>
      )}

      {/* Add Vaccine Modal */}
      {showAddVaccineModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                  <button onClick={() => setShowAddVaccineModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{t.addVaccineTitle}</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.vaccineName}</label>
                          <input 
                              type="text" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                              value={newVaccine.name}
                              onChange={e => setNewVaccine({...newVaccine, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.healthDate}</label>
                          <input 
                              type="date" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                              value={newVaccine.date}
                              onChange={e => setNewVaccine({...newVaccine, date: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.healthNextDue} (Opcional)</label>
                          <input 
                              type="date" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                              value={newVaccine.nextDueDate}
                              onChange={e => setNewVaccine({...newVaccine, nextDueDate: e.target.value})}
                          />
                      </div>
                      <Button onClick={handleAddVaccine} className="w-full mt-4">{t.addVaccine}</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
