// src/docs/components.ts
import { ErrorCode } from "../utils/errorCodes";
import { bungkusDaftar, bungkusSukses, contohError, ref, responsError } from "./helpers";

export const components = {
    securitySchemes: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Tempel access token dari POST /login atau POST /refresh (tanpa kata Bearer).",
        },
        refreshAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Tempel refresh token dari POST /auth/login (tanpa kata Bearer).",
        },
    },

    parameters: {
        Page:  { name: "page", in: "query", description: "Nomor halaman (mulai 1)",
            schema: { type: "integer", minimum: 1, default: 1 } },
        Limit: { name: "limit", in: "query", description: "Jumlah data per halaman",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        Order: { name: "order", in: "query", description: "Arah pengurutan",
            schema: { type: "string", enum: ["ASC", "DESC"], default: "DESC" } },
        Q:     { name: "q", in: "query", description: "Kata kunci pencarian",
            schema: { type: "string", maxLength: 100 } },
        IdPath: { name: "id", in: "path", required: true, description: "ID data",
            schema: { type: "integer", minimum: 1 } },
        SortByJurnal: { name: "sortBy", in: "query", description: "Kolom pengurutan",
            schema: { type: "string", enum: ["createdAt", "statusReview"], default: "createdAt" } },
        SortByPeserta: { name: "sortBy", in: "query", description: "Kolom pengurutan",
            schema: { type: "string", enum: ["nama", "fase", "createdAt"], default: "createdAt" } },
        PesertaId: { name: "pesertaId", in: "query", description: "Filter berdasarkan ID peserta",
            schema: { type: "integer", minimum: 1 } },
        StatusReview: { name: "statusReview", in: "query", description: "Filter status review",
            schema: { type: "string", enum: ["belum", "sudah"] } },
        From: { name: "from", in: "query", description: "Tanggal awal (ISO)",
            schema: { type: "string", format: "date", example: "2026-09-01" } },
        To: { name: "to", in: "query", description: "Tanggal akhir (ISO)",
            schema: { type: "string", format: "date", example: "2026-09-30" } },
        BelumDireview: { name: "belumDireview", in: "query", description: "Hanya jurnal yang belum direview",
            schema: { type: "boolean" } },
        Sekolah: { name: "sekolah", in: "query", description: "Filter berdasarkan sekolah",
            schema: { type: "string", maxLength: 100 } },
        Fase: { name: "fase", in: "query", description: "Filter berdasarkan fase",
            schema: { type: "integer", minimum: 1, maximum: 5 } },
    },

    headers: {
        XRequestId: {
            description: "ID unik request, gunakan saat melapor error agar mudah dilacak di log",
            schema: { type: "string", format: "uuid" },
        },
    },

    schemas: {
        PaginationMeta: {
            type: "object",
            properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                total: { type: "integer", example: 42 },
                totalPages: { type: "integer", example: 5 },
                hasNext: { type: "boolean", example: true },
                hasPrev: { type: "boolean", example: false },
            },
        },

        FieldError: {
            type: "object",
            properties: {
                field: { type: "string", example: "email", description: "Nama field; notasi titik untuk objek bersarang (lampiran.1.url)" },
                pesan: { type: "string", example: "Format email tidak valid" },
            },
        },

        ErrorResponse: {
            type: "object",
            properties: {
                sukses: { type: "boolean", example: false },
                error: {
                    type: "object",
                    required: ["kode", "pesan"],
                    properties: {
                        // Diambil langsung dari kode aplikasi: otomatis sinkron dengan ErrorCode
                        kode: { type: "string", enum: Object.values(ErrorCode) },
                        pesan: { type: "string" },
                        detail: { type: "array", items: ref("FieldError") },
                    },
                },
                requestId: { type: "string", format: "uuid" },
            },
        },

        Peserta: {
            type: "object",
            properties: {
                id: { type: "integer", readOnly: true, example: 1 },
                nama: { type: "string", example: "Budi Santoso" },
                sekolah: { type: "string", example: "SMK 5 Malang" },
                email: { type: "string", format: "email", example: "budi@mail.com" },
                fase: { type: "integer", minimum: 1, maximum: 5, example: 1 },
                status: { type: "string", enum: ["aktif", "lulus", "berhenti"] },
                role: { type: "string", enum: ["peserta", "mentor"] },
                telepon: { type: "string", nullable: true, example: "081234567890" },
                createdAt: { type: "string", format: "date-time", readOnly: true },
            },
        },

        PesertaRequest: {
            type: "object",
            required: ["nama", "sekolah", "email", "status", "telepon", "fase", "role", "password"],
            additionalProperties: false,
            properties: {
                nama: {
                    type: "string", maxLength: 50,
                    pattern: "^\\s*\\S[\\s\\S]+\\S\\s*$",
                    description: "Minimal 3 karakter, diawali dan diakhiri karakter bukan spasi",
                },
                sekolah: { type: "string", minLength: 1 },
                email: { type: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
                status: { type: "string", enum: ["aktif", "lulus", "berhenti"] },
                telepon: { type: "string", minLength: 1 },
                fase: { type: "integer", minimum: 1, maximum: 5 },
                skillIds: { type: "array", items: { type: "integer" } },
                role: { type: "string", enum: ["peserta", "mentor"] },
                password: { type: "string", format: "password", writeOnly: true, minLength: 8 },
            },
        },

        RegisterRequest: {
            type: "object",
            required: ["nama", "sekolah", "email", "password", "konfirmasiPassword"],
            additionalProperties: false,   // setara forbidNonWhitelisted: properti asing ditolak
            properties: {
                nama: { type: "string", minLength: 3, maxLength: 100 },
                sekolah: { type: "string", minLength: 3, maxLength: 100 },
                email: { type: "string", format: "email", description: "Dinormalkan: spasi tepi dibuang, jadi huruf kecil" },
                password: {
                    type: "string", format: "password", writeOnly: true,
                    minLength: 8, maxLength: 72,
                    pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$",
                    description: "Wajib mengandung huruf dan angka. Maksimal 72 karakter (batas bcrypt).",
                },
                konfirmasiPassword: { type: "string", format: "password", writeOnly: true, description: "Harus sama dengan password" },
            },
        },

        JurnalAndPeserta: {
            type: "object",
            properties: {
                id: { type: "integer", readOnly: true, example: 1 },
                nama: { type: "string", example: "Budi Santoso" },
                sekolah: { type: "string", example: "SMK 5 Malang" },
                email: { type: "string", format: "email", example: "budi@mail.com" },
                fase: { type: "integer", minimum: 1, maximum: 5, example: 1 },
                status: { type: "string", enum: ["aktif", "lulus", "berhenti"] },
                role: { type: "string", enum: ["peserta", "mentor"] },
                telepon: { type: "string", nullable: true, example: "081234567890" },
                createdAt: { type: "string", format: "date-time", readOnly: true },
                jurnalList: { type: "array", items: ref("Jurnal") },
            },
        },

        LoginRequest: {
            type: "object",
            required: ["email", "password"],
            additionalProperties: false,
            properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", format: "password", writeOnly: true, minLength: 1 },
            },
        },

        UpdateProfilRequest: {
            type: "object",
            additionalProperties: false,
            properties: {
                nama: { type: "string", minLength: 3, maxLength: 100 },
                sekolah: { type: "string", minLength: 3, maxLength: 100 },
                telepon: {
                    type: "string", nullable: true,
                    pattern: "^(\\+62|62|0)8[1-9][0-9]{6,10}$",
                    example: "081234567890",
                },
            },
        },

        Lampiran: {
            type: "object",
            required: ["url"],
            additionalProperties: false,
            properties: {
                url: { type: "string", format: "uri", example: "https://drive.google.com/file/d/abc" },
                keterangan: { type: "string", maxLength: 200, example: "Screenshot halaman login" },
            },
        },

        Jurnal: {
            type: "object",
            properties: {
                id: { type: "integer", readOnly: true, example: 1 },
                pesertaId: { type: "integer", readOnly: true, example: 3 },
                kegiatan: { type: "string", example: "Membuat endpoint login dan refresh token" },
                hambatan: { type: "string", nullable: true, example: "Bingung konfigurasi JWT" },
                rencanaBesok: { type: "string", example: "Menulis test untuk AuthService" },
                linkCommit: { type: "string", format: "uri", nullable: true },
                lampiran: { type: "array", items: ref("Lampiran") },
                statusReview: { type: "string", enum: ["belum", "sudah"], readOnly: true },
                catatan: { type: "string", nullable: true, readOnly: true },
                createdAt: { type: "string", format: "date-time", readOnly: true },
                updatedAt: { type: "string", format: "date-time", readOnly: true },
            },
        },

        CreateJurnalRequest: {
            type: "object",
            required: ["kegiatan", "rencanaBesok"],
            additionalProperties: false,
            properties: {
                kegiatan: { type: "string", minLength: 10, maxLength: 2000 },
                hambatan: { type: "string", maxLength: 2000 },
                rencanaBesok: { type: "string", minLength: 5, maxLength: 2000 },
                linkCommit: { type: "string", format: "uri" },
                lampiran: { type: "array", maxItems: 5, items: ref("Lampiran") },
            },
        },

        UpdateJurnalRequest: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: {
                kegiatan: { type: "string", minLength: 10, maxLength: 2000 },
                hambatan: { type: "string", maxLength: 2000 },
                rencanaBesok: { type: "string", minLength: 5, maxLength: 2000 },
                linkCommit: { type: "string", format: "uri" },
                lampiran: { type: "array", maxItems: 5, items: ref("Lampiran") },
            },
        },

        ReviewJurnalRequest: {
            type: "object",
            required: ["statusReview"],
            additionalProperties: false,
            properties: {
                statusReview: { type: "string", enum: ["belum", "sudah"] },
                catatan: {
                    type: "string",
                    minLength: 5,
                    description: "Wajib diisi jika statusReview bernilai sudah",
                },
            },
        },

        // Pembungkus: bentuk response sukses
        PesertaResponse: bungkusSukses(ref("Peserta")),
        PesertaListResponse: bungkusDaftar(ref("Peserta")),
        JurnalResponse: bungkusSukses(ref("Jurnal")),
        JurnalListResponse: bungkusDaftar(ref("Jurnal")),
        JurnalAndPesertaResponse: bungkusSukses(ref("JurnalAndPeserta")),
        LoginResponse: bungkusSukses({
            type: "object",
            properties: {
                accessToken: { type: "string", description: "Berlaku 15 menit" },
                refreshToken: { type: "string", description: "Berlaku 7 hari, tukarkan di /refresh" },
                peserta: ref("Peserta"),
            },
        }),
        RefreshResponse: bungkusSukses({
            type: "object",
            properties: {
                accessToken: { type: "string", description: "Berlaku 15 menit" },
            },
        }),
        PesanResponse: {
            type: "object",
            properties: {
                sukses: { type: "boolean", example: true },
                pesan: { type: "string", example: "Berhasil" },
            },
        },
        JurnalListTotalResponse: {
            type: "object",
            properties: {
                sukses: { type: "boolean", example: true },
                pesan: { type: "string", example: "Berhasil" },
                data: { type: "array", items: ref("Jurnal") },
                total: { type: "integer", example: 42 },
            },
        },
        JurnalAndPesertaListResponse: {
            type: "object",
            properties: {
                sukses: { type: "boolean", example: true },
                pesan: { type: "string", example: "Berhasil" },
                data: { type: "array", items: ref("JurnalAndPeserta") },
                total: { type: "integer", example: 42 },
            },
        },
    },

    responses: {
        Unauthorized: responsError("Belum login, token tidak valid, atau token kedaluwarsa", {
            tokenHilang: { summary: "Token tidak dikirim", value: contohError("UNAUTHORIZED", "Silakan login terlebih dahulu") },
            tokenKedaluwarsa: { summary: "Access token kedaluwarsa", value: contohError("TOKEN_EXPIRED", "Token sudah kedaluwarsa") },
            tokenPalsu: { summary: "Token tidak valid", value: contohError("INVALID_TOKEN", "Token tidak valid") },
        }),

        PayloadTooLarge: responsError("Ukuran request melebihi batas", {
            default: {
                summary: "Body lebih dari 1 MB",
                value: contohError("PAYLOAD_TOO_LARGE", "Ukuran request terlalu besar"),
            },
        }),

        Forbidden: responsError("Sudah login, tetapi tidak berhak melakukan aksi ini", {
            bukanMentor: { summary: "Aksi khusus mentor", value: contohError("FORBIDDEN", "Kamu tidak berhak melakukan aksi ini") },
            bukanPeserta: { summary: "Aksi khusus peserta", value: contohError("FORBIDDEN", "Kamu tidak berhak melakukan aksi ini") },
            bukanKeduanya: { summary: "Aksi khusus mentor dan peserta", value: contohError("FORBIDDEN", "Kamu tidak berhak melakukan aksi ini") },
            bukanPemilik: { summary: "Bukan pemilik data", value: contohError("FORBIDDEN", "Kamu tidak berhak mengakses data ini") },
        }),

        NotFound: responsError("Data tidak ditemukan", {
            default: { summary: "Data tidak ada", value: contohError("NOT_FOUND", "Data tidak ditemukan") },
        }),

        Conflict: responsError("Bentrok dengan data yang sudah ada", {
            duplikat: { summary: "Nilai unik sudah dipakai", value: contohError("CONFLICT", "Data dengan nilai yang sama sudah ada") },
        }),

        ValidationError: responsError("Input tidak lolos validasi", {
            banyakField: {
                summary: "Beberapa field salah",
                value: contohError("VALIDATION_ERROR", "Validasi gagal", [
                    { field: "email", pesan: "Format email tidak valid" },
                    { field: "password", pesan: "Password minimal 8 karakter" },
                ]),
            },
            propertiAsing: {
                summary: "Properti yang tidak diizinkan (mass assignment)",
                value: contohError("VALIDATION_ERROR", "Validasi gagal", [
                    { field: "role", pesan: "Properti ini tidak diizinkan" },
                ]),
            },
        }),

        TooManyRequests: {
            ...responsError("Terlalu banyak percobaan", {
                default: { summary: "Rate limit terlampaui", value: contohError("RATE_LIMITED", "Terlalu banyak percobaan, coba lagi nanti") },
            }),
        },
    },
};