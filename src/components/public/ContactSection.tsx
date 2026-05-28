"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/validations";
import { useLocale } from "@/hooks/useLocale";

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const { t } = useLocale();

  // Fetch public CSRF token on mount
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {t("contact.name")}
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="w-full bg-transparent border-0 border-b border-border focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors"
              placeholder={t("contact.namePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {t("contact.email")}
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full bg-transparent border-0 border-b border-border focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors"
              placeholder={t("contact.emailPlaceholder")}
            />
            {errors.email && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {t("contact.subject")}
            </label>
            <input
              {...register("subject")}
              type="text"
              id="subject"
              className="w-full bg-transparent border-0 border-b border-border focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors"
              placeholder={t("contact.subjectPlaceholder")}
            />
            {errors.subject && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {t("contact.message")}
            </label>
            <textarea
              {...register("message")}
              id="message"
              rows={5}
              className="w-full bg-transparent border-0 border-b border-border focus:border-primary font-mono text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-2 md:py-3 outline-none rounded-none transition-colors resize-none"
              placeholder={t("contact.messagePlaceholder")}
            />
            {errors.message && (
              <p className="mt-1 font-mono text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 transition-opacity w-full sm:w-fit px-10 py-3"
          >
            {isSubmitting ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
      </div>
    </section>
  );
}
