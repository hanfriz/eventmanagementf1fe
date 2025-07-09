import React from "react";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Event } from "@/types";
import { Card, Badge, Button } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/eventUtils";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card
      key={event.id}
      className="overflow-hidden hover:shadow-lg transition-shadow text-black"
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
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
            <Calendar className="h-16 w-16 text-blue-400" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant={event.isFree ? "success" : "default"}>
            {event.isFree ? "Free" : formatPrice(event.price)}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.startDate)}</span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
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
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">
              {event.averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
