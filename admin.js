import { db, auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const projectForm = document.getElementById('project-form');
const adminProjectList = document.getElementById('admin-project-list');
const userEmailSpan = document.getElementById('user-email');

// Email yang diizinkan (Hanya kamu!)
const AUTHORIZED_EMAIL = "invite.rifqydev@gmail.com";

// 1. Handling Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email === AUTHORIZED_EMAIL) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            userEmailSpan.innerText = user.email;
            loadAdminProjects();
        } else {
            alert("Akses Ditolak! Hanya Rifqy yang boleh masuk.");
            signOut(auth);
        }
    } else {
        loginScreen.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
});

// 2. Login & Logout
btnLogin.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider).catch(err => alert(err.message));
});

btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// 3. Save / Update Project
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('project-id').value;
    const projectData = {
        name: document.getElementById('proj-name').value,
        link: document.getElementById('proj-link').value,
        description: document.getElementById('proj-desc').value,
        updatedAt: Date.now()
    };

    if (id) {
        // Mode Update
        update(ref(db, `projects/${id}`), projectData).then(() => {
            alert("Proyek berhasil diperbarui!");
            resetForm();
        });
    } else {
        // Mode Baru
        const newProjRef = push(ref(db, 'projects'));
        set(newProjRef, projectData).then(() => {
            alert("Proyek berhasil ditambahkan!");
            projectForm.reset();
        });
    }
});

// 4. Load Projects for Admin
function loadAdminProjects() {
    onValue(ref(db, 'projects'), (snapshot) => {
        const data = snapshot.val();
        adminProjectList.innerHTML = '';
        
        if (!data) {
            adminProjectList.innerHTML = '<p class="text-slate-400 italic">Belum ada proyek.</p>';
            return;
        }

        Object.keys(data).forEach(id => {
            const p = data[id];
            const item = document.createElement('div');
            item.className = "bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm";
            item.innerHTML = `
                <div>
                    <h4 class="font-bold text-slate-800">${p.name}</h4>
                    <p class="text-xs text-slate-500">${p.link}</p>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                    <button onclick="editProject('${id}', '${p.name}', '${p.link}', '${p.description}')" class="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition">Edit</button>
                    <button onclick="deleteProject('${id}')" class="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition">Hapus</button>
                </div>
            `;
            adminProjectList.appendChild(item);
        });
    });
}

// 5. Global Functions for Edit & Delete
window.editProject = (id, name, link, desc) => {
    document.getElementById('project-id').value = id;
    document.getElementById('proj-name').value = name;
    document.getElementById('proj-link').value = link;
    document.getElementById('proj-desc').value = desc;
    
    document.getElementById('form-title').innerText = "Edit Proyek";
    document.getElementById('btn-submit').innerText = "Update Proyek";
    document.getElementById('btn-cancel').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProject = (id) => {
    if (confirm("Hapus proyek ini? Rating-nya juga akan ikut terhapus di database.")) {
        remove(ref(db, `projects/${id}`));
        remove(ref(db, `ratings/${id}`)); // Hapus rating history sekalian
    }
};

window.resetForm = () => {
    projectForm.reset();
    document.getElementById('project-id').value = "";
    document.getElementById('form-title').innerText = "Tambah Proyek Baru";
    document.getElementById('btn-submit').innerText = "Simpan Proyek";
    document.getElementById('btn-cancel').classList.add('hidden');
};

document.getElementById('btn-cancel').addEventListener('click', resetForm);
