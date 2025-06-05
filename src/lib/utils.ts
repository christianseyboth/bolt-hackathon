import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
