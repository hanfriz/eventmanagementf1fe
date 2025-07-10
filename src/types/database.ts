// Local type definitions for frontend (do not import from @prisma/client)

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  price: number;
  totalSeats: number;
  image?: string;
  tags?: string[];
  organizerId: string;
  status?: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string;
  maxUses?: number;
  minPurchase?: number;
  eventId?: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

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
