import { Coordinates } from '../../types';
import { getLocationFromStorage, mockGeocode, mockReverseGeocode, saveLocationToStorage } from '../../utils';

const DEFAULT_LOCATION_NAME = 'São Paulo, SP';
const DEFAULT_COORDINATES: Coordinates = { lat: -23.5505, lng: -46.6333 };

export const locationService = {
  getStoredLocationName() {
    return getLocationFromStorage();
  },
  saveLocationName(locationName: string) {
    saveLocationToStorage(locationName);
  },
  async reverseGeocode(lat: number, lng: number) {
    return mockReverseGeocode(lat, lng);
  },
  async geocode(query: string) {
    return mockGeocode(query);
  },
  async detectCurrentPosition(): Promise<{ coords: Coordinates; locationName: string }> {
    if (!('geolocation' in navigator)) {
      return {
        coords: DEFAULT_COORDINATES,
        locationName: DEFAULT_LOCATION_NAME,
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            const locationName = await mockReverseGeocode(coords.lat, coords.lng);
            resolve({ coords, locationName });
          } catch (_error) {
            resolve({ coords: DEFAULT_COORDINATES, locationName: DEFAULT_LOCATION_NAME });
          }
        },
        () => {
          resolve({ coords: DEFAULT_COORDINATES, locationName: DEFAULT_LOCATION_NAME });
        }
      );
    });
  },
};
