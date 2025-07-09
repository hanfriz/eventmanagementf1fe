"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Tag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Event } from "@/types";
import { eventsAPI, transactionsAPI, usersAPI, promotionsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [validPromo, setValidPromo] = useState<{
    id: string;
    code: string;
    discountPercent: number;
    discountAmount: number;
    validUntil: string;
    minPurchase?: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  const eventId = params.id as string;

  // Debug logging
  useEffect(() => {
    console.log("🔍 URL params:", params);
    console.log("🔍 EventId from params:", eventId);
    console.log("🔍 EventId type:", typeof eventId);
    console.log("🔍 EventId length:", eventId?.length);
    console.log(
      "🔍 Is valid UUID format:",
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        eventId
      )
    );
  }, [params, eventId]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk melakukan booking");
      router.push(`/auth/login?redirect=/events/${eventId}/book`);
    }
  }, [user, router, eventId]);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        setError(null);
        const eventData = await eventsAPI.getEvent(eventId);
        setEvent(eventData);

        // Load user points if authenticated
        try {
          const userProfile = await usersAPI.getProfile();
          setUserPoints(userProfile.points || 0);
        } catch (error) {
          console.log("Could not load user points:", error);
        }
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
    return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: id });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const validatePromoCode = async (code: string) => {
    if (!code.trim() || !event) return;

    setIsValidatingPromo(true);
    try {
      const response = await promotionsAPI.validatePromotion(
        code,
        eventId,
        event.price * quantity
      );

      if (response.valid) {
        setValidPromo(response.promotion);
        toast.success(
          `Promo code applied! Get ${response.promotion.discountPercent}% off`
        );
      } else {
        setValidPromo(null);
        toast.error("Invalid or expired promo code");
      }
    } catch (error) {
      console.error("Error validating promo:", error);
      setValidPromo(null);
      toast.error("Failed to validate promo code");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    let total = event.price * quantity;
    let discountFromPoints = 0;
    let discountFromPromo = 0;

    // Apply points discount (1 point = 1 IDR)
    discountFromPoints = Math.min(pointsToUse, userPoints, total);
    total = total - discountFromPoints;

    // Apply promotion discount
    if (validPromo && promoCode.trim()) {
      discountFromPromo = total * (validPromo.discountPercent / 100);
      total = total - discountFromPromo;
    }

    return {
      originalTotal: event.price * quantity,
      pointsDiscount: discountFromPoints,
      promoDiscount: discountFromPromo,
      finalTotal: Math.max(0, total),
    };
  };

  const handleBooking = async () => {
    if (!event) return;

    setIsProcessing(true);
    setError(null);

    try {
      const bookingData = {
        eventId: eventId,
        quantity: quantity,
        pointsUsed: pointsToUse > 0 ? pointsToUse : undefined,
        promoCode: validPromo ? promoCode : undefined,
      };

      console.log("🔍 Booking data being sent:", bookingData);
      console.log("🔍 EventId type:", typeof eventId, "Value:", eventId);

      const response = await transactionsAPI.createTransaction(bookingData);

      if (response.data) {
        setShowSuccessModal(true);
        toast.success("Booking berhasil!");
      } else {
        throw new Error(response.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to my bookings page
    router.push("/my-bookings");
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
            {error || "The event you're trying to book doesn't exist."}
          </p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const maxQuantity = Math.min(10, event.availableSeats || 0);
  const calculation = calculateTotal();
  const { originalTotal, pointsDiscount, promoDiscount, finalTotal } =
    typeof calculation === "object"
      ? calculation
      : {
          originalTotal: 0,
          pointsDiscount: 0,
          promoDiscount: 0,
          finalTotal: 0,
        };

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
            <h1 className="text-xl font-semibold text-black">Book Event</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-black">
                {event.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-black">
                      {formatDate(event.startDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.startDate)} -{" "}
                      {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-black">{event.location}</p>
                    <p className="text-sm text-gray-600">Venue</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant={event.isFree ? "success" : "default"}>
                  {event.isFree ? "Free Event" : formatPrice(event.price)}
                </Badge>
                <Badge variant="info" className="capitalize">
                  {event.category.toLowerCase()}
                </Badge>
              </div>

              <p className="text-gray-600">{event.description}</p>
            </Card>

            {/* Booking Form */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Booking Details
              </h3>

              <div className="space-y-6">
                {/* Quantity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold px-4">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuantity(Math.min(maxQuantity, quantity + 1))
                      }
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </Button>
                    <span className="text-sm text-gray-600 ml-2">
                      Max: {maxQuantity} tickets
                    </span>
                  </div>
                </div>

                {/* Points Usage */}
                {userPoints > 0 && !event.isFree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use Points (1 point = IDR 1)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max={Math.min(userPoints, originalTotal)}
                        value={pointsToUse}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxUsable = Math.min(userPoints, originalTotal);
                          setPointsToUse(
                            Math.min(Math.max(0, value), maxUsable)
                          );
                        }}
                        placeholder="0"
                        className="w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPointsToUse(Math.min(userPoints, originalTotal))
                        }
                      >
                        Use All
                      </Button>
                      <span className="text-sm text-gray-600">
                        Available: {userPoints} points
                      </span>
                    </div>
                    {pointsToUse > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          You&apos;ll save {formatPrice(pointsToUse)} with
                          points
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => validatePromoCode(promoCode)}
                      disabled={!promoCode.trim() || isValidatingPromo}
                    >
                      {isValidatingPromo ? "Validating..." : "Apply"}
                    </Button>
                  </div>
                  {validPromo && promoCode.trim() && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Promo code applied! Get {validPromo.discountPercent}%
                        off
                      </span>
                    </div>
                  )}
                  {!validPromo && promoCode.trim() && !isValidatingPromo && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Invalid or expired promo code
                      </span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {(event.availableSeats || 0) <= 10 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Only {event.availableSeats} seats left! Book now to
                        secure your spot.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="text-black">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium text-right">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per ticket</span>
                  <span className="font-medium">
                    {event.isFree ? "Free" : formatPrice(event.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{quantity}</span>
                </div>

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points discount</span>
                    <span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-gray-500 line-through">
                      <span>Subtotal</span>
                      <span>{formatPrice(originalTotal - pointsDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>
                        Promo discount ({validPromo?.discountPercent}%)
                      </span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  </>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  className="w-full"
                  size="lg"
                  disabled={
                    isProcessing || (event.availableSeats || 0) < quantity
                  }
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isProcessing ? "Processing..." : "Book Now"}
                </Button>

                <div className="text-center text-xs text-gray-500">
                  <p>🔒 Secure booking • Instant confirmation</p>
                  <p>Free cancellation up to 24 hours before event</p>
                </div>
              </div>

              {/* Event Info */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Event Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {event.availableSeats} seats available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 capitalize">
                      {event.category.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Booking Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your booking for <strong>{event?.title}</strong> has been
                confirmed.
                {finalTotal > 0 ? (
                  <span>
                    {" "}
                    Please proceed with payment to secure your tickets.
                  </span>
                ) : (
                  <span> Your free tickets have been reserved!</span>
                )}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleSuccessModalClose}
                  className="w-full"
                  size="lg"
                >
                  View My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}`)}
                  className="w-full"
                  size="lg"
                >
                  View Event Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
