/** Compartilha a apresentação dos botões da interface. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { StyledButton } from "./styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: ReactNode;
}

/** Compartilha a apresentação dos botões da interface. Retorna o conteúdo da página ou componente. */
function Button({ variant = "primary", children, ...rest }: ButtonProps) {
  return (
    <StyledButton $variant={variant} {...rest}>
      {children}
    </StyledButton>
  );
}

export default Button;
