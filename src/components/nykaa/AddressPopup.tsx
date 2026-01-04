import PopupLoader from "../PopupLoader";
import type { NykaaAddress } from "../../types/nykaa";

type Props = {
  open: boolean;
  address: NykaaAddress;
  setAddress: React.Dispatch<React.SetStateAction<NykaaAddress>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function AddressPopup({
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
            placeholder="Full Name"
            value={address.name}
            onChange={(e) => {
              setAddress((prev) => ({ ...prev, name: e.target.value }));
              console.log("ADDRESS: name changed =", e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={address.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 10);
              setAddress((prev) => ({ ...prev, phone: v }));
              console.log("ADDRESS: phone changed =", v);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={address.email}
            onChange={(e) => {
              setAddress((prev) => ({ ...prev, email: e.target.value }));
              console.log("ADDRESS: email changed =", e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setAddress((prev) => ({ ...prev, pincode: v }));
              console.log("ADDRESS: pincode changed =", v);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="House No, Building"
            value={address.house}
            onChange={(e) => {
              setAddress((prev) => ({ ...prev, house: e.target.value }));
              console.log("ADDRESS: house changed =", e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />

          <input
            type="text"
            placeholder="Area, Street"
            value={address.area}
            onChange={(e) => {
              setAddress((prev) => ({ ...prev, area: e.target.value }));
              console.log("ADDRESS: area changed =", e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={onSave}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : "Save Address & Continue"}
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
