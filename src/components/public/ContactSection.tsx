"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/validations";
import { useLocale } from "@/hooks/useLocale";
import { GitBranch, Link, Mail } from "lucide-react";

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [csrfError, setCsrfError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch("/api/contact");
        const data = await response.json();
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        setCsrfError(true);
      }
    };
    fetchCSRFToken();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t("contact.success"));
        reset();
        setSubmitted(true);
      } else {
        toast.error(t("contact.error"));
      }
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border">
      <div className="max-w-lg md:max-w-2xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// CONTACT"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.contact")}
        </h2>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <a
            href="https://github.com/patsarun2545"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors border border-border px-4 py-2 rounded-sm"
            aria-label="GitHub profile (opens in new tab)"
          >
            <GitBranch className="w-4 h-4" aria-hidden="true" />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/patsarun-kathinthong/?skipRedirect=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors border border-border px-4 py-2 rounded-sm"
            aria-label="LinkedIn profile (opens in new tab)"
          >
            <Link className="w-4 h-4" aria-hidden="true" />
            LinkedIn
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&to=patsarun2545@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors border border-border px-4 py-2 rounded-sm"
            aria-label="Send email via Gmail (opens in new tab)"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Email
          </a>
        </div>

        {csrfError && (
          <p className="font-mono text-xs text-destructive mb-4 text-center">
            {t("contact.formLoadError")}
          </p>
        )}

        {submitted ? (
          <div className="border border-primary/30 p-8 text-center bg-primary/5">
            <p className="font-mono text-sm text-primary mb-2">{t("contact.sentSuccessfully")}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("contact.success")}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              {t("contact.sendAgain")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 p-6 sm:p-8 bg-card/80 backdrop-blur-sm">
          <div>
            <label htmlFor="name" className="block font-mono text-xs text-foreground uppercase tracking-widest mb-2">
              {t("contact.name")}
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 border-b border-border/70 focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors disabled:opacity-50"
              placeholder={t("contact.namePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block font-mono text-xs text-foreground uppercase tracking-widest mb-2">
              {t("contact.email")}
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 border-b border-border/70 focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors disabled:opacity-50"
              placeholder={t("contact.emailPlaceholder")}
            />
            {errors.email && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block font-mono text-xs text-foreground uppercase tracking-widest mb-2">
              {t("contact.subject")}
            </label>
            <input
              {...register("subject")}
              type="text"
              id="subject"
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 border-b border-border/70 focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors disabled:opacity-50"
              placeholder={t("contact.subjectPlaceholder")}
            />
            {errors.subject && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block font-mono text-xs text-foreground uppercase tracking-widest mb-2">
              {t("contact.message")}
            </label>
            <textarea
              {...register("message")}
              id="message"
              rows={5}
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 border-b border-border/70 focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors resize-none disabled:opacity-50"
              placeholder={t("contact.messagePlaceholder")}
            />
            {errors.message && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all w-full sm:w-fit px-10 py-3 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3 h-3 rounded-full border border-primary-foreground/30 border-t-primary-foreground animate-spin shrink-0" />
            )}
            {isSubmitting ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
        )}
      </div>
    </section>
  );
}