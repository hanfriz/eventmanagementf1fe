"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Banknote,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI } from "@/lib/api";
import { Event } from "@/types";
import toast from "react-hot-toast";

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalAttendees: number;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "UPCOMING":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        text: "Akan Datang",
      };
    case "ACTIVE":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Berlangsung",
      };
    case "ENDED":
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Selesai",
      };
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Dibatalkan",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        text: status,
      };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export default function MyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalAttendees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, you would have an API endpoint for organizer's events
      // For now, we'll simulate this with the general events API with a filter
      const response = await eventsAPI.getEvents({
        organizerId: user?.id,
        priceRange: {},
        dateRange: {},
      });
      setEvents(response.events || []);

      // Calculate stats
      const totalEvents = response.events?.length || 0;
      const upcomingEvents =
        response.events?.filter((e) => e.status === "UPCOMING").length || 0;
      const activeEvents =
        response.events?.filter((e) => e.status === "ACTIVE").length || 0;
      const totalRevenue =
        response.events?.reduce((sum, event) => {
          // This would come from actual transaction data
          return (
            sum + event.price * (event.totalSeats - (event.availableSeats || 0))
          );
        }, 0) || 0;
      const totalAttendees =
        response.events?.reduce((sum, event) => {
          return sum + (event.totalSeats - (event.availableSeats || 0));
        }, 0) || 0;

      setStats({
        totalEvents,
        upcomingEvents,
        activeEvents,
        totalRevenue,
        totalAttendees,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat data event");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === "ORGANIZER") {
      fetchMyEvents();
    }
  }, [user?.role, fetchMyEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      return;
    }

    setDeletingId(eventId);
    try {
      await eventsAPI.deleteEvent(eventId);
      toast.success("Event berhasil dihapus");
      fetchMyEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus event");
    } finally {
      setDeletingId(null);
    }
  };

  if (user?.role !== "ORGANIZER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Halaman ini hanya dapat diakses oleh organizer.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-gray-600">Kelola semua event yang Anda buat</p>
        </div>
        <div className="flex gap-3">
          <Link href="/organizer/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Profile & Reviews
            </Button>
          </Link>
          <Link href="/events/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Event Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Event</p>
              <p className="text-xl font-bold text-black">
                {stats.totalEvents}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Akan Datang</p>
              <p className="text-xl font-bold text-black">
                {stats.upcomingEvents}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Berlangsung</p>
              <p className="text-xl font-bold text-black">
                {stats.activeEvents}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Peserta</p>
              <p className="text-xl font-bold text-black">
                {stats.totalAttendees}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Banknote className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-lg font-bold text-black">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada event
          </h3>
          <p className="text-gray-600 mb-6">
            Anda belum membuat event apapun. Mulai buat event pertama Anda!
          </p>
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Event Pertama
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {events.map((event) => {
            const statusConfig = getStatusConfig(event.status);
            const attendees = event.totalSeats - (event.availableSeats || 0);
            const attendanceRate = (
              (attendees / event.totalSeats) *
              100
            ).toFixed(1);

            return (
              <Card key={event.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event Image */}
                    <div className="lg:w-48 flex-shrink-0">
                      <OptimizedImage
                        src={event.image || "/api/placeholder/300/200"}
                        alt={event.title}
                        width={300}
                        height={200}
                        className="w-full h-32 lg:h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {event.title}
                            </h3>
                            <Badge className={`${statusConfig.color} border`}>
                              {statusConfig.text}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(event.startDate),
                                    "dd MMM yyyy, HH:mm",
                                    { locale: id }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                  {attendees}/{event.totalSeats} peserta (
                                  {attendanceRate}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                <span>
                                  {event.isFree
                                    ? "Gratis"
                                    : formatCurrency(event.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {attendees}
                          </p>
                          <p className="text-xs text-gray-600">Terdaftar</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {event.availableSeats || 0}
                          </p>
                          <p className="text-xs text-gray-600">Tersisa</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {!event.isFree
                              ? formatCurrency(event.price * attendees)
                              : "Rp 0"}
                          </p>
                          <p className="text-xs text-gray-600">Pendapatan</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {attendanceRate}%
                          </p>
                          <p className="text-xs text-gray-600">
                            Tingkat Kehadiran
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Lihat Detail
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/analytics`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deletingId === event.id}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === event.id ? "Menghapus..." : "Hapus"}
                        </Button>
                      </div>

                      {/* Promotion Badge */}
                      {event.promotion && (
                        <div className="mt-3">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            🎟️ Promo: {event.promotion.code} (-
                            {event.promotion.discountPercent}%)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
