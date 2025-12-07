import { createContext, useContext, useState, ReactNode } from "react";

export type FlowStep = 
  | "none" 
  | "booking" 
  | "otp" 
  | "products" 
  | "order" 
  | "address" 
  | "payment" 
  | "complete";

export interface BookingDetails {
  location?: string;
  phoneNumber?: string;
  prescriptionUrl?: string;
}

export interface OrderData {
  bookingDetails: BookingDetails;
  selectedProducts: Array<{
    id: string;
    quantity: number;
  }>;
  address?: {
    houseNumber: string;
    streetName: string;
    area: string;
    state: string;
    recipientName: string;
  };
  paymentMethod?: string;
  totalAmount?: number;
}

interface PharmEasyFlowContextType {
  isActive: boolean;
  currentStep: FlowStep;
  orderData: OrderData;
  setActive: (active: boolean) => void;
  setStep: (step: FlowStep) => void;
  updateBookingDetails: (details: Partial<BookingDetails>) => void;
  updateSelectedProducts: (products: OrderData["selectedProducts"]) => void;
  updateAddress: (address: OrderData["address"]) => void;
  updatePayment: (method: string, amount: number) => void;
  reset: () => void;
}

const PharmEasyFlowContext = createContext<PharmEasyFlowContextType | undefined>(undefined);

export function PharmEasyFlowProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("none");
  const [orderData, setOrderData] = useState<OrderData>({
    bookingDetails: {},
    selectedProducts: [],
  });

  const updateBookingDetails = (details: Partial<BookingDetails>) => {
    setOrderData((prev) => ({
      ...prev,
      bookingDetails: { ...prev.bookingDetails, ...details },
    }));
  };

  const updateSelectedProducts = (products: OrderData["selectedProducts"]) => {
    setOrderData((prev) => ({ ...prev, selectedProducts: products }));
  };

  const updateAddress = (address: OrderData["address"]) => {
    setOrderData((prev) => ({ ...prev, address }));
  };

  const updatePayment = (method: string, amount: number) => {
    setOrderData((prev) => ({
      ...prev,
      paymentMethod: method,
      totalAmount: amount,
    }));
  };

  const reset = () => {
    setIsActive(false);
    setCurrentStep("none");
    setOrderData({
      bookingDetails: {},
      selectedProducts: [],
    });
  };

  return (
    <PharmEasyFlowContext.Provider
      value={{
        isActive,
        currentStep,
        orderData,
        setActive: setIsActive,
        setStep: setCurrentStep,
        updateBookingDetails,
        updateSelectedProducts,
        updateAddress,
        updatePayment,
        reset,
      }}
    >
      {children}
    </PharmEasyFlowContext.Provider>
  );
}

export function usePharmEasyFlow() {
  const context = useContext(PharmEasyFlowContext);
  if (context === undefined) {
    throw new Error("usePharmEasyFlow must be used within a PharmEasyFlowProvider");
  }
  return context;
}

