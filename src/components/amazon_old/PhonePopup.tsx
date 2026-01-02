import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;
  phone: string;
  setPhone: (v: string) => void;
  onContinue: () => void;
  loadingPhone: boolean;
};

export default function PhonePopup({
  open,
  phone,
  setPhone,
  onContinue,
  loadingPhone,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-80 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Enter Phone Number</h2>
        <p className="text-sm text-gray-400">
          We need your phone number to login to Amazon
        </p>

        <input
          type="tel"
          placeholder="10-digit Mobile Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
        />

        <button
          onClick={onContinue}
          disabled={loadingPhone}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingPhone ? <PopupLoader /> : "Continue"}
        </button>
      </div>
    </div>
  );
}
