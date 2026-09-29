"use client";

import { useEffect, useRef } from "react";

const SITEKEY = "0x4AAAAAAFI31bbZvPagKLUR";
const WORKER_URL = "https://turnstile-siteverify-mkapu.solvegrades.workers.dev";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  getResponse: (id?: string) => string | undefined;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let widgetId: string | null = null;

function loadTurnstileScript() {
  if (typeof window === "undefined") return;
  if (document.getElementById("cf-turnstile-script")) return;

  const script = document.createElement("script");
  script.id = "cf-turnstile-script";
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  document.head.appendChild(script);
}

export default function TurnstileField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTurnstileScript();

    const timer = window.setInterval(() => {
      if (!containerRef.current || widgetId !== null) {
        if (widgetId !== null) window.clearInterval(timer);
        return;
      }
      if (!window.turnstile) return;

      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITEKEY,
        action: "turnstile-spin-v1",
      });
      window.clearInterval(timer);
    }, 150);

    return () => window.clearInterval(timer);
  }, []);

  return <div ref={containerRef} className="cf-turnstile my-4" />;
}

export async function verifyTurnstile(): Promise<boolean> {
  if (typeof window === "undefined" || !window.turnstile || widgetId === null) {
    return false;
  }

  const token = window.turnstile.getResponse(widgetId);
  if (!token) return false;

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data: unknown = await res.json();
    const success =
      !!data && typeof data === "object" && "success" in data
        ? (data as { success?: boolean }).success === true
        : false;
    return success;
  } catch {
    return false;
  } finally {
    try {
      if (widgetId !== null) window.turnstile.reset(widgetId);
    } catch {
      // el widget se reintenta en el próximo envío
    }
  }
}
