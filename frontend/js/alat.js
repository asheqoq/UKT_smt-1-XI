const apiAlat = 'http://localhost:5000/api/alat';
const apiKategori = 'http://localhost:5000/api/kategori_alat';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function request(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadKategoriDropdown();
    await loadAlat();
});

document.getElementById('id_kategori').addEventListener('focus', () => loadKategoriDropdown());

async function loadKategoriDropdown() {
    try {
        const data = await request(apiKategori);
        const select = document.getElementById('id_kategori');
        const dipilih = select.value;
        select.innerHTML = '<option value="">-- Pilih Kategori --</option>';

        data.forEach((kat) => {
            const opt = document.createElement('option');
            opt.value = kat.id;
            opt.textContent = kat.nama_kategori;
            select.appendChild(opt);
        });
        select.value = dipilih;
    } catch (err) {
        alert(err.message);
    }
}

async function loadAlat() {
    try {
        const data = await request(apiAlat);
        const tbody = document.getElementById('tabelAlat');
        tbody.innerHTML = '';

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'text-center';
            tr.innerHTML = `
                <td class="border p-2">${index + 1}</td>
                <td class="border p-2">${esc(item.nama_alat)}</td>
                <td class="border p-2">${esc(item.nama_kategori) || '-'}</td>
                <td class="border p-2 capitalize">${esc(item.kondisi)}</td>
                <td class="border p-2">${esc(item.stok)}</td>
                <td class="border p-2 space-x-1"></td>
            `;

            const btnEdit = document.createElement('button');
            btnEdit.type = 'button';
            btnEdit.textContent = 'Edit';
            btnEdit.className = 'bg-yellow-500 text-white px-2 py-1 rounded text-sm';
            btnEdit.onclick = () => editAlat(item);

            const btnHapus = document.createElement('button');
            btnHapus.type = 'button';
            btnHapus.textContent = 'Hapus';
            btnHapus.className = 'bg-red-600 text-white px-2 py-1 rounded text-sm';
            btnHapus.onclick = () => hapusAlat(item.id);

            tr.lastElementChild.append(btnEdit, btnHapus);
            tbody.appendChild(tr);
        });
    } catch (err) {
        alert(err.message);
    }
}

document.getElementById('formAlat').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('id_alat').value;
        const payload = {
            nama_alat: document.getElementById('nama_alat').value.trim(),
            id_kategori: Number(document.getElementById('id_kategori').value),
            kondisi: document.getElementById('kondisi').value,
            stok: Number(document.getElementById('stok').value)
        };

        await request(id ? `${apiAlat}/${id}` : apiAlat, {
            method: id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        resetForm();
        await loadAlat();
    } catch (err) {
        alert(err.message);
    }
});

function editAlat(item) {
    document.getElementById('id_alat').value = item.id;
    document.getElementById('nama_alat').value = item.nama_alat;
    document.getElementById('id_kategori').value = item.id_kategori;
    document.getElementById('kondisi').value = item.kondisi;
    document.getElementById('stok').value = item.stok;
    document.getElementById('nama_alat').focus();
}

async function hapusAlat(id) {
    if (!confirm('Yakin hapus alat ini?')) return;
    try {
        await request(`${apiAlat}/${id}`, { method: 'DELETE' });
        if (document.getElementById('id_alat').value == id) resetForm();
        await loadAlat();
    } catch (err) {
        alert(err.message);
    }
}

function resetForm() {
    document.getElementById('formAlat').reset();
    document.getElementById('id_alat').value = '';
}
