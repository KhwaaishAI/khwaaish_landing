import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface OTPAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (otp: string) => void;
  onChangeMobile?: () => void;
  title?: string;
  subtitle?: string;
  digits?: number;
}

const OTPAuthModal = ({
  open,
  onOpenChange,
  onConfirm,
  onChangeMobile,
  title = "OTP Authentication",
  subtitle = "Enter the 4-digit OTP from Pharmeasy",
  digits = 4,
}: OTPAuthModalProps) => {
  const [otp, setOtp] = useState<string[]>(Array(digits).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < digits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, digits);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < digits) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((v) => !v);
    const focusIndex = nextEmptyIndex === -1 ? digits - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleConfirm = () => {
    const otpString = otp.join("");
    if (otpString.length === digits) {
      onConfirm?.(otpString);
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-card border-border p-0 gap-0 overflow-hidden">
        <div className="relative p-6 pb-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <DialogHeader className="space-y-3 text-center pt-2">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </DialogHeader>

          <div className="flex justify-center gap-3 mt-8">
            {Array.from({ length: digits }).map((_, index) => (
              <input
                key={index}
                ref={(el) => {inputRefs.current[index] = el}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-14 h-14 text-center text-xl font-medium bg-input border-2 border-border rounded-lg text-foreground 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                  transition-all duration-200 placeholder:text-muted-foreground"
                placeholder="-"
              />
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={onChangeMobile}
              className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-2 transition-colors"
            >
              Change Mobile number
            </button>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!isComplete}
            className="w-full mt-8 h-12 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            CONFIRM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPAuthModal;
