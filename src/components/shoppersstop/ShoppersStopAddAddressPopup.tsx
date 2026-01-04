import PopupLoader from "../PopupLoader";

type AddAddress = {
  name: string;
  mobile: string;
  pincode: string;
  address: string;
  type: string;
};

type Props = {
  open: boolean;
  addAddress: AddAddress;
  setAddAddress: React.Dispatch<React.SetStateAction<AddAddress>>;

  onSubmit: () => void;
  onCancelBack: () => void; // back to OTP popup
  loading: boolean;
};

export default function ShoppersStopAddAddressPopup({
  open,
  addAddress,
  setAddAddress,
  onSubmit,
  onCancelBack,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">Add address</h2>

        <input
          type="text"
          placeholder="Name"
          value={addAddress.name}
          onChange={(e) => {
            console.log("SHOPPERSSTOP ADD-ADDRESS name:", e.target.value);
            setAddAddress((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <input
          type="tel"
          placeholder="Mobile"
          value={addAddress.mobile}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
            console.log("SHOPPERSSTOP ADD-ADDRESS mobile:", v);
            setAddAddress((prev) => ({ ...prev, mobile: v }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Pincode"
          value={addAddress.pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            console.log("SHOPPERSSTOP ADD-ADDRESS pincode:", v);
            setAddAddress((prev) => ({ ...prev, pincode: v }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <textarea
          placeholder="Address"
          value={addAddress.address}
          onChange={(e) => {
            console.log("SHOPPERSSTOP ADD-ADDRESS address:", e.target.value);
            setAddAddress((prev) => ({ ...prev, address: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none min-h-[90px]"
          disabled={loading}
        />

        <select
          value={addAddress.type}
          onChange={(e) => {
            console.log("SHOPPERSSTOP ADD-ADDRESS type:", e.target.value);
            setAddAddress((prev) => ({ ...prev, type: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
        </select>

        <div className="space-y-2">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Save address
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
