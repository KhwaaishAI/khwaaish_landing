import PopupLoader from "../PopupLoader";
import type { WestsideAddress } from "../../types/westside";

type Props = {
  open: boolean;
  address: WestsideAddress;
  setAddress: React.Dispatch<React.SetStateAction<WestsideAddress>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function WestsideAddressPopup({
  open,
  address,
  setAddress,
  onSave,
  onClose,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Shipping Address</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Address ID (optional if you have it)"
            value={address.address_id}
            onChange={(e) => {
              console.log("WESTSIDE ADDRESS address_id", e.target.value);
              setAddress((prev) => ({ ...prev, address_id: e.target.value }));
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First name"
              value={address.first_name}
              onChange={(e) => {
                console.log("WESTSIDE ADDRESS first_name", e.target.value);
                setAddress((prev) => ({ ...prev, first_name: e.target.value }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <input
              type="text"
              placeholder="Last name"
              value={address.last_name}
              onChange={(e) => {
                console.log("WESTSIDE ADDRESS last_name", e.target.value);
                setAddress((prev) => ({ ...prev, last_name: e.target.value }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
          </div>

          <input
            type="text"
            placeholder="Address line 1"
            value={address.address1}
            onChange={(e) => {
              console.log("WESTSIDE ADDRESS address1", e.target.value);
              setAddress((prev) => ({ ...prev, address1: e.target.value }));
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Address line 2 (optional)"
            value={address.address2}
            onChange={(e) => {
              console.log("WESTSIDE ADDRESS address2", e.target.value);
              setAddress((prev) => ({ ...prev, address2: e.target.value }));
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => {
                console.log("WESTSIDE ADDRESS city", e.target.value);
                setAddress((prev) => ({ ...prev, city: e.target.value }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <input
              type="text"
              placeholder="State code (e.g. MH)"
              value={address.state_code}
              onChange={(e) => {
                console.log("WESTSIDE ADDRESS state_code", e.target.value);
                setAddress((prev) => ({
                  ...prev,
                  state_code: e.target.value.toUpperCase(),
                }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Pincode"
              value={address.pincode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                console.log("WESTSIDE ADDRESS pincode", v);
                setAddress((prev) => ({ ...prev, pincode: v }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={address.phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                console.log("WESTSIDE ADDRESS phone", v);
                setAddress((prev) => ({ ...prev, phone: v }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onSave}
            disabled={loading}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Save Address
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
