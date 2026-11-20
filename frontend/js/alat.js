async function loadAlat() {
    try {
        const response = await fetch('http://localhost:5000/api/alat'); 
        const result = await response.json();
        console.log(result);
        const alatList = document.getElementById('alat-list');
        alatList.innerHTML = '';
        if (result && result.length > 0) {
            let no = 1;
            result.forEach(alat => {
                const row =`
                    <tr class="hover:bg-gray-50 transition-colors"> 
                        <td class="py-4 px-6 text-center text-gray-900">${alat.id_alat}</td> 
                        <td class="py-4 px-6 text-center font-medium text-gray-900">${alat.id_kategori}</td>
                        <td class="py-4 px-6 text-center text-gray-600">${alat.nama_alat}</td>
                        <td class="py-4 px-6 text-center text-gray-600">${alat.kondisi}</td>
                        <td class="py-4 px-6 text-center text-gray-600">${alat.stok}</td>
                        <td class="py-4 px-6 text-center text-gray-600">${alat.lokasi}</td>
                        <td class="py-4 px-6 text-center text-gray-600">${alat.aksi}</td>
                    </tr>
                `;
                alatList.innerHTML += row;
            });
        } else {
            alatList.innerHTML =`
                <tr>
                    <td colspan="4" class="py-4 px-6 text-center text-gray-500">Belum ada alat yang ditambahkan.</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Gagal mengambil data alat:', error);
        document.getElementById('alat-list').innerHTML =`
        <tr>
            <td colspan="4" class="py-4 px-6 text-center text-red-500">Gagal memuat data alat. Pastikan server aktif.</td>
        </tr>
        `;
    }
}

async function hapusAlat() {
    try {
        
    } catch (error) {
        
    }
}

async function loadKategori() {
    try {
    const response = await fetch('http://localhost:5000/api/kategori_alat'); 
    const result = await response.json();
    const categorySelect = document.getElementById('id_kategori');
        categorySelect.innerHTML = `<option value="" disabled selected>-- Pilih Kategori --</option>`;
    result.data.forEach(kategori_alat => {
        const option = document.createElement('option');
        option.value = kategori_alat.id;     
        option.textContent = kategori_alat.nama;
        categorySelect.appendChild(option);
    });
    } catch(error){
        document.getElementById('id_kategori').innerHTML = `<option value="" disabled>Gagal memuat kategori</option>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAlat();
    loadKategori();
});