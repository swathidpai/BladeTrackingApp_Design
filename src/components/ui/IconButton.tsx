import { ButtonHTMLAttributes, forwardRef } from "react";
import { Tooltip } from "./Tooltip";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tip?: string;
  tipSide?: "top" | "bottom" | "right";
  size?: number;
  bordered?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { tip, tipSide = "top", size = 28, bordered = true, className = "", children, ...rest },
  ref,
) {
  const btn = (
    <button
      ref={ref}
      type="button"
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] transition-colors ${
        bordered ? "border border-border-default" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
  return tip ? (
    <Tooltip label={tip} side={tipSide}>
      {btn}
    </Tooltip>
  ) : (
    btn
  );
});
