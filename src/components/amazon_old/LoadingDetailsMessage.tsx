import PopupLoader from "../PopupLoader";

type Props = {
  show: boolean;
};

export default function LoadingDetailsMessage({ show }: Props) {
  if (!show) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-gray-900/80 text-gray-100 border-gray-800 max-w-[85%] rounded-2xl px-4 py-3 border">
        <div className="flex items-center gap-3">
          <PopupLoader />
          <span>Loading product details...</span>
        </div>
      </div>
    </div>
  );
}
