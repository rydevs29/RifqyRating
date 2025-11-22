// data.js — PASTIKAN PAKAI YANG INI (versi terbaru!)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyBLC8YVaXY429dwo-H7rp0l5gbTsIdTAJY",
  databaseURL: "https://rifqyrating-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = getDatabase(app);

export const projects = [ /* ... daftar proyek seperti sebelumnya ... */ ];

export function renderProjects() { /* ... seperti sebelumnya ... */ }

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
    container.innerHTML = ''; // KOSONGKAN DULU

    if (!snap.val()) {
      container.innerHTML = '<p style="text-align:center;opacity:0.7">Belum ada review</p>';
      return;
    }

    Object.values(snap.val())
      .sort((a,b) => b.date - a.date)
      .slice(0, 20)
      .forEach(r => {
        const stars = '★★★★★'.substring(0, r.stars) + '☆☆☆☆☆'.substring(0, 5 - r.stars);
        const name = r.name && r.name.trim() ? r.name.trim() : "Anonim";
        const date = new Date(r.date).toLocaleDateString('id-ID');

        // SEMUA DIRNDER PAKAI JAVASCRIPT → TIDAK ADA TEMPLATE DI HTML!
        const div = document.createElement('div');
        div.className = 'ri';
        div.innerHTML = `
          <div class="rs">${stars}</div>
          <div class="by">— ${name}</div>
          <p>${r.text.replace(/</g, '&lt;')}</p>
          <small>${date}</small>
        `;
        container.appendChild(div);
      });
  });

  // Setup bintang & kirim rating (sama seperti sebelumnya)
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
