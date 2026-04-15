import { db } from './firebase-config.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const projectListContainer = document.getElementById('project-list');
const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');

// 1. Fetch Projects from Firebase
function loadProjects() {
    const projectsRef = ref(db, 'projects');
    onValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        renderProjects(data);
    });
}

// 2. Render Cards to UI
function renderProjects(projects) {
    projectListContainer.innerHTML = '';
    
    if (!projects) {
        projectListContainer.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400 font-medium">Belum ada proyek yang ditambahkan.</div>`;
        return;
    }

    Object.keys(projects).forEach((id) => {
        const project = projects[id];
        const card = document.createElement('div');
        card.className = 'project-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between';
        
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-slate-800">${project.name}</h3>
                    <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">Project</span>
                </div>
                <p class="text-slate-500 text-sm mb-6 leading-relaxed">${project.description}</p>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div class="flex text-amber-400 text-sm" id="stars-${id}">
                        ⭐⭐⭐⭐⭐
                    </div>
                    <button onclick="openReviewModal('${id}', '${project.name}')" class="text-xs font-semibold text-blue-600 hover:underline">Kasih Rating</button>
                </div>
                <a href="${project.link}" target="_blank" class="block w-full text-center py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition">Buka Repository</a>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-50">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">History Rating</p>
                <div id="history-${id}" class="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                    <p class="text-[11px] text-slate-400 italic">Belum ada ulasan...</p>
                </div>
            </div>
        `;
        projectListContainer.appendChild(card);
        loadReviews(id);
    });
}

// 3. Load Reviews for Each Project
function loadReviews(projectId) {
    const reviewsRef = ref(db, `ratings/${projectId}`);
    onValue(reviewsRef, (snapshot) => {
        const reviews = snapshot.val();
        const historyContainer = document.getElementById(`history-${projectId}`);
        const starContainer = document.getElementById(`stars-${projectId}`);
        
        if (reviews) {
            historyContainer.innerHTML = '';
            let totalStars = 0;
            let count = 0;

            Object.values(reviews).reverse().forEach(rev => {
                totalStars += parseInt(rev.rating);
                count++;
                
                const revEl = document.createElement('div');
                revEl.className = 'text-[11px] bg-slate-50 p-2 rounded-md border border-slate-100';
                revEl.innerHTML = `<strong>${rev.name}</strong>: ${rev.comment} <span class="text-amber-500">★${rev.rating}</span>`;
                historyContainer.appendChild(revEl);
            });

            // Update average star display
            const avg = Math.round(totalStars / count);
            starContainer.innerHTML = '⭐'.repeat(avg) + '<span class="text-slate-300">' + '⭐'.repeat(5-avg) + '</span>';
        }
    });
}

// 4. Modal Logic
window.openReviewModal = (id, name) => {
    document.getElementById('modal-project-id').value = id;
    document.getElementById('modal-project-name').innerText = name;
    reviewModal.classList.remove('hidden');
};

window.closeModal = () => {
    reviewModal.classList.add('hidden');
    reviewForm.reset();
};

// 5. Submit Review Logic
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-project-id').value;
    const reviewData = {
        name: document.getElementById('reviewer-name').value,
        rating: document.getElementById('reviewer-rating').value,
        comment: document.getElementById('reviewer-comment').value,
        timestamp: Date.now()
    };

    const newReviewRef = push(ref(db, `ratings/${id}`));
    set(newReviewRef, reviewData).then(() => {
        alert('Terima kasih atas ratingnya!');
        closeModal();
    });
});

// Start App
loadProjects();
