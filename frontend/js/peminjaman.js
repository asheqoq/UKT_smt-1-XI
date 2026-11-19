async function loadPeminjaman() {
    try {
        const response = await fetch('http://localhost:5000/api/peminjaman'); const
            result = await response.json();
        console.log(result);
        const peminjamanList = document.getElementById('peminjaman-list');
        peminjamanList.innerHTML = '';
        if (result && result.length > 0) {
            let no = 1;
            result.forEach(peminjaman => {
                const row = `
<tr class="hover:bg-gray-50 transition-colors"> <td class="py-4 px-6
text-gray-900">${alat.id_alat}</td> <td class="py-4 px-6 font-medium text-gray
900">${alat.id_kategori}</td>
<td class="py-4 px-6 text-gray
600">${alat.nama_alat}</td>
<td class="py-4 px-6 text-gray
600">${alat.kondisi}</td>
<td class="py-4 px-6 text-gray
600">${alat.stok}</td>
<td class="py-4 px-6 text-gray
600">${alat.lokasi}</td>
<td class="py-4 px-6 text-gray
600">${alat.aksi}</td>
</tr>
`;
                peminjamanList.innerHTML += row;
            });
        } else {
            peminjamanList.innerHTML = `
<tr>
<td colspan="4" class="py-4 px-6 text-center text-gray 500">Belum ada
alat yang ditambahkan.</td>
</tr>
`;
        }
    } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        document.getElementById('alat-list').innerHTML = ` <tr>
<td colspan="4" class="py-4 px-6 text-center text-red 500">Gagal
memuat data alat. Pastikan server aktif.</td>
</tr>
`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadPeminjaman();
});