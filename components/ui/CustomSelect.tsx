"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
  menuClassName?: string;
}

export function CustomSelect<T extends string | number = string>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = "Chọn một mục...",
  size = "md",
  className,
  menuClassName,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return next;
    });
  };

  const selectOption = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : options.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else if (highlightedIndex >= 0 && options[highlightedIndex]) {
        selectOption(options[highlightedIndex]);
      }
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full flex items-center justify-between gap-2 text-left transition-all duration-150 outline-none",
          "bg-parchment-50 hover:bg-white border text-ink font-semibold",
          open
            ? "border-celadon bg-white ring-4 ring-celadon/15 shadow-soft"
            : "border-parchment-300 hover:border-parchment-400",
          size === "sm"
            ? "rounded-xl px-3 py-2 text-xs"
            : "rounded-2xl px-4 py-2.5 text-sm"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-ink-light font-normal")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={size === "sm" ? 15 : 17}
          className={cn(
            "shrink-0 text-ink-light transition-transform duration-200",
            open && "rotate-180 text-celadon-dark"
          )}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute left-0 right-0 mt-2 z-50 max-h-64 overflow-y-auto",
            "rounded-2xl bg-white border border-parchment-300 shadow-lifted p-1.5 space-y-0.5 animate-fade-up",
            menuClassName
          )}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex items-center justify-between gap-2.5 cursor-pointer rounded-xl transition-colors select-none",
                  size === "sm" ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm",
                  isSelected
                    ? "bg-celadon-50 text-celadon-dark font-bold"
                    : isHighlighted
                    ? "bg-parchment-100 text-ink font-medium"
                    : "text-ink hover:bg-parchment-100 font-medium"
                )}
              >
                <div className="min-w-0">
                  <div className="truncate">{option.label}</div>
                  {option.description && (
                    <div className="text-[11px] text-ink-light font-normal truncate mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check size={size === "sm" ? 14 : 16} className="shrink-0 text-celadon" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
