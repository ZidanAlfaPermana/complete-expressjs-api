import type {Jurnal, Peserta} from "../types";

export const dataPeserta: Peserta[] = [
    {
        id: 1,
        nama: "Zidan",
        sekolah: "SMKN 6",
        kelas: "XI",
        jurusan: "PPLG 3",
        fase: 2
    },
    {
        id: 2,
        nama: "Ahmad",
        sekolah: "SMKN 6",
        kelas: "XII",
        jurusan: "PPLG 3",
        fase: 3
    },
    {
        id: 3,
        nama: "Zidan",
        sekolah: "SMKN 6",
        kelas: "XI",
        jurusan: "PPLG 3",
        fase: 3
    },
    {
        id: 4,
        nama: "Budi",
        sekolah: "SMKN 5",
        kelas: "XII",
        jurusan: "PPLG 3",
        fase: 3
    },
    {
        id: 5,
        nama: "Budi",
        sekolah: "SMKN 5",
        kelas: "XI",
        jurusan: "PPLG 2",
        fase: 3
    }
];

export const dataJurnal: Jurnal[] = [
    {
        id: 1,
        idPeserta: 1,
        status: "selesai",
        kegiatan: "Mengerjakan API",
        hambatan: "Laptop Lag",
        rencanaBesok: "Review",
        linkCommit: "https://github.com/ZidanAlfaPermana",
        review: "sudah"
    },
    {
        id: 2,
        idPeserta: 4,
        status: "proses",
        kegiatan: "Rapat Klien",
        hambatan: "Internet Mati",
        rencanaBesok: "Review",
        linkCommit: "https://github.com/ZidanAlfaPermana",
        review: "sudah"
    },
    {
        id: 3,
        idPeserta: 1,
        status: "selesai",
        kegiatan: "Fixing Bug",
        hambatan: "Tidak Ada",
        rencanaBesok: "Testing",
        linkCommit: "https://github.com/ZidanAlfaPermana",
        review: "belum"
    },
    {
        id: 4,
        idPeserta: 5,
        status: "belum",
        kegiatan: "Desain Database",
        hambatan: "Tidak Ada",
        rencanaBesok: "Testing",
        linkCommit: "https://github.com/ZidanAlfaPermana",
        review: "sudah"
    },
    {
        id: 5,
        idPeserta: 1,
        status: "proses",
        kegiatan: "Desain Database",
        hambatan: "Tidak Ada",
        rencanaBesok: "Review",
        linkCommit: "https://github.com/ZidanAlfaPermana",
        review: "belum"
    }
];


