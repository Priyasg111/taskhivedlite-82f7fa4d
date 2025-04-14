
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, ArrowRight, Bitcoin, CreditCard } from "lucide-react";
import { countryNames } from "./PaymentSetup";

interface PaymentMethodSelectorProps {
  availableMethods: string[];
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
  country: string;
  requiresKyc: boolean;
}

const PaymentMethodSelector = ({ 
  availableMethods, 
  selectedMethod, 
  onSelectMethod,
  country,
  requiresKyc
}: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select payment method</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Choose how you'd like to receive payments in {countryNames[country] || country}.
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Bank Transfer Option */}
        {availableMethods.includes("bank") && (
          <Card 
            className={`p-4 border-2 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors ${
              selectedMethod === "bank" ? "border-primary" : "border-muted"
            }`}
            onClick={() => onSelectMethod("bank")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-muted-foreground">
                  Via Wise, Airwallex, Zenus or Revolut
                </p>
              </div>
              <Button variant="secondary" size="sm" className="mt-2">
                Select
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Stripe Connect Option */}
        {availableMethods.includes("stripe") && (
          <Card 
            className={`p-4 border-2 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors ${
              selectedMethod === "stripe" ? "border-primary" : "border-muted"
            }`}
            onClick={() => onSelectMethod("stripe")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h4 className="font-medium">Stripe Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Direct deposits to your bank account
                </p>
              </div>
              <Button variant="secondary" size="sm" className="mt-2">
                Select
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Crypto Wallet Option */}
        <Card 
          className={`p-4 border-2 ${requiresKyc ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-muted/50"} transition-colors ${
            selectedMethod === "crypto" ? "border-primary" : "border-muted"
          }`}
          onClick={() => !requiresKyc && availableMethods.includes("crypto") && onSelectMethod("crypto")}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <h4 className="font-medium">Crypto Wallet</h4>
              <p className="text-sm text-muted-foreground">
                USDC, BTC, ETH or SOL
              </p>
            </div>
            {requiresKyc ? (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-md mt-2">
                <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Requires KYC verification</span>
              </div>
            ) : !availableMethods.includes("crypto") ? (
              <div className="flex items-center text-xs text-muted-foreground bg-muted p-2 rounded-md mt-2">
                <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Not available in your region</span>
              </div>
            ) : (
              <Button variant="secondary" size="sm" className="mt-2">
                Select
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
