import { db } from './firebase-config.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const projectListContainer = document.getElementById('project-list');
const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');
const btnSubmitReview = document.getElementById('btn-submit-review');

// Global Stats Variables
let totalProjs = 0;
let totalRevs = 0;
let sumStars = 0;

// Rate Limiting (Maks 8 Proyek)
function getRatedProjects() {
    return JSON.parse(localStorage.getItem('rifqymetrics_rated')) || [];
}
function markAsRated(projectId) {
    const rated = getRatedProjects();
    if (!rated.includes(projectId)) {
        rated.push(projectId);
        localStorage.setItem('rifqymetrics_rated', JSON.stringify(rated));
    }
}

// Badge Color Logic based on Command
function getBadge(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    let color = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"; // Default
    if (s.includes('stable')) color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s.includes('beta')) color = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (s.includes('alpha') || s.includes('maintenance')) color = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (s.includes('hot')) color = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    
    return `<span class="px-3 py-1 ${color} text-[10px] font-bold rounded-full uppercase tracking-wider">${status}</span>`;
}

// 1. Fetch Projects
function loadProjects() {
    const projectsRef = ref(db, 'projects');
    onValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        renderProjects(data);
    });
}

// 2. Render UI & Calculate Analytics
function renderProjects(projects) {
    projectListContainer.innerHTML = '';
    totalProjs = projects ? Object.keys(projects).length : 0;
    document.getElementById('stat-projects').innerText = totalProjs;

    if (!projects) return;

    Object.keys(projects).forEach((id) => {
        const p = projects[id];
        const card = document.createElement('div');
        card.className = 'project-card bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 md:p-8 flex flex-col justify-between';
        
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${p.name}</h3>
                    ${getBadge(p.status || 'Project')}
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">${p.description}</p>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex text-amber-400 text-sm tracking-widest" id="stars-${id}">⭐⭐⭐⭐⭐</div>
                    <button onclick="openReviewModal('${id}', '${p.name}')" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition">Kasih Rating</button>
                </div>
                <a href="${p.link}" target="_blank" class="block w-full text-center py-3 bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 transition shadow-md">Buka Repository</a>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">History Rating</p>
                <div id="history-${id}" class="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    <p class="text-[11px] text-slate-400 italic">Memuat ulasan...</p>
                </div>
            </div>
        `;
        projectListContainer.appendChild(card);
        loadReviews(id);
    });
}

// 3. Load Reviews & Verified Admin Reply
function loadReviews(projectId) {
    onValue(ref(db, `ratings/${projectId}`), (snapshot) => {
        const reviews = snapshot.val();
        const historyContainer = document.getElementById(`history-${projectId}`);
        const starContainer = document.getElementById(`stars-${projectId}`);
        
        historyContainer.innerHTML = '';
        if (!reviews) {
            historyContainer.innerHTML = '<p class="text-[11px] text-slate-400 italic">Belum ada ulasan.</p>';
            return;
        }

        let projStars = 0;
        let projCount = 0;

        Object.values(reviews).forEach(rev => {
            projStars += parseInt(rev.rating);
            projCount++;
            totalRevs++; 
            sumStars += parseInt(rev.rating);

            // Cek jika ada balasan admin
            const adminReplyHtml = rev.adminReply ? `
                <div class="mt-2 ml-4 p-2 bg-blue-50 dark:bg-slate-700/50 rounded-lg border-l-2 border-blue-500">
                    <p class="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        Verified by Rifqy Aditya <span class="text-blue-500">✔</span>
                    </p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1">${rev.adminReply}</p>
                </div>
            ` : '';

            const revEl = document.createElement('div');
            revEl.className = 'text-[12px] bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50';
            revEl.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <strong class="text-slate-800 dark:text-slate-200">${rev.name}</strong>
                    <span class="text-amber-500 tracking-widest text-[10px]"> ${'⭐'.repeat(rev.rating)}</span>
                </div>
                <p class="text-slate-600 dark:text-slate-400">${rev.comment}</p>
                ${adminReplyHtml}
            `;
            // Insert di paling atas
            historyContainer.insertBefore(revEl, historyContainer.firstChild); 
        });

        // Update Average UI
        const avg = Math.round(projStars / projCount);
        starContainer.innerHTML = '⭐'.repeat(avg) + '<span class="opacity-20 grayscale">' + '⭐'.repeat(5-avg) + '</span>';
        
        // Update Pinned Stats Global
        document.getElementById('stat-reviews').innerText = totalRevs;
        document.getElementById('stat-rating').innerText = (sumStars / totalRevs).toFixed(1) + ' ⭐';
    });
}

// 4. Modal & Turnstile Logic
window.openReviewModal = (id, name) => {
    const rated = getRatedProjects();
    
    // Cek Spam Limit (Maks 8)
    if (rated.length >= 8 && !rated.includes(id)) {
        alert("🛡️ Anti-Spam: Kamu sudah memberikan rating di 8 proyek berbeda. Terima kasih banyak atas partisipasinya!");
        return;
    }
    
    // Cek apakah sudah rating di proyek INI
    if (rated.includes(id)) {
        alert("Kamu sudah memberikan rating untuk proyek ini. Coba proyek lainnya ya!");
        return;
    }

    document.getElementById('modal-project-id').value = id;
    document.getElementById('modal-project-name').innerText = `Rating ${name}`;
    reviewModal.classList.remove('hidden');
};

window.closeModal = () => {
    reviewModal.classList.add('hidden');
    reviewForm.reset();
    btnSubmitReview.disabled = true; // Kunci tombol lagi
};

// Callback Turnstile Cloudflare
window.onTurnstileSuccess = function() {
    btnSubmitReview.disabled = false; // Buka tombol kalau sukses verifikasi manusia
};

// 5. Submit Form
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-project-id').value;
    const starValue = document.getElementById('reviewer-rating').value;
    
    const reviewData = {
        name: document.getElementById('reviewer-name').value,
        rating: starValue,
        comment: document.getElementById('reviewer-comment').value,
        timestamp: Date.now()
    };

    set(push(ref(db, `ratings/${id}`)), reviewData).then(() => {
        markAsRated(id); // Catat di LocalStorage
        closeModal();
        
        // Fitur Seru: Confetti kalau bintang 5! 🎉
        if (starValue === "5") {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            alert('Rating berhasil dikirim. Terima kasih!');
        }
    });
});

loadProjects();
