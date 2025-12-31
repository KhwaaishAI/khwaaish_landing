import type { Address } from "../../types/amazon";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  address: Address;
  setAddress: (a: Address) => void;
  onSave: () => void;
  loadingBuy: boolean;
};

export default function AddressPopup({
  open,
  address,
  setAddress,
  onSave,
  loadingBuy,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Shipping Address</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={address.full_name}
            onChange={(e) =>
              setAddress({ ...address, full_name: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={address.mobile_number}
            onChange={(e) =>
              setAddress({
                ...address,
                mobile_number: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) =>
              setAddress({
                ...address,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="House No, Building"
            value={address.house_no}
            onChange={(e) =>
              setAddress({ ...address, house_no: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="Area, Street"
            value={address.area}
            onChange={(e) => setAddress({ ...address, area: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="Landmark (Optional)"
            value={address.landmark}
            onChange={(e) =>
              setAddress({ ...address, landmark: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
        </div>

        <button
          onClick={onSave}
          disabled={loadingBuy}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingBuy ? <PopupLoader /> : "Save Address & Continue"}
        </button>
      </div>
    </div>
  );
}
