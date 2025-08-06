"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isEqual,
  isSameMonth,
  isToday,
  isWithinInterval,
  isSameDay,
  addDays,
  isAfter,
  isBefore,
  getDay,
  startOfDay,
  endOfDay,
} from "date-fns";

type DateRange = { from: Date | undefined; to: Date | undefined };

interface DatePickerProps {
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: value?.from,
    to: value?.to,
  });

  const [pickingEndDate, setPickingEndDate] = useState(false);

  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value) {
      setSelectedRange({ from: value.from, to: value.to });
      if (value.from) setCurrentMonth(value.from);
    } else {
      setSelectedRange({ from: undefined, to: undefined });
    }
  }, [value]);

  const daysInMonth = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const firstDayOfGrid = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
    const lastDayOfGrid = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid });
  }, [currentMonth]);

  const handleDayClick = useCallback(
    (day: Date) => {
      if (!pickingEndDate || !selectedRange.from) {
        setSelectedRange({ from: day, to: undefined });
        setPickingEndDate(true);
        setHoveredDate(null);
      } else {
        const newFrom = isBefore(day, selectedRange.from)
          ? day
          : selectedRange.from;
        const newTo = isAfter(day, selectedRange.from)
          ? day
          : selectedRange.from;

        const finalRange = {
          from: newFrom,
          to: newTo,
        };

        if (isAfter(day, selectedRange.from)) {
          finalRange.to = day;
        } else {
          finalRange.from = day;
          finalRange.to = selectedRange.from;
        }

        onChange(finalRange);
        setSelectedRange(finalRange);
        setPickingEndDate(false);
        setHoveredDate(null);
        setOpen(false);
      }
    },
    [pickingEndDate, selectedRange.from, onChange]
  );

  const getDisplayRange = (day: Date) => {
    if (!selectedRange.from && !selectedRange.to) return null;

    const start = selectedRange.from || day;
    const end =
      pickingEndDate && hoveredDate ? hoveredDate : selectedRange.to || day;

    if (isAfter(start, end)) {
      return { from: end, to: start };
    }
    return { from: start, to: end };
  };

  const handlePresetRange = useCallback(
    (rangeName: string) => {
      const today = startOfDay(new Date());
      let newRange: DateRange = { from: undefined, to: undefined };

      switch (rangeName) {
        case "Today":
          newRange = { from: today, to: endOfDay(today) };
          break;
        case "Tomorrow":
          newRange = {
            from: addDays(today, 1),
            to: endOfDay(addDays(today, 1)),
          };
          break;
        case "This weekend":
          const startOfWeekend = addDays(
            startOfWeek(today, { weekStartsOn: 0 }),
            6
          );
          newRange = {
            from: startOfWeekend,
            to: endOfDay(addDays(startOfWeekend, 1)),
          };
          break;
        case "Next week":
          const nextMonday = addDays(
            startOfWeek(today, { weekStartsOn: 0 }),
            7
          );
          newRange = { from: nextMonday, to: endOfDay(addDays(nextMonday, 6)) };
          break;
        case "2 weeks":
          newRange = { from: today, to: endOfDay(addDays(today, 13)) };
          break;
        case "4 weeks":
          newRange = { from: today, to: endOfDay(addDays(today, 27)) };
          break;
        case "Next month":
          newRange = {
            from: startOfMonth(addMonths(today, 1)),
            to: endOfMonth(addMonths(today, 1)),
          };
          break;
        default:
          break;
      }
      onChange(newRange);
      setSelectedRange(newRange);
      setPickingEndDate(false);
      setHoveredDate(null);
      setOpen(false);
    },
    [onChange]
  );

  const getFormattedDateRange = () => {
    if (!value?.from && !value?.to) return placeholder;
    if (value.from && !value.to) return format(value.from, "LLL dd, y");
    if (value.from && value.to && isEqual(value.from, value.to))
      return format(value.from, "LLL dd, y");
    if (value.from && value.to)
      return `${format(value.from, "LLL dd, y")} - ${format(
        value.to,
        "LLL dd, y"
      )}`;
    return placeholder;
  };

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-12 text-base",
            !value?.from && !value?.to && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getFormattedDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <div className="flex bg-background rounded-md shadow-lg">
          {/* Left Panel: Quick Select Options */}
          <div className="w-48 border-r py-4 px-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("Today")}
              >
                Today{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(new Date(), "EEE")}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("Tomorrow")}
              >
                Tomorrow{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(addDays(new Date(), 1), "EEE")}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("This weekend")}
              >
                This weekend{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(
                    addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6),
                    "MMM d"
                  )}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("Next week")}
              >
                Next week{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(
                    addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 7),
                    "MMM d"
                  )}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("2 weeks")}
              >
                2 weeks{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(addDays(new Date(), 13), "MMM d")}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("4 weeks")}
              >
                4 weeks{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(addDays(new Date(), 27), "MMM d")}
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handlePresetRange("Next month")}
              >
                Next month{" "}
                <span className="ml-auto text-muted-foreground">
                  {format(startOfMonth(addMonths(new Date(), 1)), "MMM")}
                </span>
              </Button>
            </div>
            <div className="border-t pt-4 mt-4 px-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-sm text-primary"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear selection
              </Button>
            </div>
          </div>

          {/* Right Panel: Calendar View */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {weekdays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
              {daysInMonth.map((day) => {
                const dayAsNumber = day.getTime();
                const fromAsNumber = selectedRange.from?.getTime() || 0;
                const toAsNumber = selectedRange.to?.getTime() || 0;
                const hoveredAsNumber = hoveredDate?.getTime() || 0;

                const isStart =
                  selectedRange.from && isSameDay(day, selectedRange.from);
                const isEnd =
                  selectedRange.to && isSameDay(day, selectedRange.to);
                const isWithinSelectedRange =
                  selectedRange.from &&
                  selectedRange.to &&
                  isWithinInterval(day, {
                    start: selectedRange.from,
                    end: selectedRange.to,
                  });

                const isWithinHoverRange =
                  pickingEndDate &&
                  selectedRange.from &&
                  hoveredDate &&
                  isWithinInterval(day, {
                    start: isBefore(selectedRange.from, hoveredDate)
                      ? selectedRange.from
                      : hoveredDate,
                    end: isBefore(selectedRange.from, hoveredDate)
                      ? hoveredDate
                      : selectedRange.from,
                  });

                return (
                  <div
                    key={day.toString()}
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={cn(
                      "relative w-9 h-9 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors",
                      isSameMonth(day, currentMonth)
                        ? "text-foreground"
                        : "text-muted-foreground opacity-50",
                      !isEqual(day, new Date()) &&
                        !isWithinSelectedRange &&
                        !(isStart || isEnd) &&
                        "hover:bg-accent hover:text-accent-foreground",
                      (isWithinSelectedRange || isWithinHoverRange) &&
                        "bg-primary/20",
                      (isStart || isEnd) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      isToday(day) && "border-2 border-primary/50"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
