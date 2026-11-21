const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const serverError = (res, err) => {
  console.error(err.message);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
};

app.get("/", (req, res) => {
  res.send(
    "Selamat Datang di Server Backend WarunGmenur, Uji coba nodemon berhasil",
  );
});

// kategori
app.get("/api/kategori_alat", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_kategori AS id, nama_kategori, deskripsi
       FROM kategori_alat ORDER BY id_kategori`,
    );
    res.json(r.rows);
  } catch (err) {
    serverError(res, err);
  }
});

app.post("/api/kategori_alat", async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const r = await pool.query(
      `INSERT INTO kategori_alat (nama_kategori, deskripsi)
       VALUES ($1,$2) RETURNING id_kategori AS id, nama_kategori, deskripsi`,
      [nama_kategori, deskripsi || null],
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.patch("/api/kategori_alat/:id", async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const r = await pool.query(
      `UPDATE kategori_alat SET nama_kategori=$1, deskripsi=$2
       WHERE id_kategori=$3
       RETURNING id_kategori AS id, nama_kategori, deskripsi`,
      [nama_kategori, deskripsi || null, req.params.id],
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    res.json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.delete("/api/kategori_alat/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM kategori_alat WHERE id_kategori=$1", [
      req.params.id,
    ]);
    res.json({ message: "Kategori dihapus" });
  } catch (err) {
    if (err.code === "23503")
      return res.status(409).json({
          error: "Kategori masih dipakai oleh data alat, tidak bisa dihapus",
        });
    serverError(res, err);
  }
});

// alat
app.get("/api/alat", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT a.id_alat AS id, a.id_kategori, a.nama_alat, a.kondisi, a.stok, a.lokasi, k.nama_kategori
       FROM alat a
       LEFT JOIN kategori_alat k ON k.id_kategori = a.id_kategori
       ORDER BY a.id_alat`,
    );
    res.json(r.rows);
  } catch (err) {
    serverError(res, err);
  }
});

app.post("/api/alat", async (req, res) => {
  try {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
    const r = await pool.query(
      `INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi)
       VALUES ($1,$2,$3,$4,$5) RETURNING id_alat AS id, *`,
      [id_kategori, nama_alat, kondisi || null, stok, lokasi || null],
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.patch("/api/alat/:id", async (req, res) => {
  try {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
    const r = await pool.query(
      `UPDATE alat SET id_kategori=$1, nama_alat=$2, kondisi=$3, stok=$4, lokasi=COALESCE($5, lokasi)
       WHERE id_alat=$6 RETURNING id_alat AS id, *`,
      [id_kategori, nama_alat, kondisi, stok, lokasi || null, req.params.id],
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Alat tidak ditemukan" });
    res.json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.delete("/api/alat/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM alat WHERE id_alat=$1", [req.params.id]);
    res.json({ message: "Alat dihapus" });
  } catch (err) {
    if (err.code === "23503")
      return res.status(409).json({
          error: "Alat masih dipakai di data peminjaman, tidak bisa dihapus",
        });
    serverError(res, err);
  }
});

// peminjaman
app.get("/api/peminjaman", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id_peminjaman AS id, p.id_alat, p.nama_peminjam, p.kelas,
            p.tanggal_pinjam, p.tanggal_kembali, p.jumlah, p.status, a.nama_alat
       FROM peminjaman p
       LEFT JOIN alat a ON a.id_alat = p.id_alat
       ORDER BY p.id_peminjaman`,
    );
    res.json(r.rows);
  } catch (err) {
    serverError(res, err);
  }
});

app.post("/api/peminjaman", async (req, res) => {
  try {
    const {
      id_alat,
      nama_peminjam,
      kelas,
      tanggal_pinjam,
      tanggal_kembali,
      jumlah,
      status,
    } = req.body;
    const r = await pool.query(
      `INSERT INTO peminjaman (id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id_peminjaman AS id, *`,
      [
        id_alat,
        nama_peminjam,
        kelas || null,
        tanggal_pinjam,
        tanggal_kembali || null,
        jumlah || 1,
        status || "Dipinjam",
      ],
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// Edit status
app.patch("/api/peminjaman/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Dipinjam", "Dikembalikan", "Terlambat"].includes(status))
      return res.status(400).json({ error: "Status tidak valid" });

    const isReturn = status === "Dikembalikan";
    const r = await pool.query(
      `UPDATE peminjaman
       SET status=$1,
        tanggal_kembali = CASE WHEN $2::boolean
        THEN COALESCE(tanggal_kembali, CURRENT_DATE)
        ELSE tanggal_kembali END
       WHERE id_peminjaman=$3 RETURNING id_peminjaman AS id, *`,
      [status, isReturn, req.params.id],
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Data peminjaman tidak ditemukan" });
    res.json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// Pengembalian
app.patch("/api/peminjaman/:id", async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE peminjaman SET status='Dikembalikan', tanggal_kembali=CURRENT_DATE
       WHERE id_peminjaman=$1 AND status='Dipinjam' RETURNING *`,
      [req.params.id],
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Data tidak ditemukan atau sudah dikembalikan" });
    res.json(r.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.delete("/api/peminjaman/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM peminjaman WHERE id_peminjaman=$1", [req.params.id,]);
    res.json({ message: "Data peminjaman dihapus" });
  } catch (err) {
    serverError(res, err);
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`),
);
