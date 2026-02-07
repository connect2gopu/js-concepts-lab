"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Bell } from "lucide-react";
import { CodeDemo } from "@/components/code-demo";

const observerCode = `// Observer Pattern: one-to-many dependency
// When subject changes, all observers are notified

type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<E extends keyof Events>(event: E, listener: Listener<Events[E]>) {
    this.listeners.get(event)?.delete(listener);
  }

  emit<E extends keyof Events>(event: E, data: Events[E]) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Usage
interface StoreEvents {
  priceChange: { item: string; price: number };
  newItem: { name: string };
  sale: { discount: number };
}

const store = new EventEmitter<StoreEvents>();

// Subscribers
const unsub1 = store.on("priceChange", ({ item, price }) => {
  console.log(\`Price alert: \${item} is now $\${price}\`);
});

store.emit("priceChange", { item: "Widget", price: 9.99 });
unsub1(); // Unsubscribe`;

interface LogEntry {
  id: number;
  subscriber: string;
  event: string;
  data: string;
  timestamp: number;
}

interface Subscriber {
  id: string;
  name: string;
  events: string[];
  color: string;
}

const EVENTS = ["priceChange", "newItem", "sale"] as const;
const COLORS = ["text-blue-500", "text-emerald-500", "text-amber-500", "text-purple-500", "text-rose-500"];

export function ObserverDemo() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    { id: "s1", name: "Dashboard", events: ["priceChange", "sale"], color: COLORS[0] },
    { id: "s2", name: "Email Service", events: ["newItem"], color: COLORS[1] },
    { id: "s3", name: "Analytics", events: ["priceChange", "newItem", "sale"], color: COLORS[2] },
  ]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  const emit = useCallback(
    (event: string) => {
      const dataMap: Record<string, string> = {
        priceChange: '{ item: "Widget", price: $9.99 }',
        newItem: '{ name: "Super Gadget" }',
        sale: "{ discount: 25% }",
      };

      const newEntries: LogEntry[] = [];
      subscribers
        .filter((sub) => sub.events.includes(event))
        .forEach((sub) => {
          logIdRef.current++;
          newEntries.push({
            id: logIdRef.current,
            subscriber: sub.name,
            event,
            data: dataMap[event] || "{}",
            timestamp: Date.now(),
          });
        });

      setLog((prev) => [...newEntries, ...prev].slice(0, 20));
    },
    [subscribers]
  );

  const toggleEvent = (subId: string, event: string) => {
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        const events = sub.events.includes(event)
          ? sub.events.filter((e) => e !== event)
          : [...sub.events, event];
        return { ...sub, events };
      })
    );
  };

  const addSubscriber = () => {
    const id = `s${Date.now()}`;
    const names = ["Logger", "Cache", "Notifier", "Monitor", "Backup"];
    const name = names[subscribers.length % names.length];
    setSubscribers((prev) => [
      ...prev,
      {
        id,
        name: `${name} ${subscribers.length + 1}`,
        events: [],
        color: COLORS[subscribers.length % COLORS.length],
      },
    ]);
  };

  const removeSubscriber = (id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Event Emitter (Observer Pattern)"
        description="Add/remove subscribers and toggle which events they listen to. Emit events to see notifications flow."
        code={observerCode}
      >
        <div className="space-y-4">
          {/* Subscribers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Subscribers ({subscribers.length})
              </p>
              <button
                onClick={addSubscriber}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>

            <AnimatePresence>
              {subscribers.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${sub.color}`}>
                      {sub.name}
                    </span>
                    <button
                      onClick={() => removeSubscriber(sub.id)}
                      className="text-muted-foreground hover:text-error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {EVENTS.map((event) => (
                      <button
                        key={event}
                        onClick={() => toggleEvent(sub.id, event)}
                        className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                          sub.events.includes(event)
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Emit buttons */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Emit Event
            </p>
            <div className="flex gap-2">
              {EVENTS.map((event) => {
                const count = subscribers.filter((s) =>
                  s.events.includes(event)
                ).length;
                return (
                  <button
                    key={event}
                    onClick={() => emit(event)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {event}
                    <span className="rounded-full bg-accent-foreground/20 px-1.5 py-0.5 text-[10px]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Log */}
          <div className="rounded-lg bg-code-bg p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Event Log</p>
            {log.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No events emitted yet
              </p>
            ) : (
              <div className="space-y-1">
                {log.map((entry) => (
                  <motion.p
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-mono text-[11px]"
                  >
                    <span className="text-accent">{entry.subscriber}</span>
                    <span className="text-muted-foreground">
                      {" "}received{" "}
                    </span>
                    <span className="text-warning">{entry.event}</span>
                    <span className="text-muted-foreground">
                      {" "}{entry.data}
                    </span>
                  </motion.p>
                ))}
              </div>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
