"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  useId,
  useMemo,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption<T> {
  value: T;
  label: string;

  render?: (option: SelectOption<T>) => React.ReactNode;
}

interface SelectProps<T> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;

  renderTrigger?: (
    selectedLabel: string | undefined,
    isOpen: boolean
  ) => React.ReactNode;
}

export function Select<T extends string | number | boolean>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
  renderTrigger,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const selectedLabel = selectedOption ? selectedOption.label : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (isOpen) {
            if (highlightedIndex !== -1) {
              const selectedOption = options[highlightedIndex];
              if (selectedOption && onChange) {
                onChange(selectedOption.value);
              }
            } else if (selectedOption && onChange) {
              onChange(selectedOption.value);
            }
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          break;
        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              selectedOption ? options.indexOf(selectedOption) : 0
            );
            return;
          }

          const newIndex =
            event.key === "ArrowDown"
              ? (highlightedIndex + 1) % options.length
              : (highlightedIndex - 1 + options.length) % options.length;
          setHighlightedIndex(newIndex);

          if (optionsRef.current && optionsRef.current.children[newIndex]) {
            (
              optionsRef.current.children[newIndex] as HTMLLIElement
            ).scrollIntoView({ block: "nearest" });
          }
          break;
        case "Home":
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setHighlightedIndex(options.length - 1);
          break;
        default:
          break;
      }
    },
    [isOpen, highlightedIndex, options, onChange, selectedOption, disabled]
  );

  const handleOptionClick = useCallback(
    (option: SelectOption<T>) => {
      if (disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
    },
    [onChange, disabled]
  );

  useEffect(() => {
    if (isOpen) {
      const initialIndex = selectedOption ? options.indexOf(selectedOption) : 0;
      setHighlightedIndex(initialIndex);
      if (optionsRef.current && optionsRef.current.children[initialIndex]) {
        (
          optionsRef.current.children[initialIndex] as HTMLLIElement
        ).scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, selectedOption, options]);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {/* Select Trigger Button */}
      <button
        id={`select-trigger-${id}`}
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`select-label-${id} select-trigger-${id}`}
        aria-controls={`select-options-${id}`}
        disabled={disabled}
      >
        {renderTrigger ? (
          renderTrigger(selectedLabel, isOpen)
        ) : (
          <>
            <span
              className={cn(
                "block truncate",
                !selectedLabel && "text-muted-foreground"
              )}
            >
              {selectedLabel || placeholder}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Options Dropdown */}
      {isOpen && (
        <ul
          id={`select-options-${id}`}
          ref={optionsRef}
          role="listbox"
          aria-labelledby={`select-label-${id}`}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {options.length === 0 ? (
            <li className="py-2 px-3 text-sm text-muted-foreground">
              No options
            </li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value as React.Key}
                role="option"
                aria-selected={value === option.value}
                id={`option-${id}-${index}`}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  highlightedIndex === index &&
                    "bg-accent text-accent-foreground",
                  value === option.value && "font-semibold"
                )}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.value === value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {option.render ? option.render(option) : option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
