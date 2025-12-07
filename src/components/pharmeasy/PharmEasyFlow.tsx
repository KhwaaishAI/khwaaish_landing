import { usePharmEasyFlow, type FlowStep } from "./PharmEasyFlowContext";
import { BookingDetails } from "./BookingDetails";
import OTPAuthModal from "./OTPAuthModal";
import ProductList from "./ProductList";
import OrderBooking from "./OrderBooking";
import { ConfirmAddressModal } from "./ConfirmAddressModal";
import { PaymentModal } from "./PaymentModal";
import { demoProducts } from "@/data/products";

export function PharmEasyFlow() {
  const { isActive, currentStep, setStep, orderData, updatePayment, reset } = usePharmEasyFlow();

  if (!isActive) return null;

  const handleOTPConfirm = (otp: string) => {
    // In a real app, verify OTP here
    console.log("OTP verified:", otp);
    setStep("products");
  };

  const handleOTPClose = () => {
    setStep("booking");
  };

  const handleProductsNext = () => {
    setStep("order");
  };

  const handleOrderConfirm = () => {
    setStep("address");
  };

  const handleAddressConfirm = () => {
    // Calculate total amount from selected products
    const total = orderData.selectedProducts.reduce((sum, item) => {
      const product = demoProducts.find(p => p.id === item.id);
      if (product) {
        return sum + (product.currentPrice * item.quantity);
      }
      return sum;
    }, 0);
    updatePayment("upi", total);
    setStep("payment");
  };

  const handlePaymentComplete = () => {
    setStep("complete");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "booking":
        return (
          <div className="flex items-center justify-center min-h-[60vh] p-6">
            <BookingDetails />
          </div>
        );
      
      case "otp":
        return (
          <OTPAuthModal
            open={true}
            onOpenChange={(open) => {
              if (!open) handleOTPClose();
            }}
            onConfirm={handleOTPConfirm}
            onChangeMobile={() => setStep("booking")}
            title="OTP Verification"
            subtitle={`Enter the 4-digit OTP sent to ${orderData.bookingDetails.phoneNumber}`}
            digits={4}
          />
        );
      
      case "products":
        return (
          <div className="p-6">
            <ProductList />
            {orderData.selectedProducts.length > 0 && (
              <div className="max-w-5xl mx-auto mt-6 flex justify-end">
                <button
                  onClick={handleProductsNext}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-colors"
                >
                  Continue to Order ({orderData.selectedProducts.length} {orderData.selectedProducts.length === 1 ? 'item' : 'items'})
                </button>
              </div>
            )}
          </div>
        );
      
      case "order":
        return (
          <div className="p-6">
            <OrderBooking />
            {orderData.selectedProducts.length > 0 && (
              <div className="max-w-2xl mx-auto mt-6 flex justify-end">
                <button
                  onClick={handleOrderConfirm}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-colors"
                >
                  Proceed to Address
                </button>
              </div>
            )}
          </div>
        );
      
      case "address":
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <ConfirmAddressModal />
          </div>
        );
      
      case "payment":
        const totalAmount = orderData.totalAmount || orderData.selectedProducts.reduce((sum, item) => {
          const product = demoProducts.find(p => p.id === item.id);
          return sum + (product ? product.currentPrice * item.quantity : 0);
        }, 0);
        return (
          <PaymentModal
            amount={totalAmount}
            isOpen={true}
            onClose={() => {
              handlePaymentComplete();
            }}
          />
        );
      
      case "complete":
        return (
          <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your order has been confirmed and will be delivered soon.
              </p>
              <button
                onClick={() => {
                  reset();
                }}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background/95 backdrop-blur-sm">
      {renderStep()}
    </div>
  );
}

