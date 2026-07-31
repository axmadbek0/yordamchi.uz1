/**
 * useNearbySchools — geolocation + distance sorting hook
 */

import { useState, useEffect } from 'react';
import type { SchoolWithLocation } from '../../types';
import { getSchoolsWithLocation } from '../../lib/schoolsApi';
import { calculateDistanceKm } from '../../lib/distance';

export type LocationState =
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UseNearbySchoolsReturn {
  schools: SchoolWithLocation[];
  isLoading: boolean;
  error: string | null;
  locationState: LocationState;
  userLocation: UserLocation | null;
  refetch: () => void;
}

export function useNearbySchools(): UseNearbySchoolsReturn {
  const [schools, setSchools] = useState<SchoolWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('requesting');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const fetchAndSort = (loc: UserLocation | null) => {
    setIsLoading(true);
    setError(null);

    getSchoolsWithLocation()
      .then((data) => {
        let sorted: SchoolWithLocation[];
        if (loc) {
          sorted = data
            .map((s) => ({
              ...s,
              distanceKm:
                s.lat && s.lng
                  ? calculateDistanceKm(loc.lat, loc.lng, s.lat, s.lng)
                  : undefined,
            }))
            .sort((a, b) => {
              if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
              if (a.distanceKm === undefined) return 1;
              if (b.distanceKm === undefined) return -1;
              return a.distanceKm - b.distanceKm;
            });
        } else {
          sorted = data;
        }
        setSchools(sorted);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Maktablar ro'yxatini yuklab bo'lmadi");
        setIsLoading(false);
      });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      fetchAndSort(null);
      return;
    }

    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        setLocationState('granted');
        fetchAndSort(loc);
      },
      () => {
        // Permission denied or error
        setLocationState('denied');
        fetchAndSort(null);
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    schools,
    isLoading,
    error,
    locationState,
    userLocation,
    refetch: requestLocation,
  };
}
