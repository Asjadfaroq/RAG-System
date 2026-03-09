import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SourceChunkCard } from "./SourceChunkCard";

type Role = "user" | "assistant";

type SourceLike = {
  id: string;
  fileName: string;
  language?: string | null;
  status?: number | null;
  storagePath?: string;
};

export function ChatMessageBubble({
  role,
  content,
  createdAt,
  sources,
  locale = "en",
  rtl = false,
  streaming = false,
  actions,
}: {
  role: Role;
  content: string;
  createdAt: string | Date;
  sources?: SourceLike[];
  locale?: "en" | "ar";
  rtl?: boolean;
  streaming?: boolean;
  actions?: React.ReactNode;
}) {
  const isUser = role === "user";
  const date = new Date(createdAt);
  const timeStr = date.toLocaleTimeString(
    locale === "ar" ? "ar-EG" : "en-US",
    { hour: "2-digit", minute: "2-digit" },
  );

  const alignment =
    isUser && !rtl
      ? "justify-end"
      : isUser && rtl
      ? "justify-start"
      : !isUser && !rtl
      ? "justify-start"
      : "justify-end";

  const [displayedContent, setDisplayedContent] = useState(
    streaming ? "" : content,
  );

  useEffect(() => {
    if (!streaming) {
      setDisplayedContent(content);
      return;
    }

    setDisplayedContent("");
    const words = content.split(" ");
    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedContent(words.slice(0, index).join(" "));
      if (index >= words.length) {
        window.clearInterval(interval);
      }
    }, 25);

    return () => window.clearInterval(interval);
  }, [content, streaming]);

  return (
    <div className={`flex ${alignment}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm backdrop-blur-md ${
          isUser
            ? "bg-sky-600/90 text-white shadow-sky-900/40"
            : "bg-zinc-900/80 text-zinc-50 border border-zinc-700/80 shadow-black/40"
        } ${rtl ? "text-right" : "text-left"}`}
      >
        <div className="mb-1 flex items-center justify-between gap-2 text-[11px] opacity-75">
          <span className="font-medium">
            {isUser
              ? locale === "ar"
                ? "أنت"
                : "You"
              : locale === "ar"
              ? "المساعد"
              : "Assistant"}
          </span>
          <span>{timeStr}</span>
        </div>
        <div className="whitespace-pre-wrap text-[13px] leading-relaxed">
          {displayedContent}
          {streaming && (
            <span className="ml-1 inline-flex items-center">
              <span className="mx-0.5 h-1 w-1 animate-pulse rounded-full bg-zinc-300" />
              <span className="mx-0.5 h-1 w-1 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
              <span className="mx-0.5 h-1 w-1 animate-pulse rounded-full bg-zinc-500 [animation-delay:240ms]" />
            </span>
          )}
        </div>
        {!isUser && sources && sources.length > 0 && (
          <ExpandableSources sources={sources} locale={locale} rtl={rtl} />
        )}
        {actions && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-zinc-700/60 pt-1.5 text-[11px] text-zinc-400">
            {actions}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ExpandableSources({
  sources,
  locale,
  rtl,
}: {
  sources: SourceLike[];
  locale: "en" | "ar";
  rtl: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-md bg-zinc-900/60 px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-800/80 ${
          rtl ? "text-right" : "text-left"
        }`}
      >
        <span>
          {locale === "ar" ? "المصادر" : "Sources"} • {sources.length}
        </span>
        <span className="text-[10px] text-zinc-500">
          {open
            ? locale === "ar"
              ? "إخفاء"
              : "Hide"
            : locale === "ar"
            ? "عرض"
            : "Show"}
        </span>
      </button>
      {open && (
        <div className="space-y-1.5">
          {sources.map((s) => (
            <SourceChunkCard
              key={s.id}
              source={s}
              locale={locale}
              rtl={rtl}
            />
          ))}
        </div>
      )}
    </div>
  );
}

