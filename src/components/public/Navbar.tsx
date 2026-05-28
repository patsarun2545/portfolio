"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLocale } from "@/hooks/useLocale";

const navItems = [
  { key: "about", href: "#about" },
  { key: "skills", href: "#skills" },
  { key: "projects", href: "#projects" },
  { key: "experience", href: "#experience" },
  { key: "education", href: "#education" },
  { key: "blog", href: "#blog" },
  { key: "contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Determine active section based on scroll position
      const sections = navItems.map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/90 backdrop-blur-sm border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="shrink-0 mr-8">
            <a
              href="#"
              className="font-mono md:text-sm lg:text-base text-foreground"
            >
              [ Portfolio ]
            </a>
          </div>

          <div className="hidden md:flex items-center md:space-x-4 lg:space-x-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <span key={item.key} className="relative group">
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={`font-mono text-sm uppercase md:tracking-wider tracking-widest transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                    aria-label={`Navigate to ${t(`nav.${item.key}`)}`}
                  >
                    {t(`nav.${item.key}`)}
                  </button>
                  <span className={`absolute -bottom-px left-0 right-0 h-px bg-primary transition-transform duration-200 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} />
                </span>
              );
            })}
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-3 sm:py-4 space-y-1 sm:space-y-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className={`block w-full text-left px-3 sm:px-4 py-3 font-mono text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  {isActive ? "→ " : "  "}{t(`nav.${item.key}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
