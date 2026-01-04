import PopupLoader from "../PopupLoader";

type Signup = {
  name: string;
  email: string;
  gender: string;
};

type Props = {
  open: boolean;
  signup: Signup;
  setSignup: React.Dispatch<React.SetStateAction<Signup>>;

  onSubmit: () => void;
  onCancelBack: () => void; // back to OTP popup
  loading: boolean;
};

export default function ShoppersStopSignupPopup({
  open,
  signup,
  setSignup,
  onSubmit,
  onCancelBack,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">Signup required</h2>

        <input
          type="text"
          placeholder="Full name"
          value={signup.name}
          onChange={(e) => {
            console.log("SHOPPERSSTOP SIGNUP name:", e.target.value);
            setSignup((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Email"
          value={signup.email}
          onChange={(e) => {
            console.log("SHOPPERSSTOP SIGNUP email:", e.target.value);
            setSignup((prev) => ({ ...prev, email: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        />

        <select
          value={signup.gender}
          onChange={(e) => {
            console.log("SHOPPERSSTOP SIGNUP gender:", e.target.value);
            setSignup((prev) => ({ ...prev, gender: e.target.value }));
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          disabled={loading}
        >
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <div className="space-y-2">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Complete signup
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
