type Props = {
  open: boolean;
  sessionId: string;
  onClose: () => void;
};

export default function TataCliqSuccessPopup({
  open,
  sessionId,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-8 rounded-2xl w-96 space-y-6 border border-green-600 text-center">
        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 bg-green-500 rounded-full" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Success!</h2>
          <p className="text-gray-300 mb-4">
            Product added to cart successfully.
          </p>
          <p className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-lg inline-block">
            Session: {sessionId.slice(0, 8)}...
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
