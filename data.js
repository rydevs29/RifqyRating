<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - RifqyMetrics</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #fcfcfc; }
        .hidden { display: none !important; }
    </style>
</head>
<body class="text-slate-900">

    <div id="login-screen" class="min-h-screen flex items-center justify-center p-6">
        <div class="bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center">
            <h1 class="text-2xl font-bold text-blue-600 mb-2">RifqyMetrics Admin</h1>
            <p class="text-slate-500 text-sm mb-8">Silakan login dengan akun Google kamu untuk mengelola repository.</p>
            <button id="btn-login" class="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition shadow-sm">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
                Login with Google
            </button>
        </div>
    </div>

    <div id="admin-dashboard" class="hidden">
        <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 class="text-xl font-bold text-blue-600">Admin Panel</h1>
                <div class="flex items-center gap-4">
                    <span id="user-email" class="text-xs font-medium text-slate-400 hidden md:block"></span>
                    <button id="btn-logout" class="text-xs font-bold text-red-500 hover:text-red-700">Logout</button>
                </div>
            </div>
        </nav>

        <main class="max-w-4xl mx-auto px-6 py-12">
            <section class="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm mb-12">
                <h2 id="form-title" class="text-2xl font-bold mb-6">Tambah Proyek Baru</h2>
                <form id="project-form" class="space-y-5">
                    <input type="hidden" id="project-id">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Repository</label>
                        <input type="text" id="proj-name" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Contoh: RifqyNexus">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Link Tautan</label>
                        <input type="url" id="proj-link" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="https://github.com/RifqyDev/...">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Singkat</label>
                        <textarea id="proj-desc" required rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Jelaskan tentang proyek ini..."></textarea>
                    </div>
                    <div class="flex gap-4 pt-4">
                        <button type="submit" id="btn-submit" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition">Simpan Proyek</button>
                        <button type="button" id="btn-cancel" class="hidden flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Batal</button>
                    </div>
                </form>
            </section>

            <section>
                <h2 class="text-xl font-bold mb-6">Daftar Repository Aktif</h2>
                <div id="admin-project-list" class="grid grid-cols-1 gap-4">
                    <p class="text-slate-400 italic">Memuat data...</p>
                </div>
            </section>
        </main>
    </div>

    <script type="module" src="admin.js"></script>
</body>
</html>
