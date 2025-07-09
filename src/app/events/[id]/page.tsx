"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Star,
  Tag,
  Share2,
  Heart,
  Ticket,
  Shield,
  ChevronRight,
  MessageCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  Event,
  Review,
  Promotion,
  CreatePromotionDTO,
  UpdatePromotionDTO,
} from "@/types";
import { eventsAPI, promotionsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PromotionModal from "@/components/events/PromotionModal";
import PromotionList from "@/components/events/PromotionList";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Promotion management states
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        setError(null);
        const eventData = await eventsAPI.getEvent(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to load event:", error);
        setError("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM dd, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const handleBookTicket = () => {
    if (!event) return;
    // Navigate to booking page
    router.push(`/events/${event.id}/book`);
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing failed:", error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would make an API call to save/remove bookmark
  };

  const getBookingPercentage = () => {
    if (!event) return 0;
    const booked = event.totalSeats - (event.availableSeats || 0);
    return Math.min(100, Math.max(0, (booked / event.totalSeats) * 100));
  };

  // Promotion management functions
  const canManageEvent = useCallback(() => {
    return (
      user &&
      event &&
      (user.role === "ADMIN" ||
        (user.role === "ORGANIZER" && user.id === event.organizerId))
    );
  }, [user, event]);

  const loadPromotions = useCallback(async () => {
    if (!event || !canManageEvent()) return;

    try {
      setLoadingPromotions(true);
      const allPromotions = await promotionsAPI.getMyPromotions();
      // Filter promotions for this specific event
      const eventPromotions = allPromotions.filter(
        (p) => !p.event || p.event.id === event.id
      );
      setPromotions(eventPromotions);
    } catch (error) {
      console.error("Failed to load promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoadingPromotions(false);
    }
  }, [event, canManageEvent]);

  const handleCreatePromotion = async (data: CreatePromotionDTO) => {
    try {
      const response = await promotionsAPI.createPromotion(data);
      setPromotions((prev) => [response.promotion, ...prev]);
      toast.success("Promotion created successfully!");
    } catch (error) {
      console.error("Failed to create promotion:", error);
      throw error;
    }
  };

  const handleUpdatePromotion = async (data: UpdatePromotionDTO) => {
    if (!editingPromotion) return;

    try {
      const response = await promotionsAPI.updatePromotion(
        editingPromotion.id,
        data
      );
      setPromotions((prev) =>
        prev.map((p) => (p.id === editingPromotion.id ? response.promotion : p))
      );
      setEditingPromotion(null);
      toast.success("Promotion updated successfully!");
    } catch (error) {
      console.error("Failed to update promotion:", error);
      throw error;
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await promotionsAPI.deletePromotion(promotionId);
      setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
      toast.success("Promotion deleted successfully!");
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const handleTogglePromotionStatus = async (
    promotionId: string,
    isActive: boolean
  ) => {
    try {
      const response = await promotionsAPI.updatePromotion(promotionId, {
        isActive,
      });
      setPromotions((prev) =>
        prev.map((p) => (p.id === promotionId ? response.promotion : p))
      );
      toast.success(
        `Promotion ${isActive ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Failed to toggle promotion status:", error);
      toast.error("Failed to update promotion status");
    }
  };

  const handleOpenPromotionModal = () => {
    setEditingPromotion(null);
    setShowPromotionModal(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setShowPromotionModal(true);
  };

  const handlePromotionSubmit = async (
    data: CreatePromotionDTO | UpdatePromotionDTO
  ) => {
    if (editingPromotion) {
      await handleUpdatePromotion(data as UpdatePromotionDTO);
    } else {
      await handleCreatePromotion(data as CreatePromotionDTO);
    }
  };

  const handleClosePromotionModal = () => {
    setShowPromotionModal(false);
    setEditingPromotion(null);
  };

  // Load promotions when event loads
  useEffect(() => {
    if (event && canManageEvent()) {
      loadPromotions();
    }
  }, [event, canManageEvent, loadPromotions]);

  const renderReviews = () => {
    if (!event?.reviews || event.reviews.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reviews yet</p>
        </div>
      );
    }

    const reviewsToShow = showAllReviews
      ? event.reviews
      : event.reviews.slice(0, 3);

    return (
      <div className="space-y-6">
        {reviewsToShow.map((review: Review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {review.user?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">
                    {review.user?.name || "Anonymous"}
                  </h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {event.reviews.length > 3 && !showAllReviews && (
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowAllReviews(true)}>
              Show All Reviews ({event.reviews.length})
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/events" className="hover:text-blue-600">
                Events
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 truncate max-w-32">
                {event.title}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <Card className="overflow-hidden">
              {/* Event Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-blue-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge variant={event.isFree ? "success" : "default"}>
                    {event.isFree ? "Free Event" : formatPrice(event.price)}
                  </Badge>
                  <Badge variant="info" className="capitalize">
                    {event.category.toLowerCase()}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleBookmark}
                    className={`bg-white/90 backdrop-blur-sm ${
                      isBookmarked ? "text-red-600" : ""
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-6 text-black">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">
                          {event.averageRating?.toFixed(1) || "0.0"}
                        </span>
                        <span>({event.reviews?.length || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.availableSeats} seats available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {formatDate(event.startDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(event.startDate)} -{" "}
                          {formatTime(event.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{event.location}</p>
                        <p className="text-sm text-gray-600">Venue Location</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          by {event.organizer?.name || "Unknown Organizer"}
                        </p>
                        <p className="text-sm text-black">Event Organizer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {event.totalSeats} Total Seats
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.totalSeats - (event.availableSeats || 0)}{" "}
                          already booked
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    About This Event
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Promotion */}
            {event.promotion && event.promotion.isActive && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Special Promotion Available!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-700 font-semibold">
                      Code: {event.promotion.code}
                    </p>
                    <p className="text-green-600">
                      Get {event.promotion.discountPercent}% off
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">
                      Valid until:{" "}
                      {format(
                        new Date(event.promotion.validUntil),
                        "MMM dd, yyyy"
                      )}
                    </p>
                    <p className="text-sm text-green-600">
                      Min. purchase:{" "}
                      {formatPrice(event.promotion.minPurchase || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">
                  Reviews ({event.reviews?.length || 0})
                </h3>
                {event.averageRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(event.averageRating!)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      {event.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {renderReviews()}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {event.isFree ? "Free" : formatPrice(event.price)}
                </div>
                {!event.isFree && (
                  <p className="text-sm text-gray-600">per ticket</p>
                )}
              </div>{" "}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available Seats</span>
                  <span className="font-semibold text-black">
                    {event.availableSeats || 0} / {event.totalSeats}
                  </span>
                </div>
                <ProgressBar percentage={getBookingPercentage()} />
              </div>
              <Button
                onClick={handleBookTicket}
                className="w-full mb-4"
                size="lg"
                disabled={
                  (event.availableSeats || 0) === 0 ||
                  event.status !== "UPCOMING"
                }
              >
                <Ticket className="h-5 w-5 mr-2" />
                {(event.availableSeats || 0) === 0
                  ? "Sold Out"
                  : event.status !== "UPCOMING"
                  ? "Event Ended"
                  : "Book Ticket"}
              </Button>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Secure booking • Instant confirmation
                </p>
              </div>
            </Card>

            {/* Organizer Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Event Organizer
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {event.organizer?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-semibold text-black">
                    {event.organizer?.name || "Unknown Organizer"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.organizer?.email || ""}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Contact Organizer
              </Button>
            </Card>

            {/* Promotion Management - Only for Organizers and Admins */}
            {canManageEvent() && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    Promotion Management
                  </h3>
                  <Button
                    onClick={handleOpenPromotionModal}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Promotion
                  </Button>
                </div>

                {loadingPromotions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <PromotionList
                    promotions={promotions}
                    onEdit={handleEditPromotion}
                    onDelete={handleDeletePromotion}
                    onToggleStatus={handleTogglePromotionStatus}
                  />
                )}
              </Card>
            )}

            {/* Quick Info */}
            <Card className="p-6 text-black">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Event Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium capitalize">
                    {event.category.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="success" size="sm">
                    {event.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {format(new Date(event.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={showPromotionModal}
        onClose={handleClosePromotionModal}
        onSubmit={handlePromotionSubmit}
        eventId={eventId}
        promotion={editingPromotion}
        mode={editingPromotion ? "edit" : "create"}
      />
    </div>
  );
}
