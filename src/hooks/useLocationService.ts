import { useState, useCallback } from 'react';
import type { Jurisdiction } from '@/types/document-builder';

interface LocationData {
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  confidence?: number;
}

interface LocationServiceHook {
  isDetecting: boolean;
  location: LocationData | null;
  error: string | null;
  detectLocation: (method?: 'browser' | 'ip') => Promise<LocationData>;
  findMatchingJurisdictions: (location: LocationData, jurisdictions: Jurisdiction[]) => Jurisdiction[];
  clearLocation: () => void;
}

export const useLocationService = (): LocationServiceHook => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectBrowserLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In production, integrate with reverse geocoding service
            // For now, using mock data based on coordinates
            const locationData = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            
            resolve({
              ...locationData,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              confidence: 0.9
            });
          } catch (err) {
            reject(new Error('Failed to reverse geocode location'));
          }
        },
        (error) => {
          let message = 'Location detection failed';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const detectIPLocation = useCallback(async (): Promise<LocationData> => {
    try {
      // Mock IP-based location - in production, integrate with ipapi.co, ipinfo.io, etc.
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('IP location service unavailable');
      }
      
      const data = await response.json();
      
      return {
        city: data.city,
        state: data.region,
        country: data.country_name,
        confidence: 0.7
      };
    } catch (err) {
      // Fallback to mock data if external service fails
      return {
        city: 'Los Angeles',
        state: 'California',
        county: 'Los Angeles County',
        country: 'United States',
        confidence: 0.6
      };
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
    // Mock reverse geocoding - in production, use Google Maps API, Mapbox, etc.
    const mockGeocodingData: Record<string, { city: string; state: string; county: string }> = {
      '37.7749': { // San Francisco coordinates
        city: 'San Francisco',
        state: 'California',
        county: 'San Francisco County'
      },
      '34.0522': { // Los Angeles coordinates
        city: 'Los Angeles',
        state: 'California',
        county: 'Los Angeles County'
      },
      '40.7128': { // New York coordinates
        city: 'New York',
        state: 'New York',
        county: 'New York County'
      }
    };

    // Find closest match based on latitude
    const latKey = Object.keys(mockGeocodingData).find(key => 
      Math.abs(parseFloat(key) - lat) < 1
    );

    if (latKey) {
      return mockGeocodingData[latKey];
    }

    // Default fallback
    return {
      city: 'Unknown',
      state: 'California',
      county: 'Unknown County'
    };
  };

  const detectLocation = useCallback(async (method: 'browser' | 'ip' = 'browser'): Promise<LocationData> => {
    setIsDetecting(true);
    setError(null);

    try {
      let locationData: LocationData;
      
      if (method === 'browser') {
        locationData = await detectBrowserLocation();
      } else {
        locationData = await detectIPLocation();
      }

      setLocation(locationData);
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location detection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDetecting(false);
    }
  }, [detectBrowserLocation, detectIPLocation]);

  const findMatchingJurisdictions = useCallback((
    locationData: LocationData, 
    jurisdictions: Jurisdiction[]
  ): Jurisdiction[] => {
    const matches: Jurisdiction[] = [];
    
    // Find state match
    if (locationData.state) {
      const stateMatch = jurisdictions.find(j => 
        j.type === 'state' && 
        (j.name.toLowerCase().includes(locationData.state!.toLowerCase()) ||
         j.abbreviation?.toLowerCase() === getStateAbbreviation(locationData.state!).toLowerCase())
      );
      if (stateMatch) {
        matches.push(stateMatch);
        
        // Find counties within this state
        const countyMatches = jurisdictions.filter(j => 
          j.type === 'county' && 
          j.parent_jurisdiction_id === stateMatch.id
        );
        
        // Try to match specific county if available
        if (locationData.county) {
          const specificCounty = countyMatches.find(c => 
            c.name.toLowerCase().includes(locationData.county!.toLowerCase())
          );
          if (specificCounty) {
            matches.push(specificCounty);
          }
        }
      }
    }
    
    return matches;
  }, []);

  const getStateAbbreviation = (stateName: string): string => {
    const stateAbbreviations: Record<string, string> = {
      'California': 'CA',
      'Texas': 'TX',
      'Florida': 'FL',
      'New York': 'NY',
      'Washington': 'WA',
      'Illinois': 'IL',
      'Pennsylvania': 'PA',
      'Ohio': 'OH',
      'Georgia': 'GA',
      'North Carolina': 'NC'
    };
    
    return stateAbbreviations[stateName] || '';
  };

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    isDetecting,
    location,
    error,
    detectLocation,
    findMatchingJurisdictions,
    clearLocation
  };
};