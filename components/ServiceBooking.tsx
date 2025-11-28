
import React from 'react';
import { ServiceProvider, Language, Coordinates } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Star, MapPin, Calendar, Clock, ShieldCheck, Dog } from 'lucide-react';
import { calculateDistance } from '../utils';

interface ServiceBookingProps {
  providers: ServiceProvider[];
  lang: Language;
  userLocation?: Coordinates;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({ providers, lang, userLocation }) => {
  const t = TRANSLATIONS[lang];

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
    if (userLocation && provider.location) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, provider.location.lat, provider.location.lng);
      return `${dist} km`;
    }
    // Fallback static distance if location not available or calculated
    return '2.5 km';
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t.dashServices}</h2>
          <p className="text-gray-500 mt-1">Encontre os melhores profissionais para seu pet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {providers.map((provider) => (
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
                  <span className="text-green-600 font-medium">Aberto agora</span>
                </div>
              </div>

              <Button className="w-full py-3 shadow-lg shadow-brand-100 flex items-center justify-center gap-2 font-semibold text-lg">
                <Calendar size={18} />
                {t.bookNow}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
