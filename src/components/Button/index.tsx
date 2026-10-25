import type { ButtonHTMLAttributes, ReactNode } from "react";
import { StyledButton } from "./styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: ReactNode;
}

function Button({ variant = "primary", children, ...rest }: ButtonProps) {
  return (
    <StyledButton $variant={variant} {...rest}>
      {children}
    </StyledButton>
  );
}

export default Button;
