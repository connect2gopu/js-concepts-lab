// Lightweight cn utility - joins class names, filtering out falsy values
export function cn(
  ...inputs: (string | boolean | null | undefined)[]
): string {
  return inputs.filter(Boolean).join(" ");
}
