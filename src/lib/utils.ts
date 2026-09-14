import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3" → "03". Usado nos contadores de secção. */
export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}
