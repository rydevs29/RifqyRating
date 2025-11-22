// data.js — Semua data & fungsi utama (index + rate)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyBLC8YVaXY429dwo-H7rp0l5gbTsIdTAJY",
  databaseURL: "https://rifqyrating-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = getDatabase(app);

export const projects = [
  {name:"ArchiveMods", desc:"Portal arsip modifikasi, eksperimen, dan tools digital dari RifqyDev.", link:"https://rifqydev.my.id"},
  {name:"RifqyMaps", desc:"Jelajahi lokasi, cari tempat menarik, dan integrasi peta.", link:"https://maps.rifqydev.my.id"},
  {name:"RifqyTask", desc:"Kelola dan pantau tugasmu dengan tampilan modern.", link:"https://task.rifqydev.my.id"},
  {name:"RifqyNotes", desc:"Catat ide, belajar, atau to-do dengan markdown.", link:"https://notes.rifqydev.my.id"},
  {name:"RifqyStudy", desc:"Belajar interaktif dengan quiz dan flashcard.", link:"https://study.rifqydev.my.id"},
  {name:"RifqyConverter", desc:"Konversi satuan, mata uang, dan data dengan cepat.", link:"https://converter.rifqydev.my.id"},
  {name:"RifqyCompress", desc:"Kompres gambar dan file langsung dari browser.", link:"https://compress.rifqydev.my.id"},
  {name:"RifqyCalory", desc:"Hitung kalori makanan dan pantau asupan harianmu.", link:"https://calory.rifqydev.my.id"},
  {name:"RifqyWeather", desc:"Lihat cuaca harian dan prakiraan lokal.", link:"https://weather.rifqydev.my.id"},
  {name:"RifqyTranslate", desc:"Terjemahkan teks antar bahasa dengan cepat.", link:"https://translate.rifqydev.my.id"},
  {name:"RifqyQR", desc:"Buat dan scan QR code secara instan.", link:"https://qr.rifqydev.my.id"},
  {name:"RifqyBudget", desc:"Kelola keuangan pribadi dan anggaran.", link:"https://budget.rifqydev.my.id"},
  {name:"RifqyPaste", desc:"Bagikan teks, kode, atau catatan dengan cepat.", link:"https://paste.rifqydev.my.id"}
];

export function renderProjects() {
  const container = document.getElementById('projects');
  if (!container) return;

  container.innerHTML = '';
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

    const r = ref(db, 'ratings/' + p.name);
    onValue(r, snap => {
      const d = snap.val();
      const el = card.querySelector('.rate');
      if (!d || d.count === 0) el.textContent = "0.0 / 5 (Belum ada ulasan)";
      else {
        const avg = (d.sum / d.count).toFixed(1);
        const text = d.count === 1 ? "1 ulasan" : `${d.count} ulasan`;
        el.textContent = `\( {avg} / 5 ( \){text})`;
      }
    });
  });

  document.getElementById('search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(c => {
      c.style.display = c.querySelector('.name').textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
  });
}

export function handleRatingPage() {
  const params = new URLSearchParams(location.search);
  const projectName = decodeURIComponent(params.get('n') || '');
  if (!projectName) return document.body.innerHTML = "<h1 style='text-align:center;color:#fff;margin-top:100px'>Proyek tidak ditemukan!</h1>";

  const descMap = Object.fromEntries(projects.map(p => [p.name, p.desc]));
  document.getElementById('title').textContent = projectName;
  document.getElementById('desc').textContent = descMap[projectName] || "Deskripsi tidak tersedia";

  const ratingRef = ref(db, 'ratings/' + projectName);
  onValue(ratingRef, snap => {
    const d = snap.val() || {sum:0, count:0};
    const avg = d.count > 0 ? (d.sum / d.count).toFixed(1) : "0.0";
    const text = d.count === 0 ? "Belum ada ulasan" : (d.count === 1 ? "1 ulasan" : `${d.count} ulasan`);
    document.getElementById('avg').textContent = `\( {avg} / 5 ( \){text})`;
  });

  const reviewsRef = ref(db, 'ratings/' + projectName + '/reviews');
  onValue(reviewsRef, snap => {
    const container = document.getElementById('reviews');
    container.innerHTML = '';
    if (!snap.val()) {
      container.innerHTML = '<p style="text-align:center;opacity:0.7">Belum ada review</p>';
      return;
    }
    Object.values(snap.val())
      .sort((a,b) => b.date - a.date)
      .slice(0, 20)
      .forEach(r => {
        const stars = '★★★★★'.substring(0,r.stars) + '☆☆☆☆☆'.substring(0,5-r.stars);
        const name = r.name && r.name.trim() ? r.name.trim() : "Anonim";
        const date = new Date(r.date).toLocaleDateString('id-ID');
        const div = document.createElement('div');
        div.className = 'ri';
        div.innerHTML = `<div class="rs">\( {stars}</div><div class="by">— \){name}</div><p>\( {r.text.replace(/</g,'&lt;')}</p><small> \){date}</small>`;
        container.appendChild(div);
      });
  });

  function setupStars() {
    const c = document.getElementById('stars'); c.innerHTML = '';
    for(let i=1;i<=5;i++){
      const s = document.createElement('span'); s.className='star'; s.textContent='★';
      s.onclick = () => c.querySelectorAll('.star').forEach((el,j) => el.classList.toggle('active', j < i));
      c.appendChild(s);
    }
  }
  setupStars();

  document.getElementById('submit').onclick = () => {
    const stars = document.querySelectorAll('#stars .star.active').length;
    const text = document.getElementById('review').value.trim();
    const name = document.getElementById('name').value.trim() || "Anonim";
    if(stars===0) return alert("Pilih bintang dulu!");
    if(text.length<10) return alert("Review minimal 10 karakter!");
    runTransaction(ratingRef, cur => {
      cur = cur || {sum:0,count:0,reviews:{}};
      cur.sum += stars; cur.count += 1;
      cur.reviews[Date.now()] = {stars, text, name, date:Date.now()};
      return cur;
    }).then(() => {
      alert("Terima kasih atas rating & reviewnya!");
      document.getElementById('review').value = '';
      document.getElementById('name').value = '';
      setupStars();
    });
  };
}
