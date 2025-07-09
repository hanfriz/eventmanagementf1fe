import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  Event,
  User,
  Transaction,
  Review,
  Promotion,
  EventFilters,
  EventsResponse,
  AuthResponse,
  CreateEventDTO,
  CreateEventResponse,
  CreateTransactionDTO,
  CreateReviewDTO,
  ApiResponse,
  TransactionsResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from cookies
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - remove cookies and redirect to login
      if (typeof window !== "undefined") {
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post(
      "/auth/login",
      { email, password }
    );
    return response.data;
  },

  register: async (
    email: string,
    fullName: string,
    password: string,
    role?: string
  ): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post(
      "/auth/register",
      {
        email,
        fullName,
        password,
        role,
      }
    );
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (filters?: EventFilters): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response: AxiosResponse<ApiResponse<EventsResponse>> = await api.get(
      `/events?${params}`
    );
    return (
      response.data.data || {
        events: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      }
    );
  },

  getEvent: async (id: string): Promise<Event> => {
    const response: AxiosResponse<ApiResponse<Event>> = await api.get(
      `/events/${id}`
    );
    return response.data.data!;
  },

  createEvent: async (
    eventData: CreateEventDTO
  ): Promise<CreateEventResponse> => {
    const response: AxiosResponse<CreateEventResponse> = await api.post(
      "/events",
      eventData
    );
    return response.data;
  },

  updateEvent: async (
    id: string,
    eventData: Partial<CreateEventDTO>
  ): Promise<ApiResponse<Event>> => {
    const response: AxiosResponse<ApiResponse<Event>> = await api.put(
      `/events/${id}`,
      eventData
    );
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/events/${id}`
    );
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (
    userData: Partial<User>
  ): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put(
      "/users/profile",
      userData
    );
    return response.data;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response: AxiosResponse<Event[]> = await api.get("/users/my-events");
    return response.data;
  },

  getOrganizerProfile: async (id: string): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(
      `/users/organizer/${id}`
    );
    return response.data;
  },

  getOrganizerProfileWithStats: async (
    id: string
  ): Promise<{
    user: User;
    stats: {
      totalEvents: number;
      totalReviews: number;
      averageRating: number;
      ratingDistribution: {
        star5: number;
        star4: number;
        star3: number;
        star2: number;
        star1: number;
      };
    };
    events: Event[];
    reviews: Array<
      Review & {
        event: {
          id: string;
          title: string;
        };
      }
    >;
  }> => {
    const response = await api.get(`/users/organizer/${id}/profile-stats`);
    return response.data.data || response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getMyTransactions: async (): Promise<Transaction[]> => {
    const response: AxiosResponse<ApiResponse<TransactionsResponse>> =
      await api.get("/transactions/my-transactions");
    // Backend returns: { data: { data: Transaction[], pagination: {...}, summary: {...} } }
    // We need to extract the nested data.data array
    return response.data.data?.data || [];
  },

  createTransaction: async (
    transactionData: CreateTransactionDTO
  ): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await api.post(
      "/transactions",
      transactionData
    );
    return response.data;
  },

  updateTransactionStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await api.put(
      `/transactions/${id}/status`,
      { status }
    );
    return response.data;
  },

  uploadPaymentProof: async (
    id: string,
    paymentProof: string
  ): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await api.post(
      `/transactions/${id}/payment-proof`,
      { paymentProof }
    );
    return response.data;
  },

  getTransaction: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await api.get(
      `/transactions/${id}`
    );
    return response.data;
  },

  getMyTickets: async (): Promise<Transaction[]> => {
    const response: AxiosResponse<ApiResponse<Transaction[]>> = await api.get(
      "/transactions/my-tickets"
    );
    return response.data.data || [];
  },
};

// Reviews API
export const reviewsAPI = {
  getEventReviews: async (
    eventId: string
  ): Promise<{
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
  }> => {
    const response: AxiosResponse<{
      reviews: Review[];
      averageRating: number;
      totalReviews: number;
    }> = await api.get(`/reviews/event/${eventId}`);
    return response.data;
  },

  createReview: async (
    reviewData: CreateReviewDTO
  ): Promise<ApiResponse<Review>> => {
    const response: AxiosResponse<ApiResponse<Review>> = await api.post(
      "/reviews",
      reviewData
    );
    return response.data;
  },

  updateReview: async (
    id: string,
    reviewData: Partial<CreateReviewDTO>
  ): Promise<ApiResponse<Review>> => {
    const response: AxiosResponse<ApiResponse<Review>> = await api.put(
      `/reviews/${id}`,
      reviewData
    );
    return response.data;
  },

  deleteReview: async (id: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/reviews/${id}`
    );
    return response.data;
  },

  canUserReview: async (
    eventId: string
  ): Promise<{
    canReview: boolean;
    reason?: string;
  }> => {
    const response = await api.get(`/reviews/can-review/${eventId}`);
    return response.data.data || response.data;
  },

  getUserReviewForEvent: async (eventId: string): Promise<Review | null> => {
    try {
      const response = await api.get(`/reviews/my-review/${eventId}`);
      return response.data.data || null;
    } catch {
      // If no review found, return null
      return null;
    }
  },
};

// Promotions API
export const promotionsAPI = {
  validatePromotion: async (
    code: string,
    eventId?: string,
    totalAmount?: number
  ): Promise<{
    valid: boolean;
    promotion: {
      id: string;
      code: string;
      discountPercent: number;
      discountAmount: number;
      validUntil: string;
      minPurchase?: number;
    };
  }> => {
    const response = await api.post("/promotions/validate", {
      code,
      eventId,
      totalAmount,
    });
    return response.data.data || response.data;
  },

  createPromotion: async (
    promotionData: Partial<Promotion>
  ): Promise<{ message: string; promotion: Promotion }> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      data: Promotion;
    }> = await api.post("/promotions", promotionData);
    return { message: response.data.message, promotion: response.data.data };
  },

  getMyPromotions: async (): Promise<Promotion[]> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      data: Promotion[];
    }> = await api.get("/promotions/my-promotions");
    return response.data.data;
  },

  updatePromotion: async (
    id: string,
    promotionData: Partial<Promotion>
  ): Promise<{ message: string; promotion: Promotion }> => {
    const response: AxiosResponse<{
      success: boolean;
      message: string;
      data: Promotion;
    }> = await api.put(`/promotions/${id}`, promotionData);
    return { message: response.data.message, promotion: response.data.data };
  },

  deletePromotion: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await api.delete(`/promotions/${id}`);
    return { message: response.data.message };
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (
    file: File
  ): Promise<{ url: string; publicId: string; originalFilename: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    const response: AxiosResponse<
      ApiResponse<{ url: string; publicId: string; originalFilename: string }>
    > = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data!;
  },

  validateImageUrl: async (
    url: string
  ): Promise<{ url: string; isValid: boolean }> => {
    const response: AxiosResponse<
      ApiResponse<{ url: string; isValid: boolean }>
    > = await api.post("/upload/validate-url", { url });
    return response.data.data!;
  },

  deleteImage: async (publicId: string): Promise<{ message: string }> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> =
      await api.delete(`/upload/image/${publicId}`);
    return response.data.data!;
  },
};

export default api;
