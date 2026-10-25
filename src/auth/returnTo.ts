export function returnTo(value: string | null): string {
  // Aceita apenas destinos da área privada, inclusive ao abrir um link recebido.
  if (!value || !/^\/app(?:[/?#]|$)/.test(value) || /[\\\r\n]/.test(value)) return '/app';
  return value;
}
