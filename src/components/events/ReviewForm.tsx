"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface ReviewFormProps {
  eventId: string;
  eventTitle: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  eventId,
  eventTitle,
  onReviewSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Silakan pilih rating terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewsAPI.createReview({
        eventId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success("Review berhasil dikirim!");

      // Reset form
      setRating(0);
      setComment("");

      // Call callback
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengirim review. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Berikan Review
        </h3>
        <p className="text-gray-600">
          Bagaimana pengalaman Anda mengikuti &quot;{eventTitle}&quot;?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                title={`Rating ${star} bintang`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating === 0
                ? "Pilih rating"
                : rating === 1
                ? "Sangat Buruk"
                : rating === 2
                ? "Buruk"
                : rating === 3
                ? "Cukup"
                : rating === 4
                ? "Baik"
                : "Sangat Baik"}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komentar (Opsional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalaman Anda mengikuti event ini..."
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <div className="mt-1 text-right">
            <span className="text-xs text-gray-500">{comment.length}/500</span>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
          )}
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Mengirim..." : "Kirim Review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
