import { db, auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const AUTHORIZED_EMAIL = "invite.rifqydev@gmail.com";

const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const projectForm = document.getElementById('project-form');
const adminProjectList = document.getElementById('admin-project-list');
const adminReviewList = document.getElementById('admin-review-list');
const replyModal = document.getElementById('reply-modal');

// Variabel Penampung untuk Balas Review
let currentReviewId = null;
let currentProjectId = null;

// 1. KEAMANAN & AUTH
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email === AUTHORIZED_EMAIL) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            loadData();
        } else {
            // ANTI-INTIP: Pindah ke Forbidden jika email salah
            window.location.href = "forbidden.html";
        }
    } else {
        loginScreen.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
});

document.getElementById('btn-login').addEventListener('click', () => {
    signInWithPopup(auth, googleProvider).catch(err => alert(err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// 2. LOAD DATA PROYEK & REVIEWS
function loadData() {
    // Load Projects
    onValue(ref(db, 'projects'), (snapshot) => {
        const data = snapshot.val();
        renderAdminProjects(data);
        renderAdminReviews(data); // Render review berdasarkan proyek yang ada
    });
}

function renderAdminProjects(projects) {
    adminProjectList.innerHTML = '';
    if (!projects) return;
    document.getElementById('count-proj').innerText = Object.keys(projects).length;

    Object.keys(projects).forEach(id => {
        const p = projects[id];
        const div = document.createElement('div');
        div.className = "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl flex justify-between items-center shadow-sm";
        div.innerHTML = `
            <div>
                <h4 class="font-bold text-slate-800 dark:text-white">${p.name}</h4>
                <p class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">${p.status || 'Active'}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editProject('${id}', '${p.name}', '${p.link}', '${p.description}', '${p.status || ''}')" class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-bold">Edit</button>
                <button onclick="deleteProject('${id}')" class="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-xs font-bold">Hapus</button>
            </div>
        `;
        adminProjectList.appendChild(div);
    });
}

function renderAdminReviews(projects) {
    adminReviewList.innerHTML = '';
    if (!projects) return;

    Object.keys(projects).forEach(projId => {
        onValue(ref(db, `ratings/${projId}`), (snapshot) => {
            const reviews = snapshot.val();
            if (reviews) {
                Object.keys(reviews).forEach(revId => {
                    const r = reviews[revId];
                    const card = document.createElement('div');
                    card.className = "bg-white dark:bg-slate-800 border-l-4 border-blue-500 p-4 rounded-xl shadow-sm space-y-2 mb-3";
                    card.innerHTML = `
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase">Review di: ${projects[projId].name}</p>
                                <p class="text-sm font-bold text-slate-800 dark:text-white">${r.name} <span class="text-amber-500">★${r.rating}</span></p>
                            </div>
                            <button onclick="deleteReview('${projId}', '${revId}')" class="text-red-500 text-[10px] font-bold">Hapus</button>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-400">"${r.comment}"</p>
                        <div class="pt-2 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                            <p class="text-[10px] text-slate-400 italic">${r.adminReply ? '✅ Sudah Dibalas' : '⏳ Menunggu Balasan'}</p>
                            <button onclick="openReplyModal('${projId}', '${revId}', '${r.name}')" class="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold">Balas Official</button>
                        </div>
                    `;
                    adminReviewList.appendChild(card);
                });
            }
        });
    });
}

// 3. CRUD PROYEK
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const projectData = {
        name: document.getElementById('proj-name').value,
        status: document.getElementById('proj-status').value,
        link: document.getElementById('proj-link').value,
        description: document.getElementById('proj-desc').value,
        updatedAt: Date.now()
    };

    if (id) {
        update(ref(db, `projects/${id}`), projectData).then(() => { alert("Update Berhasil!"); resetForm(); });
    } else {
        set(push(ref(db, 'projects')), projectData).then(() => { alert("Proyek Ditambahkan!"); projectForm.reset(); });
    }
});

window.editProject = (id, name, link, desc, status) => {
    document.getElementById('project-id').value = id;
    document.getElementById('proj-name').value = name;
    document.getElementById('proj-status').value = status;
    document.getElementById('proj-link').value = link;
    document.getElementById('proj-desc').value = desc;
    document.getElementById('form-title').innerText = "Edit Proyek";
    document.getElementById('btn-submit').innerText = "Update";
    document.getElementById('btn-cancel').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProject = (id) => {
    if(confirm("Hapus proyek dan semua ratingnya?")) {
        remove(ref(db, `projects/${id}`));
        remove(ref(db, `ratings/${id}`));
    }
};

window.resetForm = () => {
    projectForm.reset();
    document.getElementById('project-id').value = "";
    document.getElementById('form-title').innerText = "Kelola Proyek";
    document.getElementById('btn-submit').innerText = "Simpan Proyek";
    document.getElementById('btn-cancel').classList.add('hidden');
};
document.getElementById('btn-cancel').addEventListener('click', resetForm);

// 4. BALAS & HAPUS REVIEW
window.openReplyModal = (projId, revId, reviewerName) => {
    currentProjectId = projId;
    currentReviewId = revId;
    document.getElementById('reply-target').innerText = `Membalas ulasan dari: ${reviewerName}`;
    replyModal.classList.remove('hidden');
};

window.closeReplyModal = () => {
    replyModal.classList.add('hidden');
    document.getElementById('admin-reply-text').value = '';
};

document.getElementById('btn-send-reply').addEventListener('click', () => {
    const replyText = document.getElementById('admin-reply-text').value;
    if(!replyText) return;

    update(ref(db, `ratings/${currentProjectId}/${currentReviewId}`), {
        adminReply: replyText
    }).then(() => {
        alert("Balasan Terverifikasi Terkirim! ✅");
        closeReplyModal();
    });
});

window.deleteReview = (projId, revId) => {
    if(confirm("Hapus ulasan ini secara permanen?")) {
        remove(ref(db, `ratings/${projId}/${revId}`));
    }
};
