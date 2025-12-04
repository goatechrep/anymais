import React, { useState, useEffect } from 'react';
import { ServiceProvider, Language, Coordinates } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Star, MapPin, Calendar, Clock, ShieldCheck, Dog, Search, Loader2, Filter, X } from 'lucide-react';
import { calculateDistance, mockGeocode } from '../utils';

interface ServiceBookingProps {
  providers: ServiceProvider[];
  lang: Language;
  userLocation?: Coordinates;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({ providers, lang, userLocation }) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [referenceLocation, setReferenceLocation] = useState<Coordinates | undefined>(userLocation);
  
  // Filter States
  const [selectedType, setSelectedType] = useState<ServiceProvider['type'] | 'all'>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  // Keep reference location in sync with user location initially, 
  // but allow override if user searches
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
    return null;
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

  const handleBook = (provider: ServiceProvider) => {
      setSelectedProvider(provider);
      setBookingModalOpen(true);
  };

  const confirmBooking = () => {
      if (!bookingDate || !bookingTime) {
          alert('Por favor, selecione data e hora.');
          return;
      }
      // In a real app, this would send data to backend
      setBookingModalOpen(false);
      setBookingDate('');
      setBookingTime('');
      alert(t.bookingSuccess);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t.dashServices}</h2>
          <p className="text-gray-500 mt-1">Encontre os melhores profissionais para seu pet</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchLocationPlaceholder}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-sm text-sm"
                />
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Button type="submit" size="sm" disabled={isSearching} className="flex-shrink-0">
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
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
                    <span>{getDistanceDisplay(provider) ? `${getDistanceDisplay(provider)} • ` : ''}{provider.address || 'Vila Madalena'}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="text-green-600 font-medium">Aberto agora</span>
                    </div>
                </div>

                <Button 
                    className="w-full py-3 shadow-lg shadow-brand-100 flex items-center justify-center gap-2 font-semibold text-lg"
                    onClick={() => handleBook(provider)}
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
                <h3 className="text-lg font-bold text-gray-700">Nenhum serviço encontrado</h3>
                <p className="text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                <Button variant="ghost" className="mt-4" onClick={resetFilters}>
                   {t.clearFilters}
                </Button>
            </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && selectedProvider && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-gray-900">{t.scheduleTitle}</h3>
                     <button onClick={() => setBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                         <X size={24} />
                     </button>
                 </div>
                 
                 <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                     <img src={selectedProvider.image} alt={selectedProvider.name} className="w-16 h-16 rounded-lg object-cover" />
                     <div>
                         <h4 className="font-bold text-gray-900">{selectedProvider.name}</h4>
                         <span className="text-sm text-gray-500">{getServiceLabel(selectedProvider.type)}</span>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">{t.selectDate}</label>
                         <input 
                            type="date" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">{t.selectTime}</label>
                         <input 
                            type="time" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                         />
                     </div>
                 </div>

                 <Button className="w-full mt-8" onClick={confirmBooking} disabled={!bookingDate || !bookingTime}>
                     {t.confirmBooking}
                 </Button>
             </div>
         </div>
      )}
    </div>
  );
};