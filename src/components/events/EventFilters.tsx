import React, { useEffect } from "react";
import { Search, Filter, MapPin, Loader2 } from "lucide-react";
import { EventFilters } from "@/types";
import { Input, Select, Checkbox, Button } from "@/components/ui";
import { categories, locations } from "@/data/events";
import {
  formLabels,
  buttonTexts,
  placeholders,
  tooltips,
  uiTexts,
} from "@/content";
import { useSearchWithDebounce } from "@/hooks";

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

export const EventFiltersComponent: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const { searchTerm, debouncedSearchTerm, isSearching, setSearchTerm } =
    useSearchWithDebounce(filters.searchTerm, 300);

  // Update parent filters when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      onFiltersChange({
        ...filters,
        searchTerm: debouncedSearchTerm,
      });
    }
  }, [debouncedSearchTerm, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof EventFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const locationOptions = locations.map((loc) => ({
    value: loc.name,
    label: loc.name,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 text-blue-500 animate-spin" />
          )}
          <Input
            type="text"
            placeholder={placeholders.searchEvents}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isSearching ? "pr-10" : ""}`}
          />
          {isSearching && (
            <span className="absolute right-10 top-3 text-xs text-blue-500">
              {uiTexts.searching}
            </span>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            options={categoryOptions}
            title={tooltips.filterByCategory}
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <Select
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            options={locationOptions}
            title={tooltips.filterByLocation}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {formLabels.priceRange}
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder={placeholders.priceMin}
              value={filters.priceRange.min || ""}
              onChange={(e) =>
                handleFilterChange("priceRange", {
                  ...filters.priceRange,
                  min: parseInt(e.target.value) || 0,
                })
              }
              className="text-sm"
            />
            <Input
              type="number"
              placeholder={placeholders.priceMax}
              value={filters.priceRange.max || ""}
              onChange={(e) =>
                handleFilterChange("priceRange", {
                  ...filters.priceRange,
                  max: parseInt(e.target.value) || 0,
                })
              }
              className="text-sm"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {formLabels.dateRange}
          </label>
          <div className="flex space-x-2">
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              className="text-sm"
            />
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {" "}
          <Checkbox
            label={formLabels.promotionsOnly}
            checked={filters.isPromotionOnly}
            onChange={(e) =>
              handleFilterChange("isPromotionOnly", e.target.checked)
            }
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          title={tooltips.clearFilters}
        >
          {buttonTexts.clearFilters}
        </Button>
      </div>
    </div>
  );
};
