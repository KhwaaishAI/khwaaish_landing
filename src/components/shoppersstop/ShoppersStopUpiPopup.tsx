import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  upiId: string;
  setUpiId: (v: string) => void;

  onPay: () => void;
  onCancelBack: () => void; // back to address popup (select/add)
  loading: boolean;
};

export default function ShoppersStopUpiPopup({
  open,
  upiId,
  setUpiId,
  onPay,
  onCancelBack,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Payment (UPI)</h2>

        <input
          type="text"
          placeholder="UPI ID"
          value={upiId}
          onChange={(e) => {
            console.log("SHOPPERSSTOP UPI changed:", e.target.value);
            setUpiId(e.target.value);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <div className="space-y-2">
          <button
            onClick={onPay}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Pay now
          </button>

          <button
            onClick={onCancelBack}
            disabled={loading}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
