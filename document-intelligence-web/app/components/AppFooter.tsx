"use client";

type Props = {
  /** Use compact layout for sidebars; full for auth pages */
  variant?: "full" | "compact";
};

export function AppFooter({ variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <p className="mt-3 border-t border-zinc-800/40 pt-3 text-center text-[10px] leading-relaxed text-zinc-600">
        © {new Date().getFullYear()} Doc Intelligence
        <br />
        <span className="text-zinc-500">Made by Asjiad Farooq</span>
      </p>
    );
  }

  return (
    <footer className="mt-10 flex flex-col items-center gap-0.5 pt-6 text-center">
      <div className="h-px w-8 rounded-full bg-zinc-700/50" />
      <p className="text-[11px] font-medium tracking-wide text-zinc-500">
        © {new Date().getFullYear()} Document Intelligence
      </p>
      <p className="text-[11px] text-zinc-600">Made by Asjiad Farooq</p>
    </footer>
  );
}
