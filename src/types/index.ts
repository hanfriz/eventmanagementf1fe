export enum EventCategory {
  TECHNOLOGY = "TECHNOLOGY",
  BUSINESS = "BUSINESS",
  EDUCATION = "EDUCATION",
  ENTERTAINMENT = "ENTERTAINMENT",
  SPORTS = "SPORTS",
  ART = "ART & CULTURE",
  HEALTH = "HEALTH & WELLNESS",
  TRAVEL = "TRAVEL",
  MUSIC = "MUSIC",
  FOOD = "FOOD & BEVERAGE",
  OTHER = "OTHER",
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN"; // Fixed: Updated to match backend
  profilePicture?: string;
  gender?: "MALE" | "FEMALE";
  birthDate?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  availableSeats?: number;
  isFree: boolean;
  image?: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  tags: string[];
  organizerId: string;
  promotionId?: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  promotion?: Promotion;
  reviews?: Review[];
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  totalAmount: number;
  pointsUsed: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentProof?: string;
  status:
    | "WAITING_PAYMENT"
    | "WAITING_CONFIRM"
    | "DONE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  paymentDeadline?: string;
  notes?: string;
  userId: string;
  eventId: string;
  user?: User;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string;
  maxUses?: number;
  currentUses: number;
  minPurchase?: number;
  isActive: boolean;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  eventId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  isFree: boolean;
  image?: string;
  tags: string[];
}

export interface CreateTransactionDTO {
  eventId: string;
  quantity?: number;
  pointsUsed?: number;
  promoCode?: string;
  paymentMethod?: string;
}

export interface CreateReviewDTO {
  eventId: string;
  rating: number;
  comment?: string;
}

export interface CreatePromotionDTO {
  code: string;
  discountPercent: number;
  validUntil: string;
  maxUses?: number;
  minPurchase?: number;
  eventId?: string;
}

export interface UpdatePromotionDTO {
  discountPercent?: number;
  validUntil?: string;
  maxUses?: number;
  minPurchase?: number;
  isActive?: boolean;
}

export interface PromotionValidationResponse {
  valid: boolean;
  promotion?: {
    id: string;
    code: string;
    discountPercent: number;
    discountAmount: number;
    validUntil: string;
    minPurchase?: number;
  };
}

export interface EventFilters {
  category?: string;
  location?: string;
  search?: string;
  status?: Event["status"];
  page?: number;
  limit?: number;
  searchTerm?: string;
  priceRange: {
    min?: number;
    max?: number;
  };
  dateRange: {
    start?: string;
    end?: string;
  };
  isPromotionOnly?: boolean;

  sortBy?: "date" | "popularity" | "price";
  sortOrder?: "asc" | "desc";
  organizerId?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  hasPromotion?: boolean;
  hasReviews?: boolean;
  averageRating?: { min?: number; max?: number };
  availableSeats?: { min?: number; max?: number };
  totalSeats?: { min?: number; max?: number };
  pointsUsed?: { min?: number; max?: number };
  paymentMethod?: string;
  statusFilter?:
    | "WAITING_PAYMENT"
    | "WAITING_CONFIRM"
    | "DONE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  paymentDeadline?: { before?: string; after?: string };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CreateEventResponse {
  message: string;
  event: Event;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: {
    message: string;
    token: string;
    user: User;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationError[];
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    byStatus: Record<string, number>;
  };
}

// Re-export from event.ts
export type {
  EventCategoryInfo,
  EventFormData,
  EventFilters as EventFiltersDetailed,
  Location,
} from "./event";
