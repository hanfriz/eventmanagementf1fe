"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { transactionsAPI, reviewsAPI } from "@/lib/api";
import { Transaction, Review } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { formatDateTime, formatCurrency } from "@/lib/utils";

// Event Image Component with error handling
const EventImage = ({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="mt-2 text-sm">
            {!src ? "No image available" : "Failed to load image"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        priority={false}
      />
    </>
  );
};

// Helper function to get badge color based on status
const getStatusBadgeColor = (status: string | undefined) => {
  switch (status) {
    case "WAITING_PAYMENT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "WAITING_CONFIRMATION":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DONE":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const transactionId = params.id as string;

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getTransaction(transactionId);
      const transactionData = response.data;

      if (!transactionData) {
        throw new Error("Transaction not found");
      }

      setTransaction(transactionData);

      // Debug: Log image data
      console.log("Event data:", transactionData.event);
      console.log("Image URL:", transactionData.event?.image);

      // Check if there's an existing review for this booking
      if (transactionData.eventId) {
        try {
          const reviewsData = await reviewsAPI.getEventReviews(
            transactionData.eventId
          );
          const userReview = reviewsData.reviews.find(
            (review) =>
              review.userId === user?.id &&
              review.eventId === transactionData.eventId
          );
          if (userReview) {
            setExistingReview(userReview);
          }
        } catch {
          // No reviews yet, which is fine
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to load booking details");
      router.push("/my-bookings");
    } finally {
      setLoading(false);
    }
  }, [transactionId, user?.id, router]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchBookingDetails();
  }, [user, fetchBookingDetails, router]);

  const canReview = () => {
    if (!transaction || existingReview) return false;

    // Can only review if the transaction is DONE (event completed)
    return transaction.status === "DONE";
  };

  const handleSubmitReview = async () => {
    if (!transaction || !rating) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewsAPI.createReview({
        eventId: transaction.eventId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      fetchBookingDetails(); // Refresh to show the new review
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStarRating = (
    currentRating: number,
    onRate?: (rating: number) => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            disabled={!onRate}
            className={`${
              onRate ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
          >
            {star <= currentRating ? (
              <svg
                className="h-6 w-6 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The booking you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push("/my-bookings")}>
              Back to My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Booking Details
            </h1>
            <p className="text-gray-600">Transaction ID: {transaction.id}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/my-bookings")}>
            Back to My Bookings
          </Button>
        </div>

        <div className="space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200 relative">
                <EventImage
                  src={transaction.event?.image || ''}
                  alt={transaction.event?.title || "Event Image"}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {transaction.event?.title}
                </h3>
                <p className="text-gray-600 mt-2">
                  {transaction.event?.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900">{transaction.event?.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-gray-900">{transaction.event?.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Start Date
                  </p>
                  <p className="text-gray-900">
                    {transaction.event?.startDate &&
                      formatDateTime(transaction.event.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-gray-900">
                    {transaction.event?.endDate &&
                      formatDateTime(transaction.event.endDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusBadgeColor(transaction.status)}>
                    {transaction.status?.replace("_", " ") ||
                      transaction.status ||
                      "Unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Booking Date
                  </p>
                  <p className="text-gray-900">
                    {transaction.createdAt &&
                      formatDateTime(transaction.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Amount
                  </p>
                  <p className="text-gray-900">
                    {transaction.totalAmount !== undefined &&
                      formatCurrency(transaction.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Points Used
                  </p>
                  <p className="text-gray-900">
                    {transaction.pointsUsed || 0} points
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Final Amount
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {transaction.finalAmount !== undefined &&
                      formatCurrency(transaction.finalAmount)}
                  </p>
                </div>
                {transaction.paymentMethod && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Payment Method
                    </p>
                    <p className="text-gray-900">{transaction.paymentMethod}</p>
                  </div>
                )}
              </div>

              {transaction.paymentDeadline &&
                transaction.status === "WAITING_PAYMENT" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium text-yellow-800">
                        Payment Deadline
                      </p>
                      <CountdownTimer
                        deadline={transaction.paymentDeadline}
                        onExpire={() => {
                          toast.error("Payment deadline expired");
                          fetchBookingDetails(); // Refresh to update status
                        }}
                        className="text-sm"
                      />
                    </div>
                    <p className="text-yellow-700 text-sm">
                      Please upload your payment proof before:{" "}
                      {formatDateTime(transaction.paymentDeadline)}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full transition-all duration-1000 w-full" />
                      </div>
                    </div>
                  </div>
                )}

              {transaction.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-900">{transaction.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Section */}
          {existingReview ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    {existingReview.rating &&
                      renderStarRating(existingReview.rating)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Submitted
                    </p>
                    <p className="text-gray-900">
                      {existingReview.createdAt &&
                        formatDateTime(existingReview.createdAt)}
                    </p>
                  </div>
                </div>
                {existingReview.comment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Comment</p>
                    <p className="text-gray-900">{existingReview.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : canReview() ? (
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
                <p className="text-gray-600">
                  Share your experience with this event
                </p>
              </CardHeader>
              <CardContent>
                {!showReviewForm ? (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                      </label>
                      {renderStarRating(rating, setRating)}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the event..."
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={!rating || isSubmittingReview}
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setRating(0);
                          setComment("");
                        }}
                        disabled={isSubmittingReview}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : transaction.status !== "DONE" ? (
            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can leave a review once the event is completed.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
