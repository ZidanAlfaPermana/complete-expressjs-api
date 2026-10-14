// src/utils/pagination.ts

export interface ListQuery {
    page: number;
    limit: number;
    sortBy: string;
    order: "ASC" | "DESC";
    q?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export function buatMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

// % dan _ adalah wildcard di LIKE. Tanpa escape, q="%" akan cocok dengan SEMUA data.
export function escapeLike(teks: string): string {
    return teks.replace(/[\\%_]/g, "\\$&");
}