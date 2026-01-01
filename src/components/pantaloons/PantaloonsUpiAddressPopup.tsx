import React from "react";
import PopupLoader from "../PopupLoader";

export type PantaloonsAddressUI = {
  fname: string;
  phone: string;
  pincode: string;
  building: string;
  street: string;
  area: string;
  landmark: string;
};

type Props = {
  open: boolean;
  upiId: string;
  setUpiId: React.Dispatch<React.SetStateAction<string>>;
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  address: PantaloonsAddressUI;
  setAddress: React.Dispatch<React.SetStateAction<PantaloonsAddressUI>>;
  onRun: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function PantaloonsUpiAddressPopup({
  open,
  upiId,
  setUpiId,
  couponCode,
  setCouponCode,
  address,
  setAddress,
  onRun,
  onClose,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Delivery & Payment</h2>

        <input
          type="text"
          placeholder="UPI ID (e.g. name@bank)"
          value={upiId}
          onChange={(e) => {
            console.log("PANTALOONS UPI changed:", e.target.value);
            setUpiId(e.target.value);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => {
            console.log("PANTALOONS COUPON changed:", e.target.value);
            setCouponCode(e.target.value);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <div className="space-y-2">
          <p className="text-sm text-white/80 font-semibold">Address</p>

          <input
            type="text"
            placeholder="Full name"
            value={address.fname}
            onChange={(e) =>
              setAddress((p) => ({ ...p, fname: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="tel"
            placeholder="Phone"
            value={address.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 10);
              setAddress((p) => ({ ...p, phone: v }));
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setAddress((p) => ({ ...p, pincode: v }));
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Building / House"
            value={address.building}
            onChange={(e) =>
              setAddress((p) => ({ ...p, building: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Street (optional)"
            value={address.street}
            onChange={(e) =>
              setAddress((p) => ({ ...p, street: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Area (optional)"
            value={address.area}
            onChange={(e) =>
              setAddress((p) => ({ ...p, area: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Landmark (optional)"
            value={address.landmark}
            onChange={(e) =>
              setAddress((p) => ({ ...p, landmark: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={onRun}
            disabled={loading}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Place order
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold border border-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
