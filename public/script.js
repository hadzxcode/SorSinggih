// =====================================================================
// SorSinggih - script.js (logika aplikasi)
// Urutan file: 1) Alat bantu  2) Layar pembuka  3) Lawan bicara  4) Panel input (teks/suara/kamera)
//              5) Terjemahan  6) Kosa kata  7) Sesi chat Hanoman  8) Slideshow Hanoman
// Data yang sering diubah (kosa kata, tombol, teks pembuka) ada di data-ui.js, dimuat lebih dulu.
// =====================================================================
const $ = (id) => document.getElementById(id);
const FALLBACK_IMG = 'img/hanoman-head.png'; // dipakai bila aset maskot belum ada

// ---------- Gambar cadangan
document.addEventListener('error', (e) => {
    const im = e.target;
    if (im.tagName !== 'IMG') return;
    if (im.dataset.fb === 'remove') return im.remove();
    if (im.dataset.fb !== '1') { im.dataset.fb = '1'; im.src = FALLBACK_IMG; }
}, true);

// ---------- Toast
let tTimer;
function toast(pesan) {
    const el = $('toast');
    el.textContent = pesan; el.classList.add('show');
    clearTimeout(tTimer);
    tTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ---------- Animasi perpindahan halaman
function ulang(el, kelas) { el.classList.remove(kelas); void el.offsetWidth; el.classList.add(kelas); }
let lagiPindah = false;
// arah: 'maju' (halaman baru masuk dari kanan) atau 'mundur' (dari kiri)
function pindah(dari, ke, arah) {
    if (lagiPindah) return;
    lagiPindah = true;
    dari.classList.add('out-' + arah);
    setTimeout(() => {
        dari.classList.add('hidden'); dari.classList.remove('out-' + arah);
        ke.classList.remove('hidden');
        ke.classList.add('in-' + arah);
        window.scrollTo(0, 0);
        setTimeout(() => { ke.classList.remove('in-' + arah); lagiPindah = false; }, 260);
    }, 120);
}

// ---------- Welcome

let wi = 0, wTimer;
let wTok = 0;
const caret = Object.assign(document.createElement('span'), { className: 'caret' });
function tampilWelcome(i) {
    wi = i; clearTimeout(wTimer);
    const tok = ++wTok, s = LANGKAH[i];
    const teks = $('w-text'), mas = $('w-mascot'), btn = $('w-btn');
    // Hanoman masuk dari bawah; bila gambarnya berganti, yang lama keluar dulu
    const masuk = () => { mas.classList.remove('sink'); mas.dataset.fb = ''; mas.src = 'img/hanoman-' + s.img + '.png'; mas.dataset.cur = s.img; ulang(mas, 'rise'); };
    if (mas.dataset.cur && mas.dataset.cur !== s.img) { ulang(mas, 'sink'); setTimeout(() => { if (tok === wTok) masuk(); }, 160); }
    else if (!mas.dataset.cur) masuk();
    btn.classList.add('invis');
    document.querySelectorAll('.w-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    teks.textContent = ''; ulang(teks, 'pop');

    const selesai = () => {
        if (tok !== wTok) return;
        caret.remove();
        if (s.btn) { btn.textContent = s.btn; btn.classList.remove('invis'); ulang(btn, 'pop'); }
        else wTimer = setTimeout(() => tampilWelcome(i + 1), 500); // layar 1 lanjut sendiri
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { teks.textContent = s.t; return selesai(); }

    // Teks diketik huruf demi huruf
    let n = 0;
    const ketik = () => {
        if (tok !== wTok) return;
        n++; teks.textContent = s.t.slice(0, n); teks.appendChild(caret);
        if (n >= s.t.length) return selesai();
        // Jeda panjang hanya setelah tanda baca tunggal; titik berderet ("......") diketik cepat
        const tanda = /[.,!?]/;
        wTimer = setTimeout(ketik, tanda.test(s.t[n - 1]) && !tanda.test(s.t[n]) ? 600 : 25);
    };
    wTimer = setTimeout(() => {
        if (tok !== wTok) return;
        ketik();
    }, 400);
}
$('w-btn').addEventListener('click', () => {
    if (wi < LANGKAH.length - 1) tampilWelcome(wi + 1);
    else pindah($('welcome'), $('app'), 'maju');
});
// Tombol Lewati: hentikan ketikan dan timer lalu langsung masuk ke aplikasi
$('w-skip').addEventListener('click', () => {
    wTok++; clearTimeout(wTimer); caret.remove();
    pindah($('welcome'), $('app'), 'maju');
});
// Layar 1 lanjut sendiri ke layar 2 (tanpa klik). Tombol hanya ada di layar 2 dan 3.
tampilWelcome(0);

// Teks dan ilustrasi Hanoman: cegah salin, seret gambar, dan menu klik kanan
const KUNCI = '.welcome, .w-float, .cta, .chat-head, .about-top, .msg.ai';
document.addEventListener('copy', (e) => {
    const sel = window.getSelection();
    if (sel && sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest(KUNCI)) e.preventDefault();
});
document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest(KUNCI)) e.preventDefault(); });
document.addEventListener('dragstart', (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); });

// ---------- Pilihan lawan bicara (nilai harus sama dengan kunci PANDUAN_TINGKAT di server.js)

let lawan = 'Guru/Dosen';
['roles-main', 'roles-sess'].forEach((id) => {
    $(id).innerHTML = ROLES.map((r) =>
        '<button type="button" class="role" data-v="' + r.v + '" aria-pressed="false"><svg class="ic"><use href="#i-' + r.ik + '"/></svg>' +
        '<span>' + r.v + '</span><svg class="ic tick"><use href="#i-check"/></svg></button>').join('');
});
function setLawan(v) {
    lawan = v;
    document.querySelectorAll('.role').forEach((b) => {
        const on = b.dataset.v === v;
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
}
document.addEventListener('click', (e) => { const b = e.target.closest('.role'); if (b) setLawan(b.dataset.v); });
setLawan(lawan);

// ---------- Mode panel: text | voice | camera
const panel = $('panel');
function setMode(m) {
    if (panel.dataset.mode !== m) resetHasil();     // pindah kamera/suara/teks -> hasil lama hilang
    panel.dataset.mode = m;
    if (m !== 'voice' && rekam) rekam.abort();
    if (m === 'camera') bukaKamera(); else tutupKamera();
}
$('c-back').addEventListener('click', () => setMode('text'));
$('c-cam').addEventListener('click', () => {
    if (panel.classList.contains('snap')) { resetHasil(); hapusSnap(); bukaKamera(); return; }   // foto ditahan -> ambil ulang
    setMode('camera');
});

// ---------- Kamera (getUserMedia) + scan
let camStream = null, camBuka = false;
async function bukaKamera() {
    if (camStream || camBuka) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setMode('text'); return toast('Browser ini belum mendukung kamera.'); }
    camBuka = true;
    try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
        if (panel.dataset.mode !== 'camera') { s.getTracks().forEach((t) => t.stop()); return; } // keluar mode sebelum izin selesai
        camStream = s; $('cam-video').srcObject = s;
    } catch (err) {
        setMode('text'); toast('Kamera tidak bisa dibuka. Pastikan izin kamera aktif.');
    } finally { camBuka = false; }
}
function stopStream() {
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = null; $('cam-video').srcObject = null;
}
function hapusSnap() {
    panel.classList.remove('snap'); $('cam-snap').removeAttribute('src');
}
function tutupKamera() { stopStream(); hapusSnap(); }   // dipanggil saat keluar mode kamera (Back)
$('btn-shutter').addEventListener('click', () => {
    const v = $('cam-video');
    if (!camStream || !v.videoWidth) return toast('Kamera belum siap.');
    // Perkecil ke maks 1024px dan JPEG 0.7 supaya kiriman kecil dan hemat token
    const skala = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * skala); c.height = Math.round(v.videoHeight * skala);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.7);
    const gambar = dataUrl.split(',')[1];
    $('cam-snap').src = dataUrl;                       // tahan foto di layar
    panel.classList.add('snap');
    stopStream();                                      // kamera mati, tapi mode kamera tetap aktif
    panggil('scan', { gambar, lawanBicara: lawan });
});

// ---------- Terjemahan

const roles = $('roles-main');
function setArah() {
    const a = ARAH[$('arah').value];
    $('kalimat').placeholder = a.ph;
    resetHasil();
    roles.classList.toggle('off', $('arah').value === 'pahami'); // Bali->Indo tidak butuh lawan bicara
}
$('arah').addEventListener('change', setArah);

function baris(utama, tag, sub) {
    const d = document.createElement('div'); d.className = 'r-item';
    const s = document.createElement('strong'); s.textContent = utama; d.appendChild(s);
    if (tag) { const t = document.createElement('span'); t.textContent = tag; d.appendChild(t); }
    if (sub) { const p = document.createElement('small'); p.textContent = sub; d.appendChild(p); }
    return d;
}
function tampilHasil(mode, d) {
    $('r-badge').textContent = ARAH[mode].badge;
    $('r-teks').textContent = d.hasil;
    $('r-jelas').textContent = mode === 'ubah'
        ? 'Alasan: ' + (d.penjelasan || '-')
        : mode === 'scan'
        ? 'Teks terbaca: ' + (d.teksAsli || '-') + '. ' + (d.penjelasan || '')
        : (d.tingkatTerdeteksi ? 'Tingkat tutur: ' + d.tingkatTerdeteksi + '. ' : '') + (d.penjelasan || '');
    const list = $('r-list'); list.replaceChildren();
    (Array.isArray(d.pilihanKata) ? d.pilihanKata : []).slice(0, 5).forEach((k) => {
        const [a, b] = [k.bali, k.indo];
        list.appendChild(baris(String(a), String(k.tingkat || ''), String(b || '')));
    });
    $('hasil').classList.remove('hidden');
    $('hasil').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

let sibuk = false, ctrl = null;
// Hapus hasil terjemahan dan batalkan request yang masih berjalan
function resetHasil() {
    if (ctrl) ctrl.abort();
    const k = $('hasil');
    k.classList.remove('memuat'); k.classList.add('hidden');
    $('r-teks').textContent = ''; $('r-jelas').textContent = '';
    $('r-list').replaceChildren();
}
function kirim() {
    const mode = $('arah').value, kalimat = $('kalimat').value.trim();
    if (!kalimat) return toast(ARAH[mode].kosong);
    return panggil(mode, { kalimat, lawanBicara: lawan });
}
// Pemanggil bersama untuk terjemahan (ubah/pahami) dan scan kamera
async function panggil(mode, body) {
    if (sibuk) return;
    sibuk = true; $('btn-kirim').disabled = true;
    // Animasi memuat ditampilkan di kartu hasil (bukan di tombol kirim)
    const kartu = $('hasil'); let tampil = false;
    kartu.classList.add('memuat'); kartu.classList.remove('hidden');
    kartu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    ctrl = new AbortController();
    try {
        const r = await fetch(ARAH[mode].api, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: ctrl.signal
        });
        const j = await r.json();
        if (j.success) { tampilHasil(mode, j.data); tampil = true; }
        else toast(j.error || 'Terjadi kesalahan.');
    } catch (err) {
        if (err.name === 'AbortError') return;      // sengaja dibatalkan, tanpa toast
        console.error(err); toast('Gagal terhubung ke server. Cek koneksi internetmu.');
    } finally {
        sibuk = false; $('btn-kirim').disabled = false;
        kartu.classList.remove('memuat');
        if (!tampil) kartu.classList.add('hidden');   // gagal / pindah mode: sembunyikan kartu
    }
}
$('btn-kirim').addEventListener('click', kirim);
// Desktop/laptop: Enter = kirim, Shift+Enter = baris baru.
// HP/tablet (layar sentuh): Enter tetap baris baru, kirim lewat tombol.
const layarSentuh = window.matchMedia('(pointer: coarse)').matches;
$('kalimat').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing || e.shiftKey) return;
    if (layarSentuh && !e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    kirim();
});
$('btn-salin').addEventListener('click', () => {
    const t = $('r-teks').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('Hasil disalin.'), () => toast('Gagal menyalin.'));
});

// ---------- Input suara (Web Speech API, bahasa Indonesia)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rekam = null;
$('c-mic').addEventListener('click', () => {
    if (!SR) return toast('Browser ini belum mendukung input suara.');
    if (rekam) { rekam.stop(); return; }
    setMode('voice');
    const r = new SR(); rekam = r;
    r.lang = 'id-ID'; r.interimResults = false;
    let dapat = false;
    r.onresult = (ev) => { dapat = true; $('kalimat').value = ev.results[0][0].transcript; };
    r.onerror = (ev) => { if (ev.error !== 'aborted') toast('Gagal merekam. Pastikan izin mikrofon aktif.'); };
    r.onend = () => {
        if (rekam === r) rekam = null;
        if (panel.dataset.mode === 'voice') setMode('text');
        if (dapat) kirim();
    };
    r.start();
});

// ---------- Kosa Kata (data contoh; tim Riset perlu memvalidasi dan menambah)

let ki = 0;
function tampilKata() { $('k-indo').textContent = KATA[ki].indo; $('k-bali').textContent = KATA[ki].bali; }
// Ganti kata: animasi fade sederhana (ringan untuk HP/laptop lama)
$('k-next').addEventListener('click', () => {
    ki = (ki + 1) % KATA.length;
    tampilKata();
    ulang($('k-next'), 'spin');
    ulang(document.querySelector('.kosa'), 'flip');
});
tampilKata();

// ---------- Pindah halaman utama <-> sesi chat
function bukaSesi(buka) {
    resetHasil();                                   // masuk atau keluar sesi -> hasil hilang
    if (buka && panel.dataset.mode !== 'text') setMode('text');   // tutup kamera/suara di halaman utama
    if (!buka && rekamChat) rekamChat.abort();
    pindah($(buka ? 'view-main' : 'view-session'), $(buka ? 'view-session' : 'view-main'), buka ? 'maju' : 'mundur');
}
$('btn-sesi').addEventListener('click', () => bukaSesi(true));
$('s-back').addEventListener('click', () => bukaSesi(false));

// ---------- Chat dengan Hanoman
const riwayat = [];            // [{ peran: 'user' | 'hanoman', teks }], server hanya memakai 10 terakhir
let chatSibuk = false, rekamChat = null;
function gelembung(kelas, utama, arti) {
    const p = document.createElement('p'); p.className = 'msg ' + kelas;
    const s = document.createElement('span'); s.textContent = utama; p.appendChild(s);
    if (arti) { const a = document.createElement('small'); a.textContent = arti; p.appendChild(a); }
    const w = document.querySelector('.msgs'); w.appendChild(p); w.scrollTop = w.scrollHeight;
    return p;
}
async function kirimChat(teks) {
    teks = teks.trim().slice(0, 500);
    if (!teks || chatSibuk) return;
    chatSibuk = true; $('s-kirim').disabled = true; $('s-input').value = '';
    gelembung('user', teks);
    const tunggu = gelembung('ai', '...');
    riwayat.push({ peran: 'user', teks });
    try {
        const r = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pesan: riwayat.slice(-10), lawanBicara: lawan })
        });
        const j = await r.json();
        if (!j.success) throw new Error(j.error || 'Terjadi kesalahan.');
        tunggu.remove();
        gelembung('ai', j.data.balasan, j.data.arti);
        riwayat.push({ peran: 'hanoman', teks: String(j.data.balasan) });
    } catch (err) {
        tunggu.remove(); riwayat.pop();   // pesan gagal tidak ikut masuk riwayat
        toast(err instanceof TypeError ? 'Gagal terhubung ke server. Cek koneksi internetmu.' : err.message);
    } finally {
        if (riwayat.length > 10) riwayat.splice(0, riwayat.length - 10);
        chatSibuk = false; $('s-kirim').disabled = false; $('s-input').focus();
    }
}
$('s-kirim').addEventListener('click', () => kirimChat($('s-input').value));
$('s-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) kirimChat($('s-input').value); });
$('s-mic').addEventListener('click', () => {
    if (!SR) return toast('Browser ini belum mendukung input suara.');
    if (rekamChat) { rekamChat.stop(); return; }
    const r = new SR(); rekamChat = r;
    r.lang = 'id-ID'; r.interimResults = false;
    let dapat = '';
    $('s-mic').classList.add('rec');
    r.onresult = (ev) => { dapat = ev.results[0][0].transcript; };
    r.onerror = (ev) => { if (ev.error !== 'aborted') toast('Gagal merekam. Pastikan izin mikrofon aktif.'); };
    r.onend = () => {
        if (rekamChat === r) rekamChat = null;
        $('s-mic').classList.remove('rec');
        if (dapat) kirimChat(dapat);
    };
    r.start();
});

// ---------- Slideshow ekspresi Hanoman: SATU gambar, ekspresinya berganti bergantian
// (gaya ditulis di sini supaya tidak bergantung pada style.css)
(function () {
    const urut = URUTAN_EKSPRESI; // daftar gambar ada di data-ui.js
    const DURASI = 1000, FADE = 120;  // ganti ekspresi tiap 1 detik
    const wadah = $('slides');
    const ukuran = 'clamp(96px,14vw,132px)';
    wadah.style.cssText = 'width:' + ukuran + ';height:' + ukuran + ';flex-shrink:0;position:relative';

    // Muat dulu; file yang belum ada dilewati supaya tidak muncul gambar rusak
    Promise.all(urut.map((f) => new Promise((ok) => {
        const p = new Image(); p.onload = () => ok('img/' + f); p.onerror = () => ok(null); p.src = 'img/' + f;
    }))).then((daftar) => {
        daftar = daftar.filter(Boolean);
        if (!daftar.length) return;
        const im = document.createElement('img');
        im.alt = ''; im.src = daftar[0];
        im.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom;' +
            'transition:opacity ' + FADE + 'ms ease,transform ' + FADE + 'ms ease';
        wadah.replaceChildren(im);
        if (daftar.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let i = 0, t;
        const ganti = () => {
            im.style.opacity = 0; im.style.transform = 'scale(.9)';
            setTimeout(() => {
                i = (i + 1) % daftar.length; im.src = daftar[i];
                im.style.opacity = 1; im.style.transform = 'none';
            }, FADE);
        };
        const jalan = () => { t = setInterval(ganti, DURASI); };
        document.addEventListener('visibilitychange', () => { clearInterval(t); if (!document.hidden) jalan(); });
        jalan();
    });
})();