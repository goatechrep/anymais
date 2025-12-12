
import React, { useState, useEffect } from 'react';
import { ServiceProvider, Language, Coordinates, Pet, Appointment } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Star, MapPin, Calendar, Clock, ShieldCheck, Dog, Search, Loader2, Filter, X, CheckCircle, Car } from 'lucide-react';
import { calculateDistance, mockGeocode } from '../utils';
import { db } from '../services/db';

interface ServiceBookingProps {
  providers: ServiceProvider[];
  lang: Language;
  userLocation?: Coordinates;
  pets?: Pet[];
  userId?: string;
  defaultTab?: 'search' | 'appointments';
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({ providers, lang, userLocation, pets = [], userId, defaultTab = 'search' }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'search' | 'appointments'>(defaultTab);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [referenceLocation, setReferenceLocation] = useState<Coordinates | undefined>(userLocation);
  const [selectedType, setSelectedType] = useState<ServiceProvider['type'] | 'all'>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Booking Modal State
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [transportType, setTransportType] = useState<'owner' | 'pickup'>('owner');

  // Load appointments
  useEffect(() => {
      if (userId) {
          const apps = db.appointments.listByUser(userId);
          setMyAppointments(apps);
      }
  }, [userId, activeTab, bookingSuccess]); // Reload when tab changes or after booking

  // Sync reference location
  useEffect(() => {
    if (!referenceLocation && userLocation) {
        setReferenceLocation(userLocation);
    }
  }, [userLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
        const coords = await mockGeocode(searchQuery);
        if (coords) {
            setReferenceLocation(coords);
        } else {
            alert(t.locationNotFound);
        }
    } catch (error) {
        console.error("Geocoding error", error);
    } finally {
        setIsSearching(false);
    }
  };

  const openBookingModal = (provider: ServiceProvider) => {
      setSelectedProvider(provider);
      // Reset form
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
      setBookingTime('09:00');
      if (pets.length > 0) setSelectedPetId(pets[0].id);
      setTransportType('owner');
      setBookingSuccess(false);
      setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
      if (!selectedProvider || !userId || !selectedPetId) return;

      const newAppointment: Omit<Appointment, 'id'> = {
          userId,
          petId: selectedPetId,
          providerId: selectedProvider.id,
          providerName: selectedProvider.name,
          providerType: selectedProvider.type,
          date: bookingDate,
          time: bookingTime,
          transport: transportType,
          status: 'confirmed'
      };

      db.appointments.create(newAppointment);
      setBookingSuccess(true);
      
      // Close modal after delay and switch to appointments tab
      setTimeout(() => {
          setIsBookingModalOpen(false);
          setActiveTab('appointments');
      }, 2000);
  };

  const getServiceLabel = (type: ServiceProvider['type']) => {
    switch(type) {
      case 'veterinarian': return t.serviceVet;
      case 'petshop': return t.serviceGroom;
      case 'hotel': return t.serviceHotel;
      case 'dogwalker': return t.serviceWalker;
      default: return type;
    }
  };

  const getServiceColor = (type: ServiceProvider['type']) => {
    switch(type) {
      case 'veterinarian': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'petshop': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'hotel': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'dogwalker': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getDistanceDisplay = (provider: ServiceProvider) => {
    if (referenceLocation && provider.location) {
      const dist = calculateDistance(referenceLocation.lat, referenceLocation.lng, provider.location.lat, provider.location.lng);
      return `${dist} km`;
    }
    return '2.5 km';
  };

  const getStatusLabel = (status: Appointment['status']) => {
      switch(status) {
          case 'pending': return t.statusPending;
          case 'confirmed': return t.statusConfirmed;
          case 'completed': return t.statusCompleted;
          default: return status;
      }
  };

  // Filter and Sort Providers
  const filteredProviders = providers.filter(provider => {
      const matchesType = selectedType === 'all' || provider.type === selectedType;
      const matchesRating = provider.rating >= minRating;
      return matchesType && matchesRating;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
      if (!referenceLocation || !a.location || !b.location) return 0;
      const distA = calculateDistance(referenceLocation.lat, referenceLocation.lng, a.location.lat, a.location.lng);
      const distB = calculateDistance(referenceLocation.lat, referenceLocation.lng, b.location.lat, b.location.lng);
      return distA - distB;
  });

  const resetFilters = () => {
      setSelectedType('all');
      setMinRating(0);
  };

  const hasActiveFilters = selectedType !== 'all' || minRating > 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t.dashServices}</h2>
          <p className="text-gray-500 mt-1">{t.servicesCtaSubtitle}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                {t.tabFindServices}
            </button>
            <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                {t.tabMyAppointments}
            </button>
        </div>
      </div>

      {activeTab === 'search' ? (
          <>
            <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchLocationPlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-sm text-sm"
                        />
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Button type="submit" disabled={isSearching} className="flex-shrink-0">
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        <span className="hidden md:inline ml-2">{t.searchBtn}</span>
                    </Button>
                </form>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold flex-shrink-0">
                    <Filter size={16} />
                    <span className="hidden sm:inline">{t.filterType}:</span>
                </div>
                
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                    <button 
                        onClick={() => setSelectedType('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedType === 'all' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                    >
                        {t.filterAll}
                    </button>
                    {(['veterinarian', 'petshop', 'hotel', 'dogwalker'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedType === type ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            {getServiceLabel(type)}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-gray-300 hidden sm:block mx-2"></div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-500 text-sm font-bold whitespace-nowrap">{t.minRating}:</span>
                    <select 
                        value={minRating} 
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-1.5 outline-none"
                    >
                        <option value="0">{t.filterAll}</option>
                        <option value="3">3+ ⭐</option>
                        <option value="4">4+ ⭐</option>
                        <option value="4.5">4.5+ ⭐</option>
                        <option value="5">5 ⭐</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button onClick={resetFilters} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <X size={14} />
                        {t.clearFilters}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProviders.length > 0 ? (
                    sortedProviders.map((provider) => (
                    <div 
                        key={provider.id} 
                        className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Image Container */}
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                        {provider.image ? (
                            <img 
                            src={provider.image} 
                            alt={provider.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                            <Dog size={64} className="text-gray-300" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getServiceColor(provider.type)}`}>
                            {getServiceLabel(provider.type)}
                            </span>
                        </div>

                        <div className="absolute bottom-4 left-4 text-white">
                            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-semibold w-fit border border-white/20">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span>{provider.rating}</span>
                            </div>
                        </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">
                            {provider.name}
                            </h3>
                            <ShieldCheck className="text-blue-500 shrink-0 ml-2" size={20} />
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-3 mb-6">
                            <div className="flex items-center text-gray-500 text-sm">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{getDistanceDisplay(provider)} • {provider.address || 'Vila Madalena'}</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span className="text-green-600 font-medium">{t.openNow}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full py-3 shadow-lg shadow-brand-100 flex items-center justify-center gap-2 font-semibold text-lg"
                            onClick={() => openBookingModal(provider)}
                        >
                            <Calendar size={18} />
                            {t.bookNow}
                        </Button>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">{t.noServicesFound}</h3>
                        <p className="text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                        <Button variant="ghost" className="mt-4" onClick={resetFilters}>
                        {t.clearFilters}
                        </Button>
                    </div>
                )}
            </div>
          </>
      ) : (
          /* My Appointments Tab */
          <div className="max-w-3xl mx-auto space-y-6">
              {myAppointments.length > 0 ? (
                  myAppointments.map(appointment => {
                      const pet = pets.find(p => p.id === appointment.petId);
                      return (
                          <div key={appointment.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col items-center justify-center bg-brand-50 rounded-xl p-4 w-full md:w-32">
                                    <span className="text-3xl font-bold text-brand-600">{appointment.date.split('-')[2]}</span>
                                    <span className="text-sm font-bold text-brand-400 uppercase">{new Date(appointment.date).toLocaleString(lang, { month: 'short' })}</span>
                                    <span className="text-xs text-brand-300 font-medium mt-1">{appointment.time}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{appointment.providerName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {getStatusLabel(appointment.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500">
                                         <span className={`px-2 py-0.5 rounded border ${getServiceColor(appointment.providerType)} bg-opacity-10 text-[10px] uppercase`}>
                                            {getServiceLabel(appointment.providerType)}
                                         </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {pet ? <img src={pet.image} className="w-6 h-6 rounded-full object-cover" /> : <Dog size={16} />}
                                            <span className="font-medium">{pet ? pet.name : 'Pet'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Car size={16} className="text-gray-400" />
                                            <span>{appointment.transport === 'owner' ? t.transportOwner : t.transportPickup}</span>
                                        </div>
                                    </div>
                                </div>
                          </div>
                      );
                  })
              ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700">{t.noAppointments}</h3>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab('search')}>
                            {t.bookNow}
                        </Button>
                  </div>
              )}
          </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative">
                  <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={24} /></button>
                  
                  {!bookingSuccess ? (
                      <div className="p-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.bookServiceTitle}</h2>
                          <p className="text-gray-500 mb-6 flex items-center gap-1 text-sm">
                             {t.appointmentWith} <span className="font-bold text-brand-600">{selectedProvider.name}</span>
                          </p>

                          <div className="space-y-4">
                               <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-1">{t.selectPet}</label>
                                   <select 
                                     value={selectedPetId} 
                                     onChange={(e) => setSelectedPetId(e.target.value)}
                                     className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                   >
                                       {pets.map(p => (
                                           <option key={p.id} value={p.id}>{p.name}</option>
                                       ))}
                                   </select>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.selectDate}</label>
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.selectTime}</label>
                                        <select 
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                        >
                                            <option value="09:00">09:00</option>
                                            <option value="10:00">10:00</option>
                                            <option value="11:00">11:00</option>
                                            <option value="14:00">14:00</option>
                                            <option value="15:00">15:00</option>
                                            <option value="16:00">16:00</option>
                                        </select>
                                    </div>
                               </div>

                               <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-1">{t.transportLabel}</label>
                                   <div className="flex gap-2">
                                       <button 
                                          type="button"
                                          className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${transportType === 'owner' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                          onClick={() => setTransportType('owner')}
                                       >
                                           {t.transportOwner}
                                       </button>
                                       <button 
                                          type="button"
                                          className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${transportType === 'pickup' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                          onClick={() => setTransportType('pickup')}
                                       >
                                           {t.transportPickup}
                                       </button>
                                   </div>
                               </div>
                          </div>

                          <div className="mt-8">
                              <Button className="w-full py-3 text-lg" onClick={handleConfirmBooking}>
                                  {t.confirmBooking}
                              </Button>
                          </div>
                      </div>
                  ) : (
                      <div className="p-8 text-center py-12">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle size={40} className="text-green-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.bookingSuccess}</h2>
                          <p className="text-gray-500">
                             {t.at} {bookingTime}, {new Date(bookingDate).toLocaleDateString()}
                          </p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
