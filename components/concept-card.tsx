"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ConceptInfo } from "@/lib/concepts-data";

interface ConceptCardProps {
  concept: ConceptInfo;
  index: number;
}

export function ConceptCard({ concept, index }: ConceptCardProps) {
  const Icon = concept.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/concepts/${concept.slug}`}>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
          {/* Gradient accent top bar */}
          <div
            className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${concept.color} opacity-0 transition-opacity group-hover:opacity-100`}
          />

          {/* Icon */}
          <div
            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${concept.color} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-accent transition-colors">
            {concept.title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {concept.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {concept.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
