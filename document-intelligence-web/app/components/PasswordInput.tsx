"use client";

import { useState } from "react";

const eyeOpen = (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
);
const eyeSlash = (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.5 4.5a9.968 9.968 0 012.938-2.064m0 0a10.05 10.05 0 0112.124 12.124" />
);
const lockIcon = (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
);

type PasswordInputProps = React.ComponentPropsWithoutRef<"input"> & {
  showLockIcon?: boolean;
  inputClassName?: string;
  iconClassName?: string;
};

export default function PasswordInput({
  showLockIcon = true,
  inputClassName,
  iconClassName = "absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500",
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const baseInput =
    "w-full rounded-xl border border-zinc-600/80 bg-zinc-800/40 pl-10 pr-12 py-3 text-zinc-100 placeholder-zinc-500 transition-all duration-200 focus:border-indigo-500/60 focus:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
  const compactInput =
    "w-full rounded-xl border border-zinc-700/50 bg-zinc-900/50 pl-3 pr-11 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30";
  const cls = inputClassName ?? (showLockIcon ? baseInput : compactInput);

  return (
    <div className={className ?? "relative"}>
      {showLockIcon && (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {lockIcon}
        </svg>
      )}
      <input
        type={visible ? "text" : "password"}
        className={cls}
        autoComplete={props.autoComplete ?? "current-password"}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0 focus:ring-offset-transparent rounded"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {visible ? eyeSlash : eyeOpen}
        </svg>
      </button>
    </div>
  );
}
