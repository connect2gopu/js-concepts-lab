"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const debounceCode = `// Debounce: delay execution until input stops
// Throttle: limit execution to once per interval

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// Usage: Search input with debounce
const debouncedSearch = debounce((query: string) => {
  fetch(\`/api/search?q=\${query}\`);
}, 300);

input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
  // Only fires 300ms after user stops typing
});

// Usage: Scroll handler with throttle
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener("scroll", throttledScroll);
// Fires at most once per 100ms during scrolling`;

interface EventLog {
  id: number;
  type: "raw" | "debounced" | "throttled";
  value: string;
  timestamp: number;
}

export function DebounceThrottleDemo() {
  const [input, setInput] = useState("");
  const [delay, setDelay] = useState(500);
  const [events, setEvents] = useState<EventLog[]>([]);
  const eventIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const throttleRef = useRef(false);
  const rawCountRef = useRef(0);
  const debouncedCountRef = useRef(0);
  const throttledCountRef = useRef(0);

  // Track raw count for display
  const [rawCount, setRawCount] = useState(0);
  const [debouncedCount, setDebouncedCount] = useState(0);
  const [throttledCount, setThrottledCount] = useState(0);

  const addEvent = useCallback((type: EventLog["type"], value: string) => {
    eventIdRef.current++;
    setEvents((prev) =>
      [{ id: eventIdRef.current, type, value, timestamp: Date.now() }, ...prev].slice(0, 30)
    );
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      setInput(value);

      // Raw event (always fires)
      rawCountRef.current++;
      setRawCount(rawCountRef.current);
      addEvent("raw", value);

      // Debounced (fires after delay of silence)
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        debouncedCountRef.current++;
        setDebouncedCount(debouncedCountRef.current);
        addEvent("debounced", value);
      }, delay);

      // Throttled (fires at most once per delay)
      if (!throttleRef.current) {
        throttleRef.current = true;
        throttledCountRef.current++;
        setThrottledCount(throttledCountRef.current);
        addEvent("throttled", value);
        setTimeout(() => {
          throttleRef.current = false;
        }, delay);
      }
    },
    [delay, addEvent]
  );

  const reset = () => {
    setInput("");
    setEvents([]);
    rawCountRef.current = 0;
    debouncedCountRef.current = 0;
    throttledCountRef.current = 0;
    setRawCount(0);
    setDebouncedCount(0);
    setThrottledCount(0);
  };

  // Visual timeline
  const [timelineEvents, setTimelineEvents] = useState<{ type: string; x: number }[]>([]);
  const timelineStartRef = useRef(Date.now());

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      const x = ((latest.timestamp - timelineStartRef.current) % 10000) / 10000;
      setTimelineEvents((prev) =>
        [...prev, { type: latest.type, x }].slice(-50)
      );
    }
  }, [events]);

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Debounce vs Throttle - Live Comparison"
        description="Type in the input to see raw events, debounced events, and throttled events side by side."
        code={debounceCode}
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Delay:</label>
            <input
              type="range"
              min={100}
              max={1000}
              step={100}
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-xs w-12 text-right">{delay}ms</span>
          </div>

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Type here to see debounce vs throttle..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          {/* Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-muted-foreground/20 p-3 text-center">
              <p className="text-2xl font-bold font-mono text-muted-foreground">
                {rawCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Raw Events</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Every keystroke
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-center">
              <p className="text-2xl font-bold font-mono text-accent">
                {debouncedCount}
              </p>
              <p className="text-[11px] text-accent">Debounced</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                After {delay}ms silence
              </p>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-center">
              <p className="text-2xl font-bold font-mono text-warning">
                {throttledCount}
              </p>
              <p className="text-[11px] text-warning">Throttled</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Max 1 per {delay}ms
              </p>
            </div>
          </div>

          {/* Event timeline */}
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-2">Event Timeline</p>
            <div className="relative h-16 rounded border border-border">
              {/* Lanes */}
              <div className="absolute top-0 left-0 right-0 h-1/3 border-b border-border/50 flex items-center px-2">
                <span className="text-[9px] text-muted-foreground">Raw</span>
              </div>
              <div className="absolute top-1/3 left-0 right-0 h-1/3 border-b border-border/50 flex items-center px-2">
                <span className="text-[9px] text-accent">Debounced</span>
              </div>
              <div className="absolute top-2/3 left-0 right-0 h-1/3 flex items-center px-2">
                <span className="text-[9px] text-warning">Throttled</span>
              </div>

              {/* Dots */}
              {timelineEvents.map((evt, i) => {
                const yMap: Record<string, string> = {
                  raw: "16%",
                  debounced: "50%",
                  throttled: "83%",
                };
                const colorMap: Record<string, string> = {
                  raw: "bg-muted-foreground",
                  debounced: "bg-accent",
                  throttled: "bg-warning",
                };
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute h-2 w-2 rounded-full ${colorMap[evt.type]}`}
                    style={{
                      left: `${Math.max(8, evt.x * 100)}%`,
                      top: yMap[evt.type],
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </CodeDemo>
    </div>
  );
}
