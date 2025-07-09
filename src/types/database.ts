import { Event, User, Promotion, Registration, Review } from "@prisma/client";

// Extend Prisma types with computed fields
export interface EventWithDetails extends Event {
  organizer: Pick<User, "id" | "name" | "email" | "phone">;
  promotion?: Promotion | null;
  registrations: Pick<Registration, "id">[];
  reviews: Pick<Review, "rating">[];
  availableSeats: number;
  averageRating: number | null;
}

export interface EventWithFullDetails extends Event {
  organizer: Pick<User, "id" | "name" | "email" | "phone">;
  promotion?: Promotion | null;
  registrations: (Registration & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
  reviews: (Review & {
    user: Pick<User, "id" | "name">;
  })[];
  availableSeats: number;
  averageRating: number | null;
}

export interface RegistrationWithDetails extends Registration {
  user: Pick<User, "id" | "name" | "email">;
  event: Pick<
    Event,
    "id" | "title" | "startDate" | "endDate" | "location" | "image"
  >;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Filter types
export interface EventFiltersParams {
  category?: string;
  location?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  promotionsOnly?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  totalSeats: number;
  isFree: boolean;
  image?: string;
  tags?: string[];
  organizerId: string;
  status?: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  promotion?: {
    code: string;
    discountPercent: number;
    validUntil: string;
    maxUses?: number;
    minPurchase?: number;
  };
}

export interface CreateRegistrationData {
  userId: string;
  eventId: string;
  paymentMethod?: string;
}
