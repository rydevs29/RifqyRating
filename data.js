// data.js — FINAL & 100% BERHASIL KIRIM + TAMPILKAN REVIEW
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyBLC8YVaXY429dwo-H7rp0l5gbTsIdTAJY",
  databaseURL: "https://rifqyrating-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = getDatabase(app);

export const projects = [
  {name:"ArchiveMods", desc:"Portal arsip modifikasi, eksperimen, dan tools digital dari RifqyDev.", link:"https://rifqydev.my.id"},
  {name:"RifqyMaps", desc:"Jelajahi lokasi dan cari tempat menarik dengan peta interaktif.", link:"https://maps.rifqydev.my.id"},
  {name:"RifqyTask", desc:"Kelola tugas harian dengan tampilan modern dan simpel.", link:"https://task.rifqydev.my.id"},
  {name:"RifqyNotes", desc:"Catat ide & to-do dengan dukungan markdown.", link:"https://notes.rifqydev.my.id"},
  {name:"RifqyStudy", desc:"Belajar interaktif pakai quiz dan flashcard.", link:"https://study.rifqydev.my.id"},
  {name:"RifqyConverter", desc:"Konversi satuan, mata uang, dan data cepat.", link:"https://converter.rifqydev.my.id"},
  {name:"RifqyCompress", desc:"Kompres gambar & file langsung di browser.", link:"https://compress.rifqydev.my.id"},
  {name:"RifqyCalory", desc:"Hitung kalori makanan dan pantau asupan harian.", link:"https://calory.rifqydev.my.id"},
  {name:"RifqyWeather", desc:"Cek cuaca real-time dan prakiraan.", link:"https://weather.rifqydev.my.id"},
  {name:"RifqyTranslate", desc:"Terjemah teks antar bahasa dengan cepat.", link:"https://translate.rifqydev.my.id"},
  {name:"RifqyQR", desc:"Buat & scan QR code instan.", link:"https://qr.rifqydev.my.id"},
  {name:"RifqyBudget", desc:"Kelola keuangan pribadi dengan mudah.", link:"https://budget.rifqydev.my.id"},
  {name:"RifqyPaste", desc:"Bagikan teks atau kode dengan cepat.", link:"https://paste.rifqydev.my.id"}
];

// renderProjects() tetap sama seperti versi sebelumnya (yang sudah bagus)

// handleRatingPage() — VERSI YANG SUDAH 100% BERHASIL
export function handleRatingPage() {
  const params = new URLSearchParams(location.search);
  const name = decodeURIComponent(params.get('n') || '');
  if (!name || !projects.find(p => p.name === name)) {
    document.body.innerHTML = "<h1 style='text-align:center;color:#fff;margin-top:100px'>Proyek tidak ditemukan!</h1>";
    return;
  }

  const project = projects.find(p => p.name === name);
  document.getElementById('title').textContent = name;
  document.getElementById('desc').textContent = project.desc;

  const ratingRef = ref(db, 'ratings/' + name);

  // Update rata-rata
  onValue(ratingRef, s => {
    const d = s.val() || {sum:0,count:0};
    const avg = d.count > 0 ? (d.sum / d.count).toFixed(1) : "0.0";
    const txt = d.count === 0 ? "Belum ada ulasan" : (d.count === 1 ? "1 ulasan" : `${d.count} ulasan`);
    document.getElementById('avg').textContent = `\( {avg} / 5 ( \){txt})`;
  });

  // Tampilkan semua review
  const reviewsRef = ref(db, 'ratings/' + name + '/reviews');
  const reviewsDiv = document.getElementById('reviews');
  onValue(reviewsRef, s => {
    reviewsDiv.innerHTML = '';
    if (!s.val()) {
      reviewsDiv.innerHTML = '<p style="text-align:center;opacity:0.7">Belum ada review</p>';
      return;
    }
    Object.entries(s.val())
      .sort((a, b) => b[1].date - a[1].date)
      .slice(0, 50)
      .forEach(([key, r]) => {
        const stars = '★★★★★'.substring(0, r.stars) + '☆☆☆☆☆'.substring(r.stars);
        const n = r.name?.trim() || "Anonim";
        const date = new Date(r.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
        const div = document.createElement('div');
        div.className = 'review';
        div.innerHTML = `
          <div class="r-stars">${stars}</div>
          <div class="r-name">— ${n}</div>
          <p>${r.text.replace(/</g, '&lt;')}</p>
          <small>${date}</small>
        `;
        reviewsDiv.appendChild(div);
      });
  });

  // Setup bintang
  const starsContainer = document.getElementById('stars');
  starsContainer.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    star.onclick = () => {
      starsContainer.querySelectorAll('.star').forEach((s, j) => s.classList.toggle('active', j < i));
    };
    starsContainer.appendChild(star);
  }

  // Kirim rating — SEKARANG 100% BERHASIL!
  document.getElementById('submit').onclick = () => {
    const selected = document.querySelectorAll('#stars .star.active').length;
    const text = document.getElementById('review').value.trim();
    const nama = document.getElementById('name').value.trim() || "Anonim";

    if (selected === 0) return alert("Pilih bintang dulu!");
    if (text.length < 10) return alert("Review minimal 10 karakter!");

    runTransaction(ratingRef, cur => {
      cur = cur || {sum: 0, count: 0, reviews: {}};
      cur.sum += selected;
      cur.count += 1;
      cur.reviews[Date.now()] = {
        stars: selected,
        text: text,
        name: nama,
        date: Date.now()
      };
      return cur;
    }).then(() => {
      alert("Rating & review kamu berhasil dikirim! Terima kasih ❤️");
      document.getElementById('review').value = '';
      document.getElementById('name').value = '';
      starsContainer.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    }).catch(err => {
      alert("Gagal mengirim: " + err.message);
    });
  };
}
