"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Play,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { concepts } from "@/lib/concepts-data";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conceptsOpen, setConceptsOpen] = useState(true);

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-500">
          <span className="text-sm font-bold text-white">JS</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            Concept Lab
          </h1>
          <p className="text-[11px] text-muted-foreground">JS/TS Playground</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Home link */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-accent-light text-accent"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>

        {/* Concepts section */}
        <button
          onClick={() => setConceptsOpen(!conceptsOpen)}
          className="mt-4 mb-1 flex w-full items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Concepts
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              conceptsOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {conceptsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {concepts.map((concept) => {
                const isActive =
                  pathname === `/concepts/${concept.slug}`;
                const Icon = concept.icon;
                return (
                  <Link
                    key={concept.slug}
                    href={`/concepts/${concept.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent-light text-accent font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{concept.title}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playground link */}
        <div className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tools
        </div>
        <Link
          href="/playground"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/playground"
              ? "bg-accent-light text-accent font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Play className="h-4 w-4" />
          Playground
        </Link>
      </nav>

      {/* Theme toggle */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  theme === opt.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card p-2 shadow-lg border border-border lg:hidden"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-40 h-full w-[280px] bg-sidebar-bg border-r border-sidebar-border lg:hidden"
          >
            {navContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar-bg">
        {navContent}
      </aside>
    </>
  );
}
