export function potongTeks(teks: string, max: number): string {
    if (teks.length <= max) return teks;
    return teks.slice(0, Math.max(0, max - 3)) + "...";
}