const apiPinjam = 'http://localhost:5000/api/peminjaman';
const apiAlat = 'http://localhost:5000/api/alat';
const opsiStatus = ['Dipinjam', 'Dikembalikan', 'Terlambat'];

const warnaStatus = {
    Dipinjam: 'bg-blue-100 text-blue-800',
    Dikembalikan: 'bg-green-100 text-green-800',
    Terlambat: 'bg-red-100 text-red-800'
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function request(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAlatDropdown();
    await loadPeminjaman();
});

document.getElementById('id_alat').addEventListener('focus', () => loadAlatDropdown());

async function loadAlatDropdown() {
    try {
        const data = await request(apiAlat);
        const select = document.getElementById('id_alat');
        const dipilih = select.value;
        select.innerHTML = '<option value="">-- Pilih Alat --</option>';

        data.forEach((alat) => {
            const opt = document.createElement('option');
            opt.value = alat.id;
            opt.textContent = `${alat.nama_alat} (stok: ${alat.stok})`;
            select.appendChild(opt);
        });
        select.value = dipilih;
    } catch (err) {
        alert(err.message);
    }
}

function formatTanggal(tgl) {
    if (!tgl) return '';
    const d = new Date(tgl);
    if (isNaN(d)) return String(tgl).slice(0, 10);
    // pakai tanggal lokal agar tidak mundur 1 hari karena zona waktu
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function loadPeminjaman() {
    try {
        const data = await request(apiPinjam);
        const tbody = document.getElementById('tabelPeminjaman');
        tbody.innerHTML = '';

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'text-center';
            tr.innerHTML = `
                <td class="border p-2">${index + 1}</td>
                <td class="border p-2">${esc(item.nama_peminjam)}</td>
                <td class="border p-2">${esc(item.nama_alat) || '-'}</td>
                <td class="border p-2">${formatTanggal(item.tanggal_pinjam)}</td>
                <td class="border p-2">
                    <span class="px-2 py-1 rounded text-sm ${warnaStatus[item.status] || 'bg-gray-100 text-gray-800'}">${esc(item.status)}</span>
                </td>
                <td class="border p-2 space-x-1"></td>
            `;

            const statusTd = tr.children[4];
            const aksiTd = tr.children[5];

            const btnEdit = document.createElement('button');
            btnEdit.type = 'button';
            btnEdit.textContent = 'Edit';
            btnEdit.className = 'bg-yellow-500 text-white px-2 py-1 rounded text-sm';
            btnEdit.onclick = () => aktifkanEditStatus(item.id, item.status, statusTd, aksiTd);

            const btnHapus = document.createElement('button');
            btnHapus.type = 'button';
            btnHapus.textContent = 'Hapus';
            btnHapus.className = 'bg-red-600 text-white px-2 py-1 rounded text-sm';
            btnHapus.onclick = () => hapusPeminjaman(item.id);

            aksiTd.append(btnEdit, btnHapus);
            tbody.appendChild(tr);
        });
    } catch (err) {
        alert(err.message);
    }
}

document.getElementById('formPeminjaman').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const payload = {
            nama_peminjam: document.getElementById('nama_peminjam').value.trim(),
            kelas: document.getElementById('kelas').value.trim(),
            id_alat: Number(document.getElementById('id_alat').value),
            jumlah: Number(document.getElementById('jumlah').value) || 1,
            tanggal_pinjam: document.getElementById('tanggal_pinjam').value,
            status: document.getElementById('status').value
        };

        await request(apiPinjam, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        document.getElementById('formPeminjaman').reset();
        document.getElementById('jumlah').value = 1;
        await loadAlatDropdown();   // stok bisa berubah karena trigger
        await loadPeminjaman();
    } catch (err) {
        alert(err.message);
    }
});

// Edit langsung di tabel: hanya kolom status yang bisa diubah
function aktifkanEditStatus(id, currentStatus, statusTd, aksiTd) {
    const select = document.createElement('select');
    select.className = 'border p-1 rounded';

    opsiStatus.forEach((st) => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        if (st === currentStatus) opt.selected = true;
        select.appendChild(opt);
    });

    statusTd.replaceChildren(select);

    const btnSimpan = document.createElement('button');
    btnSimpan.type = 'button';
    btnSimpan.textContent = 'Simpan';
    btnSimpan.className = 'bg-green-600 text-white px-2 py-1 rounded text-sm';
    btnSimpan.onclick = async () => {
        try {
            await request(`${apiPinjam}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: select.value })
            });
            await loadAlatDropdown();
            await loadPeminjaman();
        } catch (err) {
            alert(err.message);
        }
    };

    const btnBatal = document.createElement('button');
    btnBatal.type = 'button';
    btnBatal.textContent = 'Batal';
    btnBatal.className = 'bg-gray-400 text-white px-2 py-1 rounded text-sm';
    btnBatal.onclick = () => loadPeminjaman();

    aksiTd.replaceChildren(btnSimpan, btnBatal);
}

async function hapusPeminjaman(id) {
    if (!confirm('Yakin hapus data peminjaman ini?')) return;
    try {
        await request(`${apiPinjam}/${id}`, { method: 'DELETE' });
        await loadPeminjaman();
    } catch (err) {
        alert(err.message);
    }
}