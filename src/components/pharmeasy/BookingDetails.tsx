import { useState } from "react";
import { X, MapPin, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import mapImg from "../../assets/map.png";
import { usePharmEasyFlow } from "./PharmEasyFlowContext";

export function BookingDetails() {
  const { setStep, updateBookingDetails, orderData } = usePharmEasyFlow();
  const [location, setLocation] = useState(orderData.bookingDetails.location || "");
  const [phoneNumber, setPhoneNumber] = useState(orderData.bookingDetails.phoneNumber || "");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this
          setLocation("Current location");
          setIsLoading(false);
        },
        () => {
          setLocation("Current location");
          setIsLoading(false);
        }
      );
    } else {
      setLocation("Current location");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const handleSendOTP = () => {
    if (!location || !phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }

    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    
    // Update context with booking details
    updateBookingDetails({
      location,
      phoneNumber,
      prescriptionUrl: prescriptionFile ? URL.createObjectURL(prescriptionFile) : undefined,
    });

    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl border border-border p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Booking Details</h2>
        <button
          onClick={() => setStep("none")}
          className="p-1 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Map Section */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-secondary h-48">
        <img 
          src={mapImg} 
          alt="Location map" 
          className="w-full h-full object-cover" 
        />
        <button
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? "Getting location..." : "Use current location"}
        </button>
      </div>

      {/* Location Input */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">
          Enter location <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., Hyderabad"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Phone Number Input */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-2">
          Enter Mobile Number <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          <div className="bg-input border border-border rounded-lg px-3 flex items-center text-muted-foreground text-sm font-medium">
            +91
          </div>
          <Input
            type="tel"
            placeholder="1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            maxLength={10}
          />
        </div>
      </div>

      {/* Prescription Upload (Optional) */}
      <div className="mb-6">
        <label className="block text-sm text-muted-foreground mb-2">
          Upload Prescription (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            id="prescription-upload"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="prescription-upload"
            className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/50"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {prescriptionFile ? prescriptionFile.name : "Choose file or drag here"}
            </span>
          </label>
        </div>
      </div>

      {/* Send OTP Button */}
      <Button
        onClick={handleSendOTP}
        disabled={isLoading || !location || !phoneNumber}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "SEND OTP"}
      </Button>
    </div>
  );
}

