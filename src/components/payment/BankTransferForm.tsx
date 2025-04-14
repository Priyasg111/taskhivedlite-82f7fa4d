
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader, ArrowLeft } from "lucide-react";
import { countryNames } from "./PaymentSetup";

interface BankTransferFormProps {
  onComplete: (data: any) => Promise<void>;
  initialData: any;
  country: string;
  saving: boolean;
}

// Define which countries use which banking systems
const ibanCountries = ["DE", "FR", "IT", "ES", "NL"];
const swiftCountries = ["US", "CA", "GB", "AU", "NZ", "JP", "SG"];
const routingNumberCountries = ["US"];
const sortCodeCountries = ["GB"];
const bsbCountries = ["AU"];

// Get the appropriate payment services for each country
const getAvailableServices = (country: string) => {
  if (["US", "GB", "EU", "AU", "NZ", "CA"].includes(country)) {
    return ["wise", "revolut"]; 
  } else if (["SG", "HK", "JP"].includes(country)) {
    return ["wise", "airwallex"];
  } else if (["AR", "BR", "CL", "CO", "PE", "MX"].includes(country)) {
    return ["zenus"];
  } else {
    return ["wise"]; // Default
  }
};

const BankTransferForm = ({ 
  onComplete, 
  initialData, 
  country, 
  saving 
}: BankTransferFormProps) => {
  const [step, setStep] = useState<"service" | "details">(initialData?.service ? "details" : "service");
  const [service, setService] = useState<string | undefined>(initialData?.service);

  const usesIban = ibanCountries.includes(country);
  const usesSwift = swiftCountries.includes(country);
  const usesRoutingNumber = routingNumberCountries.includes(country);
  const usesSortCode = sortCodeCountries.includes(country);
  const usesBSB = bsbCountries.includes(country);
  
  const availableServices = getAvailableServices(country);

  // Define schema based on country
  const formSchema = z.object({
    accountHolderName: z.string().min(2, "Account holder name is required"),
    accountNumber: z.string().min(5, "Account number is required"),
    bankName: z.string().min(2, "Bank name is required"),
    ...(usesIban ? { iban: z.string().min(15, "Valid IBAN is required") } : {}),
    ...(usesSwift ? { swift: z.string().min(8, "Valid SWIFT/BIC is required") } : {}),
    ...(usesRoutingNumber ? { routingNumber: z.string().min(9, "Valid routing number is required") } : {}),
    ...(usesSortCode ? { sortCode: z.string().min(6, "Valid sort code is required") } : {}),
    ...(usesBSB ? { bsb: z.string().min(6, "Valid BSB is required") } : {})
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: initialData?.accountHolderName || "",
      accountNumber: initialData?.accountNumber || "",
      bankName: initialData?.bankName || "",
      ...(usesIban ? { iban: initialData?.iban || "" } : {}),
      ...(usesSwift ? { swift: initialData?.swift || "" } : {}),
      ...(usesRoutingNumber ? { routingNumber: initialData?.routingNumber || "" } : {}),
      ...(usesSortCode ? { sortCode: initialData?.sortCode || "" } : {}),
      ...(usesBSB ? { bsb: initialData?.bsb || "" } : {})
    }
  });

  const handleServiceSelect = (selectedService: string) => {
    setService(selectedService);
    setStep("details");
  };

  const handleSubmit = async (values: any) => {
    if (!service) return;
    await onComplete({
      ...values,
      service,
      type: "bank"
    });
  };

  const backToServiceSelection = () => {
    setStep("service");
  };

  return (
    <div className="space-y-6">
      {step === "service" ? (
        <>
          <div>
            <h3 className="text-lg font-medium">Select your payment service</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Choose your preferred bank transfer service for {countryNames[country] || country}.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableServices.includes('wise') && (
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => handleServiceSelect('wise')}
              >
                <span className="font-bold">Wise</span>
                <span className="text-xs text-muted-foreground">
                  Low fees, available in {countryNames[country] || country}
                </span>
              </Button>
            )}
            
            {availableServices.includes('revolut') && (
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => handleServiceSelect('revolut')}
              >
                <span className="font-bold">Revolut</span>
                <span className="text-xs text-muted-foreground">
                  Fast transfers in Europe, UK, US
                </span>
              </Button>
            )}
            
            {availableServices.includes('airwallex') && (
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => handleServiceSelect('airwallex')}
              >
                <span className="font-bold">Airwallex</span>
                <span className="text-xs text-muted-foreground">
                  Best for Asia-Pacific regions
                </span>
              </Button>
            )}
            
            {availableServices.includes('zenus') && (
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => handleServiceSelect('zenus')}
              >
                <span className="font-bold">Zenus</span>
                <span className="text-xs text-muted-foreground">
                  For Latin America and Caribbean
                </span>
              </Button>
            )}
          </div>
        </>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={backToServiceSelection}
                  className="p-0 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">
                  Bank details for {service?.charAt(0).toUpperCase() + service?.slice(1)}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Enter your bank account information for payouts in {countryNames[country] || country}.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {usesIban && (
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your IBAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {usesSwift && (
                <FormField
                  control={form.control}
                  name="swift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT/BIC</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SWIFT/BIC code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {usesRoutingNumber && (
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter routing number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {usesSortCode && (
                <FormField
                  control={form.control}
                  name="sortCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sort code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {usesBSB && (
                <FormField
                  control={form.control}
                  name="bsb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BSB</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter BSB number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Bank Details
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default BankTransferForm;
