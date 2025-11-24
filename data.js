// data.js — FINAL & SUPER CEPAT
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyBLC8YVaXY429dwo-H7rp0l5gbTsIdTAJY",
  databaseURL: "https://rifqyrating-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = getDatabase(app);

export const projects = [ /* sama seperti sebelumnya, 13 proyek */ 
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

export function renderProjects() {
  const container = document.getElementById('projects');
  
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="desc">${p.desc}</div>
      <a href="${p.link}" target="_blank" class="link" onclick="event.stopPropagation()">Buka Proyek</a>
      <div class="rate">Memuat rating...</div>
    `;
    card.onclick = () => location.href = `rate.html?n=${encodeURIComponent(p.name)}`;
    container.appendChild(card);

    const ratingRef = ref(db, 'ratings/' + p.name);
    onValue(ratingRef, (snap) => {
      const data = snap.val();
      const rateEl = card.querySelector('.rate');
      if (!data || data.count === 0) {
        rateEl.textContent = "0.0 / 5 (Belum ada ulasan)";
      } else {
        const avg = (data.sum / data.count).toFixed(1);
        const text = data.count === 1 ? "1 ulasan" : `${data.count} ulasan`;
        rateEl.textContent = `\( {avg} / 5 ( \){text})`;
      }
    }, { onlyOnce: false });
  });

  // Search
  document.getElementById('search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('.name').textContent.toLowerCase();
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });
}
