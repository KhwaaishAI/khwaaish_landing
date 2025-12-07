import { Pill, ShoppingCart, Stethoscope, Heart, Apple } from "lucide-react";
import { cn } from "../../lib/utils";
import pharmeasyIcon from '../../assets/pharmeasy.jpg'
import blinkitIcon from '../../assets/blinkit.jpeg'
import uberIcon from '../../assets/uber.jpeg'
export interface AddOn {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const availableAddOns: AddOn[] = [
  {  id: "pharmeasy", 
    label: "Pharmeasy", 
    icon: <img src={pharmeasyIcon} alt="Pharmeasy" className="w-5 h-5 rounded-full" />  },
  {  id: "blinkit", 
    label: "Blinkit", 
    icon: <img src={blinkitIcon} alt="blinkit" className="w-5 h-5 rounded-full" />  },
  {  id: "uber", 
    label: "Uber", 
    icon: <img src={uberIcon} alt="uber" className="w-5 h-5 rounded-full" />  },
 
];

interface AddOnSelectorProps {
  isOpen: boolean;
  selectedAddOns: string[];
  onSelect: (addon: AddOn) => void;
  onClose: () => void;
}

const AddOnSelector = ({ isOpen, selectedAddOns, onSelect, onClose }: AddOnSelectorProps) => {
  if (!isOpen) return null;

  const unselectedAddOns = availableAddOns.filter(
    (addon) => !selectedAddOns.includes(addon.id)
  );

  if (unselectedAddOns.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-full left-0 mb-3 z-50",
          "bg-popover/95 backdrop-blur-xl border border-border/50",
          "rounded-2xl shadow-elevated p-2 min-w-[200px]",
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
        )}
      >
        <div className="text-xs font-medium text-muted-foreground px-3 py-2">
          Add integrations
        </div>
        <div className="space-y-1">
          {unselectedAddOns.map((addon) => (
            <button
              key={addon.id}
              onClick={() => {
                onSelect(addon);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-sm font-medium text-foreground",
                "hover:bg-accent transition-colors duration-150",
                "group"
              )}
            >
              <span className="w-8 h-8 rounded-lg bg-addon/20 text-addon flex items-center justify-center group-hover:bg-addon group-hover:text-addon-foreground transition-colors">
                {addon.icon}
              </span>
              <span>{addon.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddOnSelector;
