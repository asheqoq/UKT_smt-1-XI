const apiKategori = "http://localhost:5000/api/kategori_alat";

const esc = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

async function request(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
    return data;
}

document.addEventListener("DOMContentLoaded", loadKategori);

async function loadKategori() {
    try {
        const data = await request(apiKategori);
        const tbody = document.getElementById("tabelKategori");
        tbody.innerHTML = "";

        data.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.className = "text-center";
            tr.innerHTML = `
                <td class="border p-2">${index + 1}</td>
                <td class="border p-2">${esc(item.nama_kategori)}</td>
                <td class="border p-2">${esc(item.deskripsi) || "-"}</td>
                <td class="border p-2 space-x-1"></td>
            `;

            const btnEdit = document.createElement("button");
            btnEdit.type = "button";
            btnEdit.textContent = "Edit";
            btnEdit.className = "bg-yellow-500 text-white px-2 py-1 rounded text-sm";
            btnEdit.onclick = () => editKategori(item);

            const btnHapus = document.createElement("button");
            btnHapus.type = "button";
            btnHapus.textContent = "Hapus";
            btnHapus.className = "bg-red-600 text-white px-2 py-1 rounded text-sm";
            btnHapus.onclick = () => hapusKategori(item.id);

            tr.lastElementChild.append(btnEdit, btnHapus);
            tbody.appendChild(tr);
        });
    } catch (err) {
        alert(err.message);
    }
}

document.getElementById("formKategori").addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const id = document.getElementById("id_kategori").value;
            const payload = {
                nama_kategori: document.getElementById("nama_kategori").value.trim(),
                deskripsi: document.getElementById("deskripsi").value.trim(),
            };

            await request(id ? `${apiKategori}/${id}` : apiKategori, {
                method: id ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            resetForm();
            await loadKategori();
        } catch (err) {
            alert(err.message);
        }
    });

function editKategori(item) {
    document.getElementById("id_kategori").value = item.id;
    document.getElementById("nama_kategori").value = item.nama_kategori;
    document.getElementById("deskripsi").value = item.deskripsi || "";
    document.getElementById("btnSubmitKategori").textContent = "Update";
    document.getElementById("nama_kategori").focus();
}

async function hapusKategori(id) {
    if (!confirm("Yakin hapus kategori ini?")) return;
    try {
        await request(`${apiKategori}/${id}`, { method: "DELETE" });
        if (document.getElementById("id_kategori").value == id) resetForm();
        await loadKategori();
    } catch (err) {
        alert(err.message);
    }
}

function resetForm() {
    document.getElementById("formKategori").reset();
    document.getElementById("id_kategori").value = "";
    document.getElementById("btnSubmitKategori").textContent = "Simpan";
}
