import React from "react";
import PopupLoader from "../PopupLoader";

type AddressForm = {
  full_name: string;
  mobile_number: string;
  pincode: string;
  house_no: string;
  area: string;
  landmark: string;
};

type Props = {
  open: boolean;
  address: AddressForm;
  setAddress: React.Dispatch<React.SetStateAction<AddressForm>>;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
};

export default function AmazonAddressPopup({
  open,
  address,
  setAddress,
  onSave,
  onCancel,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-[92vw] max-w-md space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">
          Add shipping address
        </h2>
        <p className="text-sm text-gray-400">
          No saved address found. Please enter your address.
        </p>

        <div className="space-y-3">
          <input
            value={address.full_name}
            onChange={(e) =>
              setAddress((p) => ({ ...p, full_name: e.target.value }))
            }
            placeholder="Full name"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            value={address.mobile_number}
            onChange={(e) =>
              setAddress((p) => ({
                ...p,
                mobile_number: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            placeholder="Mobile number"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            value={address.pincode}
            onChange={(e) =>
              setAddress((p) => ({
                ...p,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              }))
            }
            placeholder="Pincode"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            value={address.house_no}
            onChange={(e) =>
              setAddress((p) => ({ ...p, house_no: e.target.value }))
            }
            placeholder="House no / Building"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            value={address.area}
            onChange={(e) =>
              setAddress((p) => ({ ...p, area: e.target.value }))
            }
            placeholder="Area / Street"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            value={address.landmark}
            onChange={(e) =>
              setAddress((p) => ({ ...p, landmark: e.target.value }))
            }
            placeholder="Landmark (optional)"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
