"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Calendar,
  MapPin,
  Star,
  Users,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Event, EventFilters, EventCategory } from "@/types";
import { eventsAPI } from "@/lib/api";
import { useDebounce } from "@/lib/utils";
import { format } from "date-fns";
import OptimizedImage from "@/components/ui/OptimizedImage";

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  // Get values from URL parameters
  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedLocation = searchParams.get("location") || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const dateStart = searchParams.get("dateStart") || "";
  const dateEnd = searchParams.get("dateEnd") || "";
  const isFreeOnly = searchParams.get("isFree") === "true";
  const hasPromotionOnly = searchParams.get("hasPromotion") === "true";
  const minRating = searchParams.get("minRating") || "";
  const page = parseInt(searchParams.get("page") || "1");

  // Debounced search input
  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Show filters if there are active filters or user explicitly opened them
  const hasActiveFilters = !!(
    searchTerm ||
    selectedCategory ||
    selectedLocation ||
    priceMin ||
    priceMax ||
    dateStart ||
    dateEnd ||
    isFreeOnly ||
    hasPromotionOnly ||
    minRating
  );
  const [showFilters, setShowFilters] = useState(hasActiveFilters);

  // Sync search input with URL parameter on first load
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Helper function to update URL parameters
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      // Update or remove parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === 0) {
          current.delete(key);
        } else {
          current.set(key, value.toString());
        }
      });

      // Push new URL
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`/events${query}`);
    },
    [router, searchParams]
  );

  // Update URL when debounced search input changes
  useEffect(() => {
    if (debouncedSearchInput !== searchTerm) {
      updateUrlParams({
        search: debouncedSearchInput || undefined,
        page: undefined,
      });
    }
  }, [debouncedSearchInput, searchTerm, updateUrlParams]);

  // Update search term
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Update category
  const handleCategoryChange = useCallback(
    (value: string) => {
      updateUrlParams({ category: value, page: undefined });
    },
    [updateUrlParams]
  );

  // Update location
  const handleLocationChange = useCallback(
    (value: string) => {
      updateUrlParams({ location: value, page: undefined });
    },
    [updateUrlParams]
  );

  // Update page
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateUrlParams({ page: newPage });
    },
    [updateUrlParams]
  );

  // Update price range
  const handlePriceRangeChange = useCallback(
    (min: string, max: string) => {
      updateUrlParams({
        priceMin: min || undefined,
        priceMax: max || undefined,
        page: undefined,
      });
    },
    [updateUrlParams]
  );

  // Update date range
  const handleDateRangeChange = useCallback(
    (start: string, end: string) => {
      updateUrlParams({
        dateStart: start || undefined,
        dateEnd: end || undefined,
        page: undefined,
      });
    },
    [updateUrlParams]
  );

  // Update boolean filters
  const handleBooleanFilterChange = useCallback(
    (filterName: string, value: boolean) => {
      updateUrlParams({
        [filterName]: value ? "true" : undefined,
        page: undefined,
      });
    },
    [updateUrlParams]
  );

  // Update rating filter
  const handleRatingChange = useCallback(
    (rating: string) => {
      updateUrlParams({
        minRating: rating || undefined,
        page: undefined,
      });
    },
    [updateUrlParams]
  );

  // Update sort
  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder?: string) => {
      setSortBy(newSortBy);
      if (newSortOrder) {
        setSortOrder(newSortOrder as "asc" | "desc");
      }
    },
    []
  );

  const categories = [
    { value: "", label: "All Categories" },
    { value: EventCategory.TECHNOLOGY, label: "Technology" },
    { value: EventCategory.BUSINESS, label: "Business" },
    { value: EventCategory.EDUCATION, label: "Education" },
    { value: EventCategory.ENTERTAINMENT, label: "Entertainment" },
    { value: EventCategory.SPORTS, label: "Sports" },
    { value: EventCategory.HEALTH, label: "Health & Wellness" },
    { value: EventCategory.FOOD, label: "Food & Dining" },
    { value: EventCategory.TRAVEL, label: "Travel" },
    { value: EventCategory.ART, label: "Art" },
    { value: EventCategory.MUSIC, label: "Music" },
    { value: EventCategory.OTHER, label: "Other" },
  ];

  const locations = [
    { value: "", label: "All Locations" },
    { value: "Jakarta", label: "Jakarta" },
    { value: "Surabaya", label: "Surabaya" },
    { value: "Bandung", label: "Bandung" },
    { value: "Yogyakarta", label: "Yogyakarta" },
    { value: "Medan", label: "Medan" },
    { value: "Bali", label: "Bali" },
    { value: "Makassar", label: "Makassar" },
  ];

  const sortOptions = [
    { value: "date", label: "Date (Nearest)" },
    { value: "price", label: "Price (Low to High)" },
    { value: "popularity", label: "Popularity" },
    { value: "title", label: "Name (A-Z)" },
  ];

  const ratingOptions = [
    { value: "", label: "Any Rating" },
    { value: "4", label: "4+ Stars" },
    { value: "3", label: "3+ Stars" },
    { value: "2", label: "2+ Stars" },
    { value: "1", label: "1+ Stars" },
  ];

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: EventFilters = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        location: selectedLocation || undefined,
        status: undefined, // Show all upcoming and active events
        page,
        limit: 12,
        sortBy: sortBy as "date" | "popularity" | "price",
        sortOrder,
        isFree: isFreeOnly || undefined,
        hasPromotion: hasPromotionOnly || undefined,
        priceRange: {
          min: priceMin ? parseInt(priceMin) : undefined,
          max: priceMax ? parseInt(priceMax) : undefined,
        },
        dateRange: {
          start: dateStart || undefined,
          end: dateEnd || undefined,
        },
        averageRating: minRating ? { min: parseFloat(minRating) } : undefined,
      };

      const response = await eventsAPI.getEvents(filters);
      setEvents(response.events);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedLocation,
    page,
    sortBy,
    sortOrder,
    priceMin,
    priceMax,
    dateStart,
    dateEnd,
    isFreeOnly,
    hasPromotionOnly,
    minRating,
  ]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Auto-expand filters when there are active filters
  useEffect(() => {
    if (hasActiveFilters && !showFilters) {
      setShowFilters(true);
    }
  }, [hasActiveFilters, showFilters]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return `${format(new Date(dateString), "EEEE, MMM dd")}`;
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push("/events");
  };

  const renderEventCard = (event: Event, isListView: boolean = false) => (
    <Card
      key={event.id}
      className={`overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
        isListView ? "flex flex-row" : ""
      }`}
    >
      <div
        className={`bg-gradient-to-br from-blue-100 to-purple-100 relative ${
          isListView ? "w-48 flex-shrink-0" : "aspect-video"
        }`}
      >
        {event.image ? (
          <OptimizedImage
            width={800}
            height={600}
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-blue-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={event.isFree ? "success" : "default"}>
            {event.isFree ? "Free" : formatPrice(event.price)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="info" className="capitalize">
            {event.category.toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className={`p-6 ${isListView ? "flex-1" : ""}`}>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(event.startDate)}</span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-black">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{event.availableSeats || event.totalSeats} seats</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {event.averageRating?.toFixed(1) || "0.0"}
              </span>
            </div>
            {event.organizer && (
              <div className="text-sm text-gray-600">
                by {event.organizer.name}
              </div>
            )}
          </div>
          <Link href={`/events/${event.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Welcome Message for Logged-in Users */}

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Events
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find amazing events happening around you
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for events..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 text-gray-900 border-0"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-700 border-gray-300"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Category & Location */}
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      options={categories}
                    />
                    <Select
                      value={selectedLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      options={locations}
                    />
                    <Select
                      value={minRating}
                      onChange={(e) => handleRatingChange(e.target.value)}
                      options={ratingOptions}
                    />
                  </div>

                  {/* Price Range */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (IDR)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={priceMin}
                        onChange={(e) =>
                          handlePriceRangeChange(e.target.value, priceMax)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={priceMax}
                        onChange={(e) =>
                          handlePriceRangeChange(priceMin, e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={dateStart}
                        onChange={(e) =>
                          handleDateRangeChange(e.target.value, dateEnd)
                        }
                      />
                      <Input
                        type="date"
                        value={dateEnd}
                        onChange={(e) =>
                          handleDateRangeChange(dateStart, e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Boolean Filters */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isFreeOnly}
                          onChange={(e) =>
                            handleBooleanFilterChange(
                              "isFree",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          Free events only
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasPromotionOnly}
                          onChange={(e) =>
                            handleBooleanFilterChange(
                              "hasPromotion",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          Events with promotions
                        </span>
                      </label>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-gray-700"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {isLoading ? "Loading..." : `${events.length} events found`}
              </span>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Filters:</span>
                  {searchTerm && (
                    <Badge variant="info">Search: {searchTerm}</Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="info">
                      {
                        categories.find((c) => c.value === selectedCategory)
                          ?.label
                      }
                    </Badge>
                  )}
                  {selectedLocation && (
                    <Badge variant="info">{selectedLocation}</Badge>
                  )}
                  {priceMin && (
                    <Badge variant="info">
                      Min: {formatPrice(parseInt(priceMin))}
                    </Badge>
                  )}
                  {priceMax && (
                    <Badge variant="info">
                      Max: {formatPrice(parseInt(priceMax))}
                    </Badge>
                  )}
                  {dateStart && (
                    <Badge variant="info">
                      From: {format(new Date(dateStart), "MMM dd")}
                    </Badge>
                  )}
                  {dateEnd && (
                    <Badge variant="info">
                      To: {format(new Date(dateEnd), "MMM dd")}
                    </Badge>
                  )}
                  {isFreeOnly && <Badge variant="success">Free Only</Badge>}
                  {hasPromotionOnly && (
                    <Badge variant="success">With Promotions</Badge>
                  )}
                  {minRating && (
                    <Badge variant="info">{minRating}+ Stars</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                options={sortOptions}
                className="w-48"
              />
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid/List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div
                    className={
                      viewMode === "grid"
                        ? "bg-gray-300 h-48 rounded-t-lg"
                        : "bg-gray-300 h-32 rounded-l-lg"
                    }
                  ></div>
                  <div className="bg-white p-6 rounded-b-lg border">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {events.map((event) =>
                  renderEventCard(event, viewMode === "list")
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded ${
                              page === pageNum
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return <span key={pageNum}>...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria"
                  : "No events are currently available"}
              </p>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
