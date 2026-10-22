import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DOKUMEN = "docs/endpoint-audit.md";
const FOLDER_TEST = "tests";
const PREFIX_API = /^\/api(\/v\d+)?(?=\/|$)/;
const TANDA_MERAH = "🔴 Belum ada test";
const METHOD_HTTP = /^(GET|POST|PUT|PATCH|DELETE)$/;

function kumpulkanFileTest(folder) {
    return readdirSync(folder).flatMap(nama => {
        const jalur = join(folder, nama);
        if (statSync(jalur).isDirectory()) return kumpulkanFileTest(jalur);
        return /\.test\.(ts|js)$/.test(nama) ? [jalur] : [];
    });
}

function normalisasi(jalur) {
    const tanpaQuery = jalur.split("?")[0].replace(/\$\{[^}]*\}/g, "1");
    return tanpaQuery.replace(PREFIX_API, "").replace(/\/+$/, "") || "/";
}

function ambilPanggilan(isi) {
    const pola = /\.(get|post|put|patch|delete)\(\s*(["'`])(\/[^"'`]*)\2/g;
    return [...isi.matchAll(pola)].map(cocok => ({
        method: cocok[1].toUpperCase(),
        jalur: normalisasi(cocok[3]),
    }));
}

function polaEndpoint(jalur) {
    const aman = normalisasi(jalur)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:[A-Za-z_]+/g, "[^/]+");
    return new RegExp(`^${aman}$`);
}

function pecahBaris(baris) {
    return baris.trim().replace(/^\||\|$/g, "").split("|").map(sel => sel.trim());
}

function gabung(sel) {
    return `| ${sel.join(" | ")} |`;
}

function jalankan(barisDokumen, tangani) {
    let kolom = null;
    return barisDokumen.map(teks => {
        if (!teks.trim().startsWith("|")) {
            kolom = null;
            return teks;
        }

        const sel = pecahBaris(teks);
        const huruf = sel.map(s => s.toLowerCase());

        if (huruf.includes("method") && huruf.includes("path")) {
            let idxTest = huruf.indexOf("test");
            if (idxTest === -1) {
                sel.push("Test");
                idxTest = sel.length - 1;
            }
            kolom = { method: huruf.indexOf("method"), path: huruf.indexOf("path"), test: idxTest };
            return gabung(sel);
        }

        if (!kolom) return teks;

        if (sel.every(s => /^:?-{3,}:?$/.test(s))) {
            if (sel.length <= kolom.test) sel.push("---");
            return gabung(sel);
        }

        const method = sel[kolom.method].replace(/`/g, "").trim().toUpperCase();
        const jalur = sel[kolom.path].replace(/`/g, "").trim();
        if (!METHOD_HTTP.test(method)) return teks;

        return gabung(tangani(sel, kolom, method, jalur));
    });
}

const fileTest = kumpulkanFileTest(FOLDER_TEST).map(jalur => ({
    nama: relative(".", jalur).replaceAll("\\", "/"),
    panggilan: ambilPanggilan(readFileSync(jalur, "utf8")),
}));

const baris = readFileSync(DOKUMEN, "utf8").split("\n");

const daftarEndpoint = [];
jalankan(baris, (sel, kolom, method, jalur) => {
    daftarEndpoint.push({
        method,
        jalur: normalisasi(jalur),
        pola: polaEndpoint(jalur),
        jumlahParam: (jalur.match(/:[A-Za-z_]+/g) ?? []).length,
    });
    return sel;
});

function endpointPalingSpesifik(method, jalurTest) {
    const cocok = daftarEndpoint.filter(e => e.method === method && e.pola.test(jalurTest));
    if (cocok.length === 0) return null;
    return cocok.reduce((a, b) => (b.jumlahParam < a.jumlahParam ? b : a)).jalur;
}

function cariTest(method, jalur) {
    const target = normalisasi(jalur);
    const nama = fileTest
        .filter(f => f.panggilan.some(p => p.method === method && endpointPalingSpesifik(method, p.jalur) === target))
        .map(f => `\`${f.nama}\``);
    return nama.length > 0 ? nama.join(", ") : TANDA_MERAH;
}

let total = 0;
let tanpaTest = 0;

const hasil = jalankan(baris, (sel, kolom, method, jalur) => {
    const nilai = cariTest(method, jalur);
    total++;
    if (nilai === TANDA_MERAH) tanpaTest++;
    sel[kolom.test] = nilai;
    return sel;
}).join("\n");

writeFileSync(DOKUMEN, hasil);
console.log(`${total} endpoint diproses, ${tanpaTest} belum punya test (ditandai 🔴)`);

const tidakCocok = fileTest.flatMap(f =>
    f.panggilan
        .filter(p => endpointPalingSpesifik(p.method, p.jalur) === null)
        .map(p => `${f.nama}: ${p.method} ${p.jalur}`)
);

if (tidakCocok.length > 0) {
    console.log("\nPanggilan di test yang tidak cocok dengan endpoint mana pun di dokumen:");
    [...new Set(tidakCocok)].forEach(baris => console.log(`  ${baris}`));
}
