// Validation messages dengan context yang lebih spesifik
export const validationMessages = {
  // Event Field Validations
  title: {
    required: "Judul acara wajib diisi",
    minLength: "Judul acara minimal 3 karakter",
    maxLength: "Judul acara maksimal 100 karakter",
  },

  description: {
    required: "Deskripsi acara wajib diisi",
    minLength: "Deskripsi minimal 10 karakter",
    maxLength: "Deskripsi maksimal 1000 karakter",
  },

  location: {
    required: "Lokasi acara wajib diisi",
    minLength: "Lokasi minimal 5 karakter",
  },

  dates: {
    startRequired: "Tanggal mulai wajib diisi",
    endRequired: "Tanggal selesai wajib diisi",
    endAfterStart: "Tanggal selesai harus setelah tanggal mulai",
    pastDate: "Tanggal tidak boleh di masa lalu",
  },

  times: {
    startRequired: "Waktu mulai wajib diisi",
    endRequired: "Waktu selesai wajib diisi",
    endAfterStart:
      "Waktu selesai harus setelah waktu mulai untuk acara di hari yang sama",
  },

  pricing: {
    priceRequired: "Harga tiket wajib diisi untuk acara berbayar",
    pricePositive: "Harga tiket harus lebih besar dari 0",
    priceMax: "Harga tiket maksimal Rp 100.000.000",
  },

  capacity: {
    seatsRequired: "Jumlah kursi wajib diisi",
    seatsPositive: "Jumlah kursi harus lebih besar dari 0",
    seatsMax: "Jumlah kursi maksimal 100.000",
  },

  promotion: {
    discountRange: "Persentase diskon harus antara 1-99%",
    codeRequired: "Kode promosi wajib diisi",
    codeFormat: "Kode promosi harus terdiri dari huruf dan angka",
    validUntilRequired: "Tanggal berlaku sampai wajib diisi",
    validUntilFuture: "Tanggal berlaku sampai harus di masa depan",
    maxUsesPositive: "Maksimal penggunaan harus lebih besar dari 0",
    minPurchasePositive: "Minimal pembelian harus lebih besar dari 0",
  },

  // General validations
  general: {
    required: "Field ini wajib diisi",
    invalidFormat: "Format tidak valid",
    invalidEmail: "Format email tidak valid",
    invalidUrl: "Format URL tidak valid",
    tooLong: "Teks terlalu panjang",
    tooShort: "Teks terlalu pendek",
  },
} as const;
