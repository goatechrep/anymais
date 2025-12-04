

import React, { useState, useEffect, useRef } from 'react';
import { Language, Ong, Coordinates } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Phone, Mail, ArrowRight, ExternalLink, Globe, ChevronDown, Navigation, Map as MapIcon, List } from 'lucide-react';
import { calculateDistance } from '../utils';

// Declare Leaflet globally since it's added via CDN
declare const L: any;

interface PublicOngsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
  onViewOng?: (ong: Ong) => void;
  userCoordinates?: Coordinates;
}

export const PublicOngs: React.FC<PublicOngsProps> = ({ lang, setLang, onBack, onViewOng, userCoordinates }) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 12;

  const filteredOngs = MOCK_ONGS.filter(ong => 
    ong.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ong.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOngs.length / itemsPerPage);
  const displayedOngs = filteredOngs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Reset to first page on search
  };

  const changePage = (newPage: number) => {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDistanceText = (ongCoords?: Coordinates) => {
      if (!userCoordinates || !ongCoords) return null;
      const dist = calculateDistance(userCoordinates.lat, userCoordinates.lng, ongCoords.lat, ongCoords.lng);
      return `${dist} km`;
  };

  // Initialize Map
  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapRef.current) {
        // Default center (Brazil)
        const initialLat = userCoordinates ? userCoordinates.lat : -14.2350;
        const initialLng = userCoordinates ? userCoordinates.lng : -51.9253;
        const initialZoom = userCoordinates ? 10 : 4;

        mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapRef.current);
    }

    // Cleanup map on unmount or view change (optional, but good practice to keep ref sync)
    // We keep the map instance alive if switching views quickly, but here we depend on container ref
  }, [viewMode, userCoordinates]);

  // Update Markers
  useEffect(() => {
      if (viewMode === 'map' && mapRef.current) {
          // Clear existing layers (except tiles)
          mapRef.current.eachLayer((layer: any) => {
              if (layer instanceof L.Marker) {
                  mapRef.current.removeLayer(layer);
              }
          });

          const markers: any[] = [];

          filteredOngs.forEach(ong => {
              if (ong.coordinates) {
                  // Custom Icon
                  const iconHtml = `
                    <div class="relative w-10 h-10">
                        <div class="absolute inset-0 bg-brand-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden transform hover:scale-110 transition-transform">
                            <img src="${ong.image}" class="w-full h-full object-cover opacity-90" />
                        </div>
                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-brand-600"></div>
                    </div>
                  `;

                  const customIcon = L.divIcon({
                      html: iconHtml,
                      className: 'custom-map-marker', // Tailored via CSS or generic
                      iconSize: [40, 48],
                      iconAnchor: [20, 48],
                      popupAnchor: [0, -48]
                  });

                  const marker = L.marker([ong.coordinates.lat, ong.coordinates.lng], { icon: customIcon })
                      .addTo(mapRef.current)
                      .bindPopup(`
                          <div class="text-center min-w-[200px] p-2 font-sans">
                              <h3 class="font-bold text-gray-900 text-lg mb-1">${ong.name}</h3>
                              <p class="text-xs text-gray-500 mb-3">${ong.location}</p>
                              <button id="popup-btn-${ong.id}" class="w-full bg-brand-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-700 transition-colors">
                                  ${t.viewOng}
                              </button>
                          </div>
                      `);
                  
                  // Hacky way to handle popup click in vanilla JS context of Leaflet
                  marker.on('popupopen', () => {
                      setTimeout(() => {
                          const btn = document.getElementById(`popup-btn-${ong.id}`);
                          if (btn) {
                              btn.onclick = () => {
                                  if (onViewOng) onViewOng(ong);
                              };
                          }
                      }, 100);
                  });

                  markers.push(marker);
              }
          });

          // Fit bounds if markers exist
          if (markers.length > 0) {
              const group = L.featureGroup(markers);
              mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
          }
      }
  }, [viewMode, filteredOngs, onViewOng, t.viewOng]);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </button>
            <div className="flex items-center gap-2">
               <span className="text-2xl">🐾</span>
               <span className="font-bold text-xl">
                   <span className="text-brand-600">Any</span>
                   <span className="text-secondary-500">Mais</span>
               </span>
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

      <main className="pt-24 pb-20 flex-1 flex flex-col">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
            <div className="text-center mb-8">
               <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">{t.partnerOngs}</span>
               <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 mt-2">{t.partnerOngs}</h1>
               <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">{t.ongSectionSubtitle}</p>
               
               {/* Controls Bar */}
               <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                   {/* Search Bar */}
                   <div className="w-full relative group flex-1">
                       <input 
                          type="text" 
                          placeholder={t.searchOngsPlaceholder}
                          value={searchQuery}
                          onChange={handleSearch}
                          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-gray-800 bg-white"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   </div>

                   {/* View Toggle */}
                   <div className="flex bg-gray-100 p-1 rounded-full shrink-0">
                       <button 
                         onClick={() => setViewMode('list')}
                         className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-900'}`}
                       >
                           <List size={18} /> {t.viewList}
                       </button>
                       <button 
                         onClick={() => setViewMode('map')}
                         className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-900'}`}
                       >
                           <MapIcon size={18} /> {t.viewMap}
                       </button>
                   </div>
               </div>
            </div>

            {viewMode === 'map' ? (
                 <div className="flex-1 min-h-[500px] w-full relative rounded-3xl overflow-hidden border border-gray-200 shadow-lg mb-10">
                    <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                 </div>
            ) : (
                displayedOngs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {displayedOngs.map(ong => (
                            <div key={ong.id} className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer" onClick={() => onViewOng && onViewOng(ong)}>
                                {/* Image Section */}
                                <div className="relative h-56 overflow-hidden bg-gray-100">
                                    <img 
                                        src={ong.image} 
                                        alt={ong.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                    
                                    {/* Location Badge */}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-800 flex items-center gap-1.5 border border-white/50">
                                        <MapPin size={12} className="text-brand-500" /> {ong.location}
                                    </div>

                                    {/* Distance Badge (if coords available) */}
                                    {getDistanceText(ong.coordinates) && (
                                         <div className="absolute top-4 left-4 bg-brand-50/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-brand-700 flex items-center gap-1.5 border border-brand-100">
                                            <Navigation size={12} className="fill-brand-700" /> {getDistanceText(ong.coordinates)}
                                        </div>
                                    )}
                                </div>

                                {/* Logo Overlay */}
                                <div className="absolute top-44 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg group-hover:scale-105 transition-transform">
                                    <img src={ong.image} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                </div>

                                {/* Content Section */}
                                <div className="pt-8 px-6 pb-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 mt-2">{ong.name}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">{ong.description}</p>
                                    
                                    {/* Footer Actions */}
                                    <div className="pt-5 border-t border-gray-50 flex items-center justify-between gap-3 mt-auto">
                                        {/* Contact Icons */}
                                        <div className="flex gap-2">
                                            {ong.phone && (
                                                <a 
                                                    href={`tel:${ong.phone.replace(/\D/g, '')}`} 
                                                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"
                                                    title={ong.phone}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Phone size={18} />
                                                </a>
                                            )}
                                            {ong.email && (
                                                <a 
                                                    href={`mailto:${ong.email}`}
                                                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    title={ong.email}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Mail size={18} />
                                                </a>
                                            )}
                                        </div>

                                        {/* View Button */}
                                        <Button 
                                            size="sm" 
                                            className="bg-gray-900 hover:bg-brand-600 text-white shadow-none hover:shadow-lg hover:shadow-brand-200/50 flex items-center gap-2 text-xs font-bold px-5 rounded-xl transition-all ml-auto"
                                            onClick={() => onViewOng && onViewOng(ong)}
                                        >
                                            {t.viewOng}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-16">
                                <button 
                                    onClick={() => changePage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-600 font-bold hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                    <span className="hidden sm:inline">{t.prevPage}</span>
                                </button>
                                
                                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                    {t.pageOf} <span className="text-gray-900 font-bold">{currentPage}</span> / {totalPages}
                                </span>
                                
                                <button 
                                    onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-600 font-bold hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <span className="hidden sm:inline">{t.nextPage}</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="max-w-md mx-auto text-center py-20">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.noOngsFound}</h3>
                        <p className="text-gray-500 mb-8">Tente buscar por outra cidade ou nome de ONG.</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                            className="text-brand-600 font-bold hover:text-brand-700 underline underline-offset-4"
                        >
                            {t.clearFilters}
                        </button>
                    </div>
                )
            )}
         </div>
      </main>
    </div>
  );
};