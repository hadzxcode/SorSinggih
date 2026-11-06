// =====================================================================
// SorSinggih - data-ui.js
// DATA tampilan yang paling sering kamu ubah. Tidak perlu menyentuh script.js.
// (Beda dengan data.js yang berisi materi belajar. File ini khusus untuk halaman utama.)
// Aturan: jangan hapus tanda koma (,) antar baris dan tanda kutip ('...').
// =====================================================================

// ---------- 1. Kosa kata di kartu "Kosa Kata"
// Format bali: 'lumrah/alus'. Mau tambah kata? Salin satu baris lalu ubah isinya.
// (Data contoh, perlu diperiksa validator penutur bahasa Bali.)
const KATA = [
    { indo: 'Makan Nasi', bali: 'Naar/Medar' },
    { indo: 'Berjalan', bali: 'Mejalan/Mamargi' },
    { indo: 'Tidur', bali: 'Pules/Mapeluasan' },
    { indo: 'Pergi', bali: 'Kema/Lunga' },
    { indo: 'Datang', bali: 'Teka/Rauh' },
    { indo: 'Duduk', bali: 'Negak/Malinggih' },
    { indo: 'Melihat', bali: 'Ningalin/Ngaksi' },
    { indo: 'Berbicara', bali: 'Ngomong/Mabaos' },
    { indo: 'Minum', bali: 'Nginem/Ngunjuk' },
    { indo: 'Mandi', bali: 'Mandus/Masiram' },
    { indo: 'Pulang', bali: 'Mulih/Mantuk' },
    { indo: 'Nama', bali: 'Adan/Wasta' },
    { indo: 'Rumah', bali: 'Umah/Griya' },
    { indo: 'Anak', bali: 'Pianak/Putra' },
    { indo: 'Sakit', bali: 'Sakit/Gerah' },
    { indo: 'Terima Kasih', bali: 'Suksma/Matur Suksma' },
    { indo: 'Memberi', bali: 'Ngemang/Ngicen' },
    { indo: 'Mendengar', bali: 'Ningeh/Miragi' },
    { indo: 'Saya', bali: 'Icang/Titiang' },
    { indo: 'Air', bali: 'Yeh/Toya' }
];

// ---------- 2. Tombol pilihan lawan bicara
// v  = nama yang tampil sekaligus dikirim ke server (harus sama dengan PANDUAN_TINGKAT di server.js)
// ik = nama ikon (lihat <symbol id="i-..."> di index.html)
const ROLES = [
    { v: 'Guru/Dosen', ik: 'cap' }, { v: 'Orang Tua', ik: 'users' },
    { v: 'Pemuka Agama', ik: 'hands' }, { v: 'Teman Sebaya', ik: 'group' }
];

// ---------- 3. Teks layar pembuka (Welcome)
// t = teks yang diketik, img = nama gambar Hanoman (img/hanoman-<img>.png), btn = teks tombol (null = lanjut otomatis)
const LANGKAH = [
    { t: 'Om Swastiastu! Selamat datang di SorSinggih. Yuk, belajar bahasa Bali bersama!', img: 'wave', btn: null },
    { t: 'Udah siap belum? buat belajar', img: 'wave', btn: 'Ayoo mulai' },
    { t: 'yukkk gasss keuuuuunnnn......', img: 'cheer', btn: 'Langsung masuk' }
];

// ---------- 4. Pengaturan arah terjemahan: alamat API, placeholder, dan teks pesan
const ARAH = {
    ubah: { api: '/api/ubah', ph: 'Type This way when you wanna translate to bahasa bali', badge: 'Hasil Terjemahan', kosong: 'Ketik atau ucapkan kalimat dulu ya!' },
    pahami: { api: '/api/pahami', ph: 'Tulis kalimat bahasa Bali yang ingin kamu pahami', badge: 'Arti dalam Indonesia', kosong: 'Tulis kalimat bahasa Bali dulu ya!' },
    scan: { api: '/api/scan', badge: 'Hasil Scan' }
};

// ---------- 5. Gambar ekspresi Hanoman di kartu "Start communication" (folder img/)
const URUTAN_EKSPRESI = ['hanoman-head.png', 'hanoman-wajah-senang.png', 'hanoman-wajah-kedip.png',
                  'hanoman-wajah-bingung.png', 'hanoman-hallo.png', 'hanoman-samping.png'];
