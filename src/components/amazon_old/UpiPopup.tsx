import type { Product } from "../../types/amazon_old";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  pendingProduct: Product | null;
  upiId: string;
  setUpiId: (v: string) => void;
  onPay: () => void;
  loadingPayment: boolean;
};

export default function UpiPopup({
  open,
  pendingProduct,
  upiId,
  setUpiId,
  onPay,
  loadingPayment,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
        <p className="text-sm text-gray-400">
          Enter your UPI ID to pay {pendingProduct?.price}
        </p>

        <input
          type="text"
          placeholder="UPI ID (e.g., name@upi)"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <button
          onClick={onPay}
          disabled={loadingPayment}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingPayment ? <PopupLoader /> : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
