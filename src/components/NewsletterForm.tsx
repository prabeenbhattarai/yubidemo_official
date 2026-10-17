"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { subscribeNewsletter } from "@/app/(site)/newsletter-action";
import { toast } from "@/lib/toast";
import { ArrowRight } from "./Icons";

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      formRef.current?.reset();
      toast(
        state.already
          ? { kind: "info", title: "You're already subscribed", message: "This email is already on our list — thanks!" }
          : { title: "You're subscribed!", message: "Thanks for signing up. We'll keep you posted on news and projects." }
      );
    } else {
      toast({ kind: "error", title: "Couldn't subscribe", message: state.error });
    }
  }, [state]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("page", window.location.pathname);
    startTransition(() => action(fd));
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-5 flex">
      {/* Bot trap: hidden from people, so only bots fill it in. */}
      <input type="text" name="nl_ref" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px" />
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email"
        disabled={pending}
        className="w-full bg-white px-4 py-3 text-[14px] text-ink outline-none disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={pending}
        aria-label={pending ? "Subscribing…" : "Subscribe"}
        className="flex w-12 shrink-0 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark disabled:cursor-wait"
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}
