import React from "react";
import { Calendar, MapPin, Users, Tag, ArrowLeft } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Event } from "@/types";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  formatPrice,
  formatDate,
  calculateDiscountedPrice,
  getEventStatus,
} from "@/lib/eventUtils";

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onRegister?: (event: Event) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  onRegister,
}) => {
  const eventStatus = getEventStatus(event.startDate, event.endDate);
  const isRegistrationAvailable =
    eventStatus === "upcoming" && (event.availableSeats ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        {/* Header Image */}
        <div className="relative h-64 md:h-96">
          <OptimizedImage
            src={event.image || "/fallback-image.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />

          {/* Overlay with promotions */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />

          {event.promotion && (
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center font-bold">
                  <Tag className="w-4 h-4 mr-2" />
                  {event.promotion.discountPercent}% OFF
                </div>
                <div className="text-sm">Code: {event.promotion.code}</div>
                <div className="text-xs opacity-90">
                  Valid until: {formatDate(event.promotion.validUntil)}
                </div>
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <Badge
              variant={
                eventStatus === "upcoming"
                  ? "info"
                  : eventStatus === "active"
                  ? "success"
                  : "default"
              }
              size="sm"
            >
              {eventStatus === "upcoming"
                ? "Upcoming"
                : eventStatus === "active"
                ? "Live Now"
                : "Ended"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          {/* Event Title and Category */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              <Badge variant="info" size="md" className="mb-4">
                {event.category}
              </Badge>
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              About This Event
            </h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Event Details
              </h3>

              <div className="flex items-start text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.startDate)}
                    {event.startDate !== event.endDate && (
                      <> - {formatDate(event.endDate)}</>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-gray-600">{event.location}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Availability
              </h3>

              <div className="flex items-start text-gray-700">
                <Users className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Seats Available</div>
                  <div className="text-sm text-gray-600">
                    {event.availableSeats} of {event.totalSeats} seats
                  </div>{" "}
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    {(() => {
                      const percentage = Math.min(
                        100,
                        Math.max(
                          0,
                          ((event.totalSeats - (event.availableSeats ?? 0)) /
                            event.totalSeats) *
                            100
                        )
                      );
                      const widthClass =
                        percentage > 75
                          ? "w-3/4"
                          : percentage > 50
                          ? "w-1/2"
                          : percentage > 25
                          ? "w-1/4"
                          : "w-1/12";
                      return (
                        <div
                          className={`bg-blue-600 h-2 rounded-full ${widthClass}`}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="text-gray-700">
                <div className="font-medium">Organizer</div>
                <div className="text-sm text-gray-600">
                  {event.organizer?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Promotion Details */}
          {event.promotion && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Special Promotion
              </h3>
              <div className="text-red-700">
                <p>
                  Get {event.promotion.discountPercent}% off with code:{" "}
                  <strong>{event.promotion.code}</strong>
                </p>
                <p className="text-sm">
                  Valid until: {formatDate(event.promotion.validUntil)}
                </p>
                {event.promotion.maxUses && event.promotion.currentUses && (
                  <p className="text-sm">
                    {event.promotion.maxUses - event.promotion.currentUses} uses
                    remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pricing and Registration */}
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {event.isFree ? "FREE" : formatPrice(event.price)}
                </div>
                {event.promotion && !event.isFree && (
                  <div className="text-lg text-gray-500 line-through">
                    {formatPrice(
                      calculateDiscountedPrice(
                        event.price,
                        -event.promotion.discountPercent
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {isRegistrationAvailable ? (
                  <Button
                    size="lg"
                    onClick={() => onRegister?.(event)}
                    className="px-8"
                  >
                    Register Now
                  </Button>
                ) : event.availableSeats === 0 ? (
                  <Button size="lg" disabled className="px-8">
                    Sold Out
                  </Button>
                ) : (
                  <Button size="lg" disabled className="px-8">
                    Registration Closed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
