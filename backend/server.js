const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(
    "Selamat Datang di Server Backend WarunGmenur, Uji coba nodemon berhasil",
  );
});


// get
// alat
app.get("/api/alat", async (req, res) => {
    try {
    const result = await pool.query("SELECT * FROM alat");
    res.json(result.rows);
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan padaserver" }); 
  }
});
// kategori_alat
app.get("/api/kategori_alat", async (req, res) => {
    try {
    const result = await pool.query("SELECT * FROM kategori_alat");
    res.json(result.rows);
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});
// peminjaman
app.get("/api/peminjaman", async (req, res) => {
    try {
    const result = await pool.query("SELECT * FROM peminjaman");
    res.json(result.rows);
  } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
});


// post
// alat baru
app.post("/api/alat", async (req, res) => {
    try {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
    const q = await pool.query(
      `INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi)
            VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_kategori, nama_alat, kondisi || null, stok, lokasi || null],
    );
    res.status(201).json(q.rows[0]);
  } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});
// Kategori_alat
app.post("/api/kategori_alat", async (req, res) => {
    try {
    const { nama_kategori, deskripsi } = req.body;
    const q = await pool.query(
      `INSERT INTO kategori_alat (nama_kategori, deskripsi)
            VALUES ($1,$2)  RETURNING *`,
      [nama_kategori, deskripsi || null]);
    res.status(201).json(q.rows[0]);
  } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});
// peminjaman
app.post("/api/peminjaman", async (req, res) => {
    try {
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;
    const q = await pool.query(
      `INSERT INTO peminjaman (id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7)  RETURNING *`,
      [id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status]);
    res.status(201).json(q.rows[0]);
  } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});


// patch/update
// alat
app.patch("/api/alat/:id", async (req, res)=>{
    try{
        const {id_kategori, nama_alat, kondisi, stok, lokasi} = req.body
        const q = await pool.query(
            `UPDATE alat set id_kategori=$1, nama_alat=$2, kondisi=$3, stok=$4, lokasi=$5
            WHERE id_alat=$6 RETURNING *`,
        [id_kategori, nama_alat, kondisi, stok, lokasi]);
        if(!q.rows.length) return res.status(404).json({message:'Alat tidak ditemukan'});
        res.json(q.rows[0]);
    }catch(err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});
// kategori_alat
app.patch("/api/kategori_alat/:id", async (req, res)=>{
    try{
        const {nama_kategori, deskripsi} = req.body
        const q = await pool.query(
            `UPDATE alat set nama_kategori=$1, deskripsi=$2, 
            WHERE id_alat=$3 RETURNING *`,
        [nama_kategori, deskripsi]);
        if(!q.rows.length) return res.status(404).json({message:'Kategori tidak ditemukan'});
        res.json(q.rows[0]);
    }catch(err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});
// Pengembalian: stok bertambah otomatis oleh trigger
app.patch('/api/peminjaman/:id/kembali', async (req, res) => {
    try{
        const r = await pool.query(
            `UPDATE peminjaman SET status='Dikembalikan', tanggal_kembali=CURRENT_DATE
            WHERE id_peminjaman=$1 AND status='Dipinjam' RETURNING *`,
            [req.params.id]);
        if (!r.rows.length) return res.status(404).json({ message: 'Data tidak ditemukan atau sudah dikembalikan' });
        res.json(r.rows[0]);
    }catch (err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});


// delete
// Alat
app.delete("/api/alat/:id", async (req, res)=>{
    try{
        await pool.query('DELETE FROM alat WHERE id_alat = $1', [req.params.id]);
        res.json({ message: 'Alat dihapus' });
    }catch(err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});
// Kategori_alat
app.delete("/api/kategori_alat/:id", async (req, res)=>{
    try{
        await pool.query('DELETE FROM kategori_alat WHERE id_kategori = $1', [req.params.id]);
        res.json({ message: 'Alat dihapus' });
    }catch(err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});
// Peminjaman
app.delete("/api/peminjaman/:id", async (req, res)=>{
    try{
        await pool.query('DELETE FROM peminjaman WHERE id_peminjaman = $1', [req.params.id]);
        res.json({ message: 'Alat dihapus' });
    }catch(err){
        console.log(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
