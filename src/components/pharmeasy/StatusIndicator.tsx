import { Check, Star } from "lucide-react";

interface StatusIndicatorProps {
  type: "loading" | "success" | "waiting";
  text: string;
  linkText?: string;
  linkHref?: string;
}

const StatusIndicator = ({ type, text, linkText, linkHref }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {type === "loading" && (
        <Star className="h-4 w-4 text-accent fill-accent animate-pulse-subtle" />
      )}
      {type === "success" && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
          <Check className="h-3.5 w-3.5 text-success" />
        </div>
      )}
      {type === "waiting" && (
        <Star className="h-4 w-4 text-accent fill-accent" />
      )}
      <span className={`text-sm ${type === "success" ? "text-success" : "text-muted-foreground"}`}>
        {text}
      </span>
      {linkText && linkHref && (
        <a
          href={linkHref}
          className="text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {linkText}
        </a>
      )}
    </div>
  );
};

export default StatusIndicator;
