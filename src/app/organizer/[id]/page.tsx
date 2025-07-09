"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Calendar, MapPin, Mail, Verified } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { usersAPI } from "@/lib/api";
import { User, Event, Review } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface OrganizerProfile {
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
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const organizerId = params.id as string;

  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "reviews">("events");

  useEffect(() => {
    loadOrganizerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizerId]);

  const loadOrganizerProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await usersAPI.getOrganizerProfileWithStats(
        organizerId
      );
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading organizer profile:", error);
      setError("Gagal memuat profil organizer");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = (
    distribution: {
      star5: number;
      star4: number;
      star3: number;
      star2: number;
      star1: number;
    },
    total: number
  ) => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            distribution[`star${star}` as keyof typeof distribution] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-8">
                <span>{star}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                <div
                  className={`bg-yellow-400 h-2 rounded-full transition-all absolute left-0 top-0`}
                  style={{
                    width: `${Math.min(100, Math.max(0, percentage))}%`,
                  }}
                />
              </div>
              <span className="text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profil Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Organizer yang Anda cari tidak ditemukan."}
          </p>
          <Link href="/events">
            <Button>Kembali ke Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <OptimizedImage
              src={profile.user.profilePicture || "/api/placeholder/150/150"}
              alt={profile.user.fullName || "Organizer"}
              width={150}
              height={150}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.user.fullName || "Unknown Organizer"}
                </h1>
                <Verified className="h-6 w-6 text-blue-500" />
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(profile.stats.averageRating, "lg")}
                  <span className="text-lg font-semibold ml-2">
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({profile.stats.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{profile.user.email}</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.stats.totalEvents}
                  </div>
                  <div className="text-gray-600">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.stats.totalReviews}
                  </div>
                  <div className="text-gray-600">Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-shrink-0 w-full md:w-64">
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">
                Rating Distribution
              </h3>
              {renderRatingDistribution(
                profile.stats.ratingDistribution,
                profile.stats.totalReviews
              )}
            </Card>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("events")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "events"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Events ({profile.stats.totalEvents})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reviews ({profile.stats.totalReviews})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "events" && (
        <div>
          {profile.events.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Event
              </h3>
              <p className="text-gray-600">
                Organizer ini belum membuat event apapun.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <OptimizedImage
                    src={event.image || "/api/placeholder/400/200"}
                    alt={event.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.startDate), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={event.isFree ? "success" : "default"}>
                        {event.isFree ? "Gratis" : formatCurrency(event.price)}
                      </Badge>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div>
          {profile.reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Review
              </h3>
              <p className="text-gray-600">
                Organizer ini belum memiliki review dari peserta.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <OptimizedImage
                      src={review.user?.avatar || "/api/placeholder/40/40"}
                      alt={review.user?.name || "User"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </h4>
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Event:{" "}
                        <Link
                          href={`/events/${review.event.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.event.title}
                        </Link>
                      </p>

                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
