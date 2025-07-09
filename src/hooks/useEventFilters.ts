import { useState, useMemo, useCallback } from "react";
import { Event, EventFilters } from "@/types";
import { useDebounce } from "@/lib/utils";

const initialFilters: EventFilters = {
  searchTerm: "",
  category: "All Categories",
  location: "All Locations",
  priceRange: { min: 0, max: 0 },
  dateRange: { start: "", end: "" },
  isPromotionOnly: false,
};

export const useEventFilters = (events: Event[]) => {
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter (using debounced search term)
      const searchTerm = debouncedSearchTerm?.toLowerCase() || "";
      const matchesSearch =
        !searchTerm ||
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));

      // Category filter
      const matchesCategory =
        !filters.category ||
        filters.category === "All Categories" ||
        event.category === filters.category;

      // Location filter
      const matchesLocation =
        !filters.location ||
        filters.location === "All Locations" ||
        event.location.toLowerCase().includes(filters.location.toLowerCase());

      // Price range filter
      const matchesPriceRange =
        (!filters.priceRange?.min || event.price >= filters.priceRange.min) &&
        (!filters.priceRange?.max || event.price <= filters.priceRange.max);

      // Date range filter
      const matchesDateRange =
        (!filters.dateRange?.start ||
          event.startDate >= filters.dateRange.start) &&
        (!filters.dateRange?.end || event.endDate <= filters.dateRange.end);

      // Promotion filter
      const matchesPromotion = !filters.isPromotionOnly || event.promotion;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesPriceRange &&
        matchesDateRange &&
        matchesPromotion
      );
    });
  }, [events, filters, debouncedSearchTerm]);

  const updateFilters = useCallback((newFilters: EventFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const updateFilter = useCallback(
    (key: keyof EventFilters, value: unknown) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  return {
    filters,
    filteredEvents,
    updateFilters,
    clearFilters,
    updateFilter,
  };
};
