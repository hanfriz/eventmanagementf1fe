"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Event, EventFilters } from "@/types";
import { eventsAPI } from "@/lib/api";
import { useSearchWithDebounce } from "@/hooks/useSearchWithDebounce";
import { EventCard } from "@/components";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const debouncedSearchTerm = useSearchWithDebounce(searchTerm, 500);

  const categories = [
    "All",
    "TECHNOLOGY",
    "BUSINESS",
    "EDUCATION",
    "ENTERTAINMENT",
    "SPORTS",
    "ART & CULTURE",
    "HEALTH & WELLNESS",
  ];

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: EventFilters = {
        search: debouncedSearchTerm.debouncedSearchTerm || undefined,
        category:
          selectedCategory && selectedCategory !== "All"
            ? selectedCategory
            : undefined,
        status: "UPCOMING" as const,
        limit: 3,
        priceRange: {},
        dateRange: {},
      };

      const response = await eventsAPI.getEvents(filters);
      setEvents(response.events || []);
    } catch (error) {
      console.log("Failed to load events:", error);
      setEvents([]); // Ensure events is always an array
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm.debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="text-yellow-400"> Events</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Find, book, and experience the best events in your city. From tech
              conferences to music festivals.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-gray-900 border-0"
                  />
                </div>
                <Link
                  href={`/events${searchTerm ? `?search=${searchTerm}` : ""}`}
                >
                  <Button size="lg" className="w-full md:w-auto">
                    {searchTerm ? "Search" : "Browse All Events"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category === "All" ? "" : category)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category ||
                  (selectedCategory === "" && category === "All")
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Don&apos;t miss out on these amazing upcoming events
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-6 rounded-b-lg border">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
                // <Card
                //   key={event.id}
                //   className="overflow-hidden hover:shadow-lg transition-shadow text-black"
                // >
                //   <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                //     {event.image ? (
                //       <Image
                //         width={800}
                //         height={600}
                //         src={event.image}
                //         alt={event.title}
                //         className="w-full h-full object-cover"
                //       />
                //     ) : (
                //       <div className="w-full h-full flex items-center justify-center">
                //         <Calendar className="h-16 w-16 text-blue-400" />
                //       </div>
                //     )}
                //     <div className="absolute top-4 left-4">
                //       <Badge variant={event.isFree ? "success" : "default"}>
                //         {event.isFree ? "Free" : formatPrice(event.price)}
                //       </Badge>
                //     </div>
                //   </div>

                //   <div className="p-6">
                //     <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                //       <Calendar className="h-4 w-4" />
                //       <span>{formatDate(event.startDate)}</span>
                //     </div>

                //     <h3 className="font-bold text-lg mb-2 line-clamp-2">
                //       {event.title}
                //     </h3>
                //     <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                //       {event.description}
                //     </p>

                //     <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                //       <div className="flex items-center gap-1">
                //         <MapPin className="h-4 w-4" />
                //         <span className="line-clamp-1">{event.location}</span>
                //       </div>
                //       <div className="flex items-center gap-1">
                //         <Users className="h-4 w-4" />
                //         <span>
                //           {event.availableSeats || event.totalSeats} seats
                //         </span>
                //       </div>
                //     </div>

                //     <div className="flex items-center justify-between">
                //       <div className="flex items-center gap-1">
                //         <Star className="h-4 w-4 text-yellow-400 fill-current" />
                //         <span className="text-sm text-gray-600">
                //           {event.averageRating?.toFixed(1) || "0.0"}
                //         </span>
                //       </div>
                //       <Link href={`/events/${event.id}`}>
                //         <Button size="sm">View Details</Button>
                //       </Link>
                //     </div>
                //   </div>
                // </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "No events are currently available"}
              </p>
              <Link
                href={`/events${searchTerm ? `?search=${searchTerm}` : ""}`}
              >
                <Button>{searchTerm ? "Search" : "Browse All Events"}</Button>
              </Link>
            </div>
          )}

          {events && events.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/events">
                <Button variant="outline" size="lg">
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Events Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                50K+
              </div>
              <div className="text-gray-600">Happy Attendees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Event Organizers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your Event?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of organizers who trust us with their events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=organizer">
              <Button size="lg" variant="secondary">
                Become an Organizer
              </Button>
            </Link>
            <Link href="/events">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-blue-600"
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
