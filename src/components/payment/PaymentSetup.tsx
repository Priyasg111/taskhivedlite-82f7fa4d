
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CountrySelector from "./CountrySelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import BankTransferForm from "./BankTransferForm";
import StripeConnectSetup from "./StripeConnectSetup";
import CryptoWalletSetup from "./CryptoWalletSetup";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Arrays of countries supported by each payment method
const stripeCountries = ["US", "CA", "GB", "AU", "NZ", "DE", "FR", "ES", "IT", "NL"];
const wiseCountries = ["US", "CA", "GB", "EU", "AU", "NZ", "JP", "SG"];
const zenusCountries = ["AR", "BR", "CL", "CO", "PE", "MX", "IN", "PH", "MY", "ID"];
const airwallexCountries = ["AU", "HK", "SG", "JP", "CN", "UK", "US", "CA", "NZ"];
const cryptoAllowedCountries = [
  "US", "CA", "GB", "DE", "FR", "IT", "ES", "AU", "JP", "SG", "KR", 
  "CH", "SE", "NL", "BR", "AR", "MX", "ZA", "NG", "AE", "SA"
];

// Map country codes to names for UI display
export const countryNames: Record<string, string> = {
  "US": "United States",
  "CA": "Canada",
  "GB": "United Kingdom",
  "AU": "Australia",
  "NZ": "New Zealand",
  "DE": "Germany",
  "FR": "France",
  "ES": "Spain",
  "IT": "Italy",
  "NL": "Netherlands",
  "JP": "Japan",
  "SG": "Singapore",
  "AR": "Argentina",
  "BR": "Brazil",
  "CL": "Chile",
  "CO": "Colombia",
  "PE": "Peru",
  "MX": "Mexico",
  "IN": "India",
  "PH": "Philippines",
  "MY": "Malaysia",
  "ID": "Indonesia",
  "HK": "Hong Kong",
  "CN": "China",
  "UK": "United Kingdom",
  "KR": "South Korea",
  "CH": "Switzerland",
  "SE": "Sweden",
  "ZA": "South Africa",
  "NG": "Nigeria",
  "AE": "United Arab Emirates",
  "SA": "Saudi Arabia",
  // Add more country mappings as needed
};

export interface UserProfile {
  id: string;
  country: string | null;
  payout_method: string | null;
  payout_details: any | null;
  preferred_token: string | null;
  kyc_status: string | null;
}

const PaymentSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<string | null>(null);
  const [availablePayoutMethods, setAvailablePayoutMethods] = useState<string[]>([]);
  const [step, setStep] = useState<"country" | "method" | "details">("country");
  
  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        
        // Set initial states from profile data
        if (data.country) {
          setCountry(data.country);
          updateAvailablePayoutMethods(data.country);
          setStep(data.payout_method ? "details" : "method");
        }
        
        if (data.payout_method) {
          setPayoutMethod(data.payout_method);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, toast]);
  
  // Update available payout methods when country changes
  const updateAvailablePayoutMethods = (countryCode: string) => {
    const methods: string[] = [];
    
    if (stripeCountries.includes(countryCode)) {
      methods.push("stripe");
    }
    
    if (wiseCountries.includes(countryCode) || 
        zenusCountries.includes(countryCode) || 
        airwallexCountries.includes(countryCode)) {
      methods.push("bank");
    }
    
    if (cryptoAllowedCountries.includes(countryCode)) {
      // Only show crypto option if KYC is verified or not required in this country
      if (userProfile?.kyc_status === "verified" || !cryptoRequiresKyc(countryCode)) {
        methods.push("crypto");
      }
    }
    
    setAvailablePayoutMethods(methods);
  };
  
  // Determine if crypto payments require KYC verification for a specific country
  const cryptoRequiresKyc = (countryCode: string): boolean => {
    // Countries where crypto requires KYC (for demonstration)
    const kycRequiredCountries = ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES"];
    return kycRequiredCountries.includes(countryCode);
  };
  
  // Handle country selection
  const handleCountrySelect = async (selectedCountry: string) => {
    setCountry(selectedCountry);
    updateAvailablePayoutMethods(selectedCountry);
    
    // Save country to user profile
    if (user) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ country: selectedCountry })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setStep("method");
      } catch (err) {
        console.error("Error saving country:", err);
        toast({
          title: "Error",
          description: "Failed to save your country. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };
  
  // Handle payout method selection
  const handlePayoutMethodSelect = (method: string) => {
    setPayoutMethod(method);
    setStep("details");
  };
  
  // Handle completing the setup process
  const handleSetupComplete = async (payoutDetails: any, preferredToken?: string) => {
    if (!user || !payoutMethod) return;
    
    setSaving(true);
    try {
      const updateData: any = {
        payout_method: payoutMethod,
        payout_details: payoutDetails
      };
      
      if (preferredToken) {
        updateData.preferred_token = preferredToken;
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => prev ? {...prev, ...updateData} : null);
      
      toast({
        title: "Success",
        description: "Your payment setup is complete!",
      });
    } catch (err) {
      console.error("Error saving payment details:", err);
      toast({
        title: "Error",
        description: "Failed to save your payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Payment Setup</CardTitle>
          {userProfile?.kyc_status && (
            <Badge variant={userProfile.kyc_status === "verified" ? "outline" : "secondary"}>
              KYC: {userProfile.kyc_status.charAt(0).toUpperCase() + userProfile.kyc_status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "country" && (
          <CountrySelector 
            selectedCountry={country} 
            onSelectCountry={handleCountrySelect}
            isSaving={saving}
            countryNames={countryNames}
          />
        )}
        
        {step === "method" && country && (
          <PaymentMethodSelector
            availableMethods={availablePayoutMethods}
            selectedMethod={payoutMethod}
            onSelectMethod={handlePayoutMethodSelect}
            country={country}
            requiresKyc={userProfile?.kyc_status !== "verified" && cryptoRequiresKyc(country)}
          />
        )}
        
        {step === "details" && payoutMethod === "bank" && (
          <BankTransferForm
            onComplete={handleSetupComplete}
            initialData={userProfile?.payout_details}
            country={country || ""}
            saving={saving}
          />
        )}
        
        {step === "details" && payoutMethod === "stripe" && (
          <StripeConnectSetup
            onComplete={handleSetupComplete}
            initialData={userProfile?.payout_details}
            saving={saving}
          />
        )}
        
        {step === "details" && payoutMethod === "crypto" && (
          <CryptoWalletSetup
            onComplete={handleSetupComplete}
            initialData={userProfile?.payout_details}
            preferredToken={userProfile?.preferred_token}
            saving={saving}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSetup;
