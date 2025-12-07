import { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
}





const paymentOptions: PaymentOption[] = [
 { id: "gpay", name: "Google Pay", icon: <img src="https://i.pinimg.com/564x/67/28/d8/6728d8f618ff531833c69bd830569376.jpg" alt="gpay" className="w-full h-full object-contain" /> },
   { id: "phonepe", name: "PhonePe", icon:<img src="https://img.icons8.com/color/512/phone-pe.png" alt="phonpeIcon" className="w-full h-full object-contain" /> },
 // { id: "other", name: "Other UPI", icon: <OtherUPIIcon /> },
];

const upiSuffixes = ["@ybl", "@upi", "@paytm", "@oksbi", "@okaxis", "@okicici"];

export const PaymentModal = ({ amount, isOpen, onClose }: PaymentModalProps) => {
  const [selectedOption, setSelectedOption] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [selectedSuffix, setSelectedSuffix] = useState("@ybl");
  const [isSuffixOpen, setIsSuffixOpen] = useState(false);

  const handlePay = () => {
    // Handle payment processing
    console.log("Processing payment:", { selectedOption, upiId, amount });
    // In a real app, this would call a payment API
    // For now, just close and let the flow continue
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl border border-border p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Pay with UPI</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 mb-6">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border",
                "hover:bg-secondary/50 hover:border-border",
                selectedOption === option.id 
                  ? "bg-secondary/30 border-primary" 
                  : "bg-secondary/20 border-border/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-background">
                  {option.icon}
                </div>
                <span className="text-foreground font-medium">{option.name}</span>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  selectedOption === option.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                )}
              >
                {selectedOption === option.id && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
            </button>
          ))}

          {/* Other UPI Option */}
          <button
            onClick={() => setSelectedOption("other")}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border",
              "hover:bg-secondary/50 hover:border-border",
              selectedOption === "other" 
                ? "bg-secondary/30 border-primary" 
                : "bg-secondary/20 border-border/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border">
                <span className="text-xs font-semibold text-foreground">UPI</span>
              </div>
              <span className="text-foreground font-medium">Other UPI</span>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                selectedOption === "other"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/40"
              )}
            >
              {selectedOption === "other" && (
                <Check className="w-3 h-3 text-primary-foreground" />
              )}
            </div>
          </button>
        </div>

        {/* UPI ID Input - Shown when other UPI is selected */}
        {selectedOption === "other" && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-sm text-muted-foreground mb-2">
              Enter UPI ID
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="yourname"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <div className="relative">
                <button
                  onClick={() => setIsSuffixOpen(!isSuffixOpen)}
                  className="flex items-center gap-2 bg-input border border-border rounded-md px-3 py-2 h-9 text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm">{selectedSuffix}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    isSuffixOpen && "rotate-180"
                  )} />
                </button>
                {isSuffixOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-150 min-w-[120px]">
                    {upiSuffixes.map((suffix) => (
                      <button
                        key={suffix}
                        onClick={() => {
                          setSelectedSuffix(suffix);
                          setIsSuffixOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors",
                          selectedSuffix === suffix && "bg-secondary text-primary"
                        )}
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-full transition-colors"
        >
          Pay ₹{amount.toLocaleString("en-IN")}
        </Button>
      </div>
    </div>
  );
};
