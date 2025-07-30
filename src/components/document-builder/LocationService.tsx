import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import type { Jurisdiction } from '@/types/document-builder';

interface LocationServiceProps {
  onLocationDetected?: (jurisdictions: Jurisdiction[]) => void;
  jurisdictions: Jurisdiction[];
}

interface DetectedLocation {
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  confidence?: number;
}

export const LocationService = ({ onLocationDetected, jurisdictions }: LocationServiceProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedJurisdictions, setSuggestedJurisdictions] = useState<Jurisdiction[]>([]);

  const detectLocationFromBrowser = async (): Promise<DetectedLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Mock reverse geocoding - in production, use a real service like Google Maps API
            const mockLocationData: DetectedLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: 'San Francisco',
              state: 'California',
              county: 'San Francisco County',
              country: 'United States',
              confidence: 0.85
            };
            
            resolve(mockLocationData);
          } catch (err) {
            reject(new Error('Failed to fetch location details'));
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
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const detectLocationFromIP = async (): Promise<DetectedLocation> => {
    try {
      // Mock IP-based location detection - in production, use ipapi.co or similar
      const mockIPLocation: DetectedLocation = {
        city: 'Los Angeles',
        state: 'California',
        county: 'Los Angeles County',
        country: 'United States',
        confidence: 0.7
      };
      
      return mockIPLocation;
    } catch (err) {
      throw new Error('IP-based location detection failed');
    }
  };

  const findMatchingJurisdictions = (location: DetectedLocation): Jurisdiction[] => {
    const matches: Jurisdiction[] = [];
    
    // Find state match
    if (location.state) {
      const stateMatch = jurisdictions.find(j => 
        j.type === 'state' && 
        j.name.toLowerCase().includes(location.state!.toLowerCase())
      );
      if (stateMatch) {
        matches.push(stateMatch);
      }
    }
    
    // Find county match (simplified - in production, would need more sophisticated matching)
    if (location.county) {
      const countyMatch = jurisdictions.find(j => 
        j.type === 'county' && 
        j.name.toLowerCase().includes(location.county!.toLowerCase())
      );
      if (countyMatch) {
        matches.push(countyMatch);
      }
    }
    
    return matches;
  };

  const handleLocationDetection = async (method: 'browser' | 'ip') => {
    setIsDetecting(true);
    setError(null);
    
    try {
      let location: DetectedLocation;
      
      if (method === 'browser') {
        location = await detectLocationFromBrowser();
      } else {
        location = await detectLocationFromIP();
      }
      
      setDetectedLocation(location);
      
      // Find matching jurisdictions
      const matches = findMatchingJurisdictions(location);
      setSuggestedJurisdictions(matches);
      
      // Notify parent component
      onLocationDetected?.(matches);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location detection failed');
    } finally {
      setIsDetecting(false);
    }
  };

  const clearLocation = () => {
    setDetectedLocation(null);
    setSuggestedJurisdictions([]);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Automatically detect your location to suggest relevant state and county regulations.
        </p>
        
        {!detectedLocation && !error && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleLocationDetection('browser')}
              disabled={isDetecting}
              className="flex-1"
            >
              {isDetecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Use Precise Location
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLocationDetection('ip')}
              disabled={isDetecting}
              className="flex-1"
            >
              {isDetecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Use IP Location
            </Button>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {detectedLocation && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Location detected successfully
                {detectedLocation.confidence && (
                  <span className="ml-2 text-xs">
                    (Confidence: {Math.round(detectedLocation.confidence * 100)}%)
                  </span>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Detected Location:</h4>
              <div className="space-y-1 text-sm">
                {detectedLocation.city && (
                  <div>City: <span className="font-medium">{detectedLocation.city}</span></div>
                )}
                {detectedLocation.county && (
                  <div>County: <span className="font-medium">{detectedLocation.county}</span></div>
                )}
                {detectedLocation.state && (
                  <div>State: <span className="font-medium">{detectedLocation.state}</span></div>
                )}
                {detectedLocation.country && (
                  <div>Country: <span className="font-medium">{detectedLocation.country}</span></div>
                )}
              </div>
            </div>
            
            {suggestedJurisdictions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Suggested Jurisdictions:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedJurisdictions.map((jurisdiction) => (
                    <Badge key={jurisdiction.id} variant="default">
                      {jurisdiction.name} ({jurisdiction.type})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearLocation} className="flex-1">
                Clear Location
              </Button>
              <Button variant="outline" onClick={() => handleLocationDetection('browser')} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Detect Again
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Precise Location:</strong> Uses GPS for accurate city/county detection</p>
          <p>• <strong>IP Location:</strong> Uses your internet connection for general area detection</p>
          <p>• Your location data is not stored and only used to suggest relevant regulations</p>
        </div>
      </CardContent>
    </Card>
  );
};