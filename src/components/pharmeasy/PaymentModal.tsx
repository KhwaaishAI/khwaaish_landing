import { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
 { id: "gpay", name: "Google Pay", icon: <img src="https://i.pinimg.com/564x/67/28/d8/6728d8f618ff531833c69bd830569376.jpg" alt="gpay" /> },
//   { id: "phonepe", name: "PhonePe", icon: <PhonePeIcon /> },
//   { id: "other", name: "Other UPI", icon: <OtherUPIIcon /> },
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Pay with UPI</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Payment Options */}
        <div className="p-4 space-y-2">
          {paymentOptions.slice(0, 2).map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                "hover:bg-secondary/50",
                selectedOption === option.id && "bg-secondary/30"
              )}
            >
              <div className="flex items-center gap-3">
                {option.icon}
                <span className="text-foreground font-medium">{option.name}</span>
              </div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  selectedOption === option.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                )}
              >
                {selectedOption === option.id && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </button>
          ))}

          {/* UPI ID Input - Shown when other UPI is selected */}
          {selectedOption === "other" && (
            <div className="flex gap-2 mt-4 animate-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <div className="relative">
                <button
                  onClick={() => setIsSuffixOpen(!isSuffixOpen)}
                  className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <span>{selectedSuffix}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    isSuffixOpen && "rotate-180"
                  )} />
                </button>
                {isSuffixOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                    {upiSuffixes.map((suffix) => (
                      <button
                        key={suffix}
                        onClick={() => {
                          setSelectedSuffix(suffix);
                          setIsSuffixOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-secondary transition-colors",
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
          )}

          {/* Pay Button */}
          <button 
            onClick={handlePay}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            Pay ₹{amount.toLocaleString("en-IN")}
          </button>

          {/* Other UPI Option */}
          <button
            onClick={() => setSelectedOption("other")}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 mt-2",
              "hover:bg-secondary/50",
              selectedOption === "other" && "bg-secondary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-xs font-semibold text-foreground">UPI</span>
              </div>
              <span className="text-foreground font-medium">Other UPI</span>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                selectedOption === "other"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/40"
              )}
            >
              {selectedOption === "other" && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
