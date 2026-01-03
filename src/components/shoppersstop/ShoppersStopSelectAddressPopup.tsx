import PopupLoader from "../PopupLoader";
import type {
  ShoppersStopAddress,
  ShoppersStopBill,
} from "../../types/shoppersstop";

type Props = {
  open: boolean;
  addresses: ShoppersStopAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (v: string) => void;

  bill?: ShoppersStopBill | null;

  onContinue: () => void;
  onCancelBack: () => void; // back to OTP popup

  loading: boolean; // save-address loading (if needed)
};

export default function ShoppersStopSelectAddressPopup({
  open,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  bill,
  onContinue,
  onCancelBack,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-[520px] max-w-[92vw] space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Select address</h2>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <PopupLoader />
            Loading addresses...
          </div>
        ) : null}

        {bill ? (
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-300">Bill</p>
            <p className="text-sm text-white mt-1">
              Payable: {bill.total_payable}
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          {addresses.map((a) => {
            const checked = selectedAddressId === a.address_id;
            return (
              <label
                key={a.address_id}
                className={[
                  "block p-3 rounded-xl border cursor-pointer",
                  checked
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-white/5 hover:bg-white/10",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="ss-address"
                    checked={checked}
                    onChange={() => {
                      console.log(
                        "SHOPPERSSTOP address selected:",
                        a.address_id,
                        a
                      );
                      setSelectedAddressId(a.address_id);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold">
                      {a.label} ({a.address_id})
                    </p>
                    <p className="text-xs text-gray-300 mt-1">{a.address}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="space-y-2">
          <button
            onClick={onContinue}
            disabled={loading || !selectedAddressId}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Continue to payment
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
