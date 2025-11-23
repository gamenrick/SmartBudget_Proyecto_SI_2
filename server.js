const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 🔌 Conexión MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smartbudget'
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Conectado a MySQL SmartBudget");
});

// 🧾 Registrar usuario
app.post('/register', async (req, res) => {
  const { user, email, pass } = req.body;

  const hashed = await bcrypt.hash(pass, 10);

  const query = 'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)';
  db.query(query, [user, email, hashed], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'El usuario o correo ya existen.' });
      }
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json({ message: 'Usuario registrado correctamente.' });
  });
});

// 🔐 Login
app.post('/login', (req, res) => {
  const { user, pass } = req.body;

  const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ? OR email = ?';
  db.query(query, [user, user], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en el servidor.' });
    if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const valid = await bcrypt.compare(pass, results[0].contrasena);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta.' });

    res.json({ message: 'Inicio de sesión exitoso.' });
  });
});

// 🚀 Iniciar servidor
app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
