import { useEffect, useState } from 'react';
import { Coordinates } from '../types';
import { locationService } from '../services/location/locationService';

export const useStoredLocation = () => {
  const [headerLocation, setHeaderLocation] = useState('');
  const [userCoords, setUserCoords] = useState<Coordinates | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const savedLocation = locationService.getStoredLocationName();
    if (savedLocation) {
      setHeaderLocation(savedLocation);
    }
  }, []);

  const detectLocation = async () => {
    setIsLocating(true);

    try {
      const { coords, locationName } = await locationService.detectCurrentPosition();
      setUserCoords(coords);
      setHeaderLocation(locationName);
      locationService.saveLocationName(locationName);
    } finally {
      setIsLocating(false);
    }
  };

  return {
    headerLocation,
    setHeaderLocation,
    userCoords,
    setUserCoords,
    isLocating,
    detectLocation,
  };
};
