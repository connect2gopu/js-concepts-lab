"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { concepts } from "@/lib/concepts-data";
import { ConceptCard } from "@/components/concept-card";

export default function HomePage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl text-center pt-8 pb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-light px-4 py-1.5 text-sm font-medium text-accent"
        >
          <Sparkles className="h-4 w-4" />
          Interactive Learning Playground
        </motion.div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          JS/TS{" "}
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            Concept Lab
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Explore JavaScript and TypeScript concepts through interactive demos.
          Each lab features live examples, visualizations, and source code you
          can study and experiment with.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/concepts/typescript"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Open Playground
          </Link>
        </motion.div>
      </motion.div>

      {/* Concept Grid */}
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 text-xl font-semibold text-foreground"
        >
          Concept Labs
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {concepts.map((concept, index) => (
            <ConceptCard
              key={concept.slug}
              concept={concept}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mx-auto mt-12 max-w-5xl rounded-xl border border-border bg-card p-6"
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Concept Labs", value: "6" },
            { label: "Interactive Demos", value: "25+" },
            { label: "JS/TS Patterns", value: "15+" },
            { label: "Next.js Features", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
