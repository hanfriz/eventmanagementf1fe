"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { transactionsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types";

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

interface Ticket extends Transaction {
  canReview: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "WAITING_PAYMENT":
      return "bg-yellow-100 text-yellow-800";
    case "WAITING_CONFIRM":
      return "bg-blue-100 text-blue-800";
    case "DONE":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "WAITING_PAYMENT":
      return "Menunggu Pembayaran";
    case "WAITING_CONFIRM":
      return "Menunggu Konfirmasi";
    case "DONE":
      return "Selesai";
    case "REJECTED":
      return "Ditolak";
    case "EXPIRED":
      return "Kadaluarsa";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status;
  }
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingTicketId, setUploadingTicketId] = useState<string | null>(
    null
  );
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const data = await transactionsAPI.getMyTickets();

      // Map transactions to tickets with canReview logic
      const mappedTickets: Ticket[] = (data || []).map((transaction) => ({
        ...transaction,
        canReview:
          transaction.status === "DONE" && transaction.event?.endDate
            ? new Date(transaction.event.endDate) < new Date()
            : false,
      }));

      setTickets(mappedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const uploadPaymentProof = async (ticketId: string) => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setUploadingTicketId(ticketId);

    try {
      // Convert image to base64 for demo purposes
      // In a real app, you would upload to a cloud storage service
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/transactions/${ticketId}/payment-proof`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentProof: base64,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload payment proof");
        }

        alert("Payment proof uploaded successfully!");
        setSelectedImage(null);
        fetchMyTickets(); // Refresh the list
      };

      reader.readAsDataURL(selectedImage);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to upload payment proof"
      );
    } finally {
      setUploadingTicketId(null);
    }
  };

  const getTimeRemaining = (deadline: string | null) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading your tickets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiket Saya</h1>
        <p className="text-gray-600">Kelola dan lihat semua tiket event Anda</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada tiket
          </h3>
          <p className="text-gray-500">
            Anda belum memiliki tiket event apapun.
          </p>
          <Button className="mt-4">
            <Link href="/events">Jelajahi Event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Image */}
                <div className="lg:w-48 lg:flex-shrink-0">
                  <OptimizedImage
                    src={ticket.event?.image || "/placeholder-event.jpg"}
                    alt={ticket.event?.title || "Event"}
                    width={192}
                    height={128}
                    className="w-full h-32 lg:h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {ticket.event?.title || "Unknown Event"}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📍 {ticket.event?.location || "Location TBD"}</p>
                        <p>
                          📅{" "}
                          {ticket.event?.startDate
                            ? formatDate(ticket.event.startDate)
                            : "Date TBD"}
                        </p>
                        <p>
                          👤{" "}
                          {ticket.event?.organizer?.name || "Unknown Organizer"}
                        </p>
                        <p>💰 {formatCurrency(ticket.finalAmount)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Actions */}
                  {ticket.status === "WAITING_PAYMENT" && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-yellow-800">
                          Upload Bukti Pembayaran
                        </h4>
                        {ticket.paymentDeadline && (
                          <span className="text-sm text-yellow-700">
                            {getTimeRemaining(ticket.paymentDeadline)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          placeholder="Pilih file bukti pembayaran"
                          title="Upload bukti pembayaran"
                          className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        />
                        <Button
                          onClick={() => uploadPaymentProof(ticket.id)}
                          disabled={
                            !selectedImage || uploadingTicketId === ticket.id
                          }
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          {uploadingTicketId === ticket.id
                            ? "Uploading..."
                            : "Upload"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Waiting for Confirmation */}
                  {ticket.status === "WAITING_CONFIRM" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Menunggu Konfirmasi Organizer
                      </h4>
                      <p className="text-sm text-blue-700">
                        Bukti pembayaran Anda sedang ditinjau oleh organizer.
                        Proses ini biasanya memakan waktu 1-3 hari kerja.
                      </p>
                      {ticket.paymentProof && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-600">
                            ✅ Bukti pembayaran telah diupload
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Ticket */}
                  {ticket.status === "DONE" && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        ✅ Tiket Terkonfirmasi
                      </h4>
                      <p className="text-sm text-green-700">
                        Tiket Anda telah dikonfirmasi. Silakan datang ke venue
                        sesuai jadwal.
                      </p>
                      {ticket.canReview && (
                        <Button
                          className="mt-2 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          Berikan Review
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Rejected/Expired/Cancelled */}
                  {(ticket.status === "REJECTED" ||
                    ticket.status === "EXPIRED" ||
                    ticket.status === "CANCELLED") && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">
                        {ticket.status === "REJECTED" && "❌ Tiket Ditolak"}
                        {ticket.status === "EXPIRED" && "⏰ Tiket Kadaluarsa"}
                        {ticket.status === "CANCELLED" && "🚫 Tiket Dibatalkan"}
                      </h4>
                      <p className="text-sm text-red-700">
                        {ticket.status === "REJECTED" &&
                          "Bukti pembayaran Anda ditolak oleh organizer. Silakan hubungi organizer untuk informasi lebih lanjut."}
                        {ticket.status === "EXPIRED" &&
                          "Waktu pembayaran telah habis. Transaksi ini telah dibatalkan secara otomatis."}
                        {ticket.status === "CANCELLED" &&
                          "Transaksi ini telah dibatalkan."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
