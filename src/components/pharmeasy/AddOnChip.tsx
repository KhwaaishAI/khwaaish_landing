import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface AddOnChipProps {
  icon: React.ReactNode;
  label: string;
  onRemove: () => void;
  className?: string;
}

const AddOnChip = ({ icon, label, onRemove, className }: AddOnChipProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-addon text-addon-foreground",
        "text-sm font-medium",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-addon-foreground/20 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default AddOnChip;
