"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  User,
  Star,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { transactionsAPI } from "@/lib/api";
import { Transaction } from "@/types";
import toast from "react-hot-toast";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "WAITING_PAYMENT":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Timer,
        text: "Menunggu Pembayaran",
      };
    case "WAITING_CONFIRM":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertCircle,
        text: "Menunggu Konfirmasi",
      };
    case "DONE":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        text: "Terkonfirmasi",
      };
    case "REJECTED":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        text: "Ditolak",
      };
    case "EXPIRED":
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
        text: "Kadaluarsa",
      };
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        text: "Dibatalkan",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
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

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await transactionsAPI.getMyTransactions();
      // Ensure data is always an array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Gagal memuat data booking");
      setBookings([]); // Ensure bookings is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadPaymentProof = async (bookingId: string) => {
    if (!selectedFile) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }

    setUploadingId(bookingId);

    try {
      // In a real app, you would upload to cloud storage
      // For now, we'll convert to base64 as a placeholder
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;

          await transactionsAPI.uploadPaymentProof(bookingId, base64);
          toast.success("Bukti pembayaran berhasil diupload!");
          setSelectedFile(null);
          fetchMyBookings();
        } catch (error) {
          console.error("Error uploading payment proof:", error);
          toast.error("Gagal mengupload bukti pembayaran");
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast.error("Gagal mengupload bukti pembayaran");
    } finally {
      setUploadingId(null);
    }
  };

  if (user?.role !== "CUSTOMER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Halaman ini hanya dapat diakses oleh customer.
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Kelola semua booking event Anda di sini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Menunggu Pembayaran</p>
              <p className="text-xl font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "WAITING_PAYMENT")
                      .length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Menunggu Konfirmasi</p>
              <p className="text-xl font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "WAITING_CONFIRM")
                      .length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Terkonfirmasi</p>
              <p className="text-xl font-bold">
                {Array.isArray(bookings)
                  ? bookings.filter((b) => b.status === "DONE").length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Booking</p>
              <p className="text-xl font-bold">
                {Array.isArray(bookings) ? bookings.length : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada booking
          </h3>
          <p className="text-gray-600 mb-6">
            Anda belum melakukan booking event apapun
          </p>
          <Link href="/events">
            <Button>Jelajahi Event</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Array.isArray(bookings) ? bookings : [])
            .filter((booking) => booking.event)
            .map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      <div className="lg:w-48 flex-shrink-0">
                        <OptimizedImage
                          src={
                            booking.event!.image || "/api/placeholder/300/200"
                          }
                          alt={booking.event!.title}
                          width={300}
                          height={200}
                          className="w-full h-32 lg:h-32 object-cover rounded-lg"
                        />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {booking.event!.title}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.event!.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(booking.event!.startDate),
                                    "dd MMMM yyyy, HH:mm",
                                    { locale: id }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {booking.event!.organizer?.name ||
                                    "Unknown Organizer"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge
                              className={`${statusConfig.color} border flex items-center gap-1 mb-2`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.text}
                            </Badge>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(booking.finalAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              {format(
                                new Date(booking.createdAt),
                                "dd MMM yyyy",
                                { locale: id }
                              )}
                            </p>
                            <Link href={`/my-bookings/${booking.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Payment Actions */}
                        {booking.status === "WAITING_PAYMENT" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-yellow-800">
                                Upload Bukti Pembayaran
                              </h4>
                              {booking.paymentDeadline && (
                                <CountdownTimer
                                  deadline={booking.paymentDeadline}
                                  onExpire={() => {
                                    toast.error(
                                      "Waktu upload bukti pembayaran telah berakhir"
                                    );
                                    fetchMyBookings(); // Refresh to update status
                                  }}
                                  className="text-sm"
                                />
                              )}
                            </div>

                            {/* Progress indicator */}
                            {booking.paymentDeadline && (
                              <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`bg-yellow-600 h-2 rounded-full transition-all duration-1000`}
                                    style={{
                                      width: `${Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          ((new Date(
                                            booking.paymentDeadline
                                          ).getTime() -
                                            Date.now()) /
                                            (2 * 60 * 60 * 1000)) *
                                            100
                                        )
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                  Deadline:{" "}
                                  {format(
                                    new Date(booking.paymentDeadline),
                                    "dd MMM yyyy, HH:mm",
                                    { locale: id }
                                  )}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => uploadPaymentProof(booking.id)}
                                disabled={
                                  !selectedFile || uploadingId === booking.id
                                }
                                className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {uploadingId === booking.id
                                  ? "Uploading..."
                                  : "Upload"}
                              </Button>
                            </div>
                          </div>
                        )}

                        {booking.status === "WAITING_CONFIRM" && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-800">
                                Menunggu Konfirmasi Organizer
                              </h4>
                            </div>
                            <p className="text-sm text-blue-700">
                              Bukti pembayaran Anda sedang ditinjau. Proses ini
                              biasanya memakan waktu 1-3 hari kerja.
                            </p>
                          </div>
                        )}

                        {booking.status === "DONE" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <h4 className="font-semibold text-green-800">
                                Booking Terkonfirmasi
                              </h4>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                              Selamat! Booking Anda telah dikonfirmasi. Silakan
                              datang ke venue sesuai jadwal.
                            </p>
                            <div className="flex gap-2">
                              {/* Only show review button for paid events */}
                              {booking.finalAmount > 0 &&
                                new Date() >
                                  new Date(booking.event!.endDate) && (
                                  <Link href={`/my-bookings/${booking.id}`}>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Berikan Review
                                    </Button>
                                  </Link>
                                )}
                              <Link href={`/events/${booking.event!.id}`}>
                                <Button variant="outline" size="sm">
                                  Lihat Detail Event
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}

                        {(booking.status === "REJECTED" ||
                          booking.status === "EXPIRED" ||
                          booking.status === "CANCELLED") && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <h4 className="font-semibold text-red-800">
                                {booking.status === "REJECTED" &&
                                  "Booking Ditolak"}
                                {booking.status === "EXPIRED" &&
                                  "Booking Kadaluarsa"}
                                {booking.status === "CANCELLED" &&
                                  "Booking Dibatalkan"}
                              </h4>
                            </div>
                            <p className="text-sm text-red-700">
                              {booking.status === "REJECTED" &&
                                "Bukti pembayaran Anda ditolak. Hubungi organizer untuk informasi lebih lanjut."}
                              {booking.status === "EXPIRED" &&
                                "Waktu pembayaran telah habis. Booking dibatalkan secara otomatis."}
                              {booking.status === "CANCELLED" &&
                                "Booking ini telah dibatalkan."}
                            </p>
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
