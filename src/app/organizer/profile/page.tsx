"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, Calendar, MessageSquare, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    startDate: string;
  };
}

interface OrganizerStats {
  totalEvents: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
  reviews: Review[];
}

const StarRating = ({
  rating,
  showNumber = true,
}: {
  rating: number;
  showNumber?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

const RatingDistribution = ({
  distribution,
}: {
  distribution: { [key: string]: number };
}) => {
  const total = Object.values(distribution).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={rating} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm">{rating}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300 absolute top-0 left-0"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function OrganizerProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "recent" | "high" | "low"
  >("all");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "ORGANIZER") {
      toast.error("Access denied. Organizer account required.");
      router.push("/events");
      return;
    }

    fetchOrganizerStats();
  }, [user, router]);

  const fetchOrganizerStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const data = await usersAPI.getOrganizerProfileWithStats(user.id);

      // Transform API response to match our interface
      const transformedStats: OrganizerStats = {
        totalEvents: data.stats.totalEvents,
        totalReviews: data.stats.totalReviews,
        averageRating: data.stats.averageRating,
        ratingDistribution: {
          "5": data.stats.ratingDistribution.star5,
          "4": data.stats.ratingDistribution.star4,
          "3": data.stats.ratingDistribution.star3,
          "2": data.stats.ratingDistribution.star2,
          "1": data.stats.ratingDistribution.star1,
        },
        reviews: data.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment || "",
          createdAt: review.createdAt,
          user: {
            id: review.user?.id || "",
            fullName: review.user?.name || "Anonymous User",
            email: "user@example.com", // Default email since it's not in API response
          },
          event: {
            id: review.event.id,
            title: review.event.title,
            startDate: review.event.startDate || "",
          },
        })),
      };

      setStats(transformedStats);
    } catch (error) {
      console.error("Error fetching organizer stats:", error);
      toast.error("Failed to load organizer statistics");

      // Mock data untuk development jika API gagal
      setStats({
        totalEvents: 12,
        totalReviews: 45,
        averageRating: 4.3,
        ratingDistribution: {
          "5": 20,
          "4": 15,
          "3": 7,
          "2": 2,
          "1": 1,
        },
        reviews: [
          {
            id: "1",
            rating: 5,
            comment:
              "Event yang sangat bagus! Organisasi rapi dan speaker berkualitas. Recommended!",
            createdAt: "2025-07-05T10:30:00Z",
            user: {
              id: "u1",
              fullName: "Ahmad Rizki",
              email: "ahmad@example.com",
            },
            event: {
              id: "e1",
              title: "Tech Conference 2025",
              startDate: "2025-07-01T09:00:00Z",
            },
          },
          {
            id: "2",
            rating: 4,
            comment:
              "Event bagus, tapi sound system agak bermasalah. Overall satisfied.",
            createdAt: "2025-07-04T15:20:00Z",
            user: {
              id: "u2",
              fullName: "Siti Nurhaliza",
              email: "siti@example.com",
            },
            event: {
              id: "e2",
              title: "Digital Marketing Workshop",
              startDate: "2025-06-30T14:00:00Z",
            },
          },
          {
            id: "3",
            rating: 5,
            comment:
              "Luar biasa! Venue nyaman, materi berkualitas, networking juga bagus. Will attend again!",
            createdAt: "2025-07-03T09:15:00Z",
            user: {
              id: "u3",
              fullName: "Budi Santoso",
              email: "budi@example.com",
            },
            event: {
              id: "e3",
              title: "Startup Pitch Competition",
              startDate: "2025-06-28T18:00:00Z",
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getFilteredReviews = () => {
    if (!stats) return [];

    const reviews = [...stats.reviews];

    switch (selectedFilter) {
      case "recent":
        return reviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "high":
        return reviews
          .filter((r) => r.rating >= 4)
          .sort((a, b) => b.rating - a.rating);
      case "low":
        return reviews
          .filter((r) => r.rating <= 3)
          .sort((a, b) => a.rating - b.rating);
      default:
        return reviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Data Available
            </h1>
            <p className="text-gray-600 mb-6">
              Unable to load organizer statistics at this time.
            </p>
            <Button onClick={fetchOrganizerStats}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Profile & Reviews
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.fullName}! Here&apos;s your performance
              overview.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/events")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Reviews
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalReviews}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Rating
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEvents > 0
                      ? Math.round(
                          (stats.totalReviews / stats.totalEvents) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingDistribution distribution={stats.ratingDistribution} />
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews from Attendees</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedFilter === "all" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        selectedFilter === "recent" ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedFilter("recent")}
                    >
                      Recent
                    </Button>
                    <Button
                      variant={
                        selectedFilter === "high" ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedFilter("high")}
                    >
                      High Rating
                    </Button>
                    <Button
                      variant={selectedFilter === "low" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("low")}
                    >
                      Low Rating
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getFilteredReviews().length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-gray-600">
                        No reviews found for the selected filter.
                      </p>
                    </div>
                  ) : (
                    getFilteredReviews().map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {review.user.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {review.user.fullName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDateTime(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <StarRating
                                rating={review.rating}
                                showNumber={false}
                              />
                              <Badge variant="default" className="text-xs">
                                {review.event.title}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed pl-11">
                            &quot;{review.comment}&quot;
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
