
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader, MapPin } from "lucide-react";

interface CountrySelectorProps {
  selectedCountry: string | null;
  onSelectCountry: (country: string) => void;
  isSaving: boolean;
  countryNames: Record<string, string>;
}

const CountrySelector = ({ 
  selectedCountry,
  onSelectCountry,
  isSaving,
  countryNames
}: CountrySelectorProps) => {
  const [country, setCountry] = useState<string | undefined>(selectedCountry || undefined);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  
  // Auto-detect country on component mount if no country is selected
  useEffect(() => {
    if (!selectedCountry) {
      handleAutoDetectCountry();
    }
  }, [selectedCountry]);
  
  const handleAutoDetectCountry = async () => {
    setIsAutoDetecting(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      
      // Set the detected country if it's in our list
      if (data.country_code && countryNames[data.country_code]) {
        setCountry(data.country_code);
      }
    } catch (error) {
      console.error("Failed to auto-detect country:", error);
    } finally {
      setIsAutoDetecting(false);
    }
  };
  
  const handleContinue = () => {
    if (country) {
      onSelectCountry(country);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select your country</h3>
        <p className="text-muted-foreground text-sm mt-1">
          We'll personalize your payment options based on your location.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(countryNames).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoDetectCountry}
            disabled={isAutoDetecting}
            type="button"
          >
            {isAutoDetecting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Auto-detect
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleContinue} 
            disabled={!country || isSaving}
          >
            {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;
