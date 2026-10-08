import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "super" | "locked";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "font-bold uppercase tracking-wider text-sm py-3 px-6 rounded-2xl transition-all duration-75 select-none active:translate-y-[2px]";

  const variants = {
    primary:
      "bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#61e002] active:border-b-0",
    secondary:
      "bg-white text-[#4b4b4b] border-2 border-[#e5e5e5] border-b-4 hover:bg-[#f7f7f7] active:border-b-2",
    danger:
      "bg-[#ff4b4b] text-white border-b-4 border-[#ea2b2b] hover:bg-[#ff5a5a] active:border-b-0",
    super:
      "bg-[#1cb0f6] text-white border-b-4 border-[#1899d6] hover:bg-[#20bdff] active:border-b-0",
    locked:
      "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#cecece] cursor-not-allowed active:translate-y-0",
  };

  const selectedVariant = disabled ? variants.locked : variants[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};