"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { lldItems } from "@/lib/lld-data";

export default function LLDPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-start gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">LLD Practice</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Low-Level Design implementations — each card is a real system component built from scratch with interactive visuals.
            </p>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lldItems.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/lld/${item.slug}`}>
                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
                  {/* Gradient top bar on hover */}
                  <div
                    className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${item.color} opacity-0 transition-opacity group-hover:opacity-100`}
                  />

                  {/* Index badge + icon */}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                      #{item.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
