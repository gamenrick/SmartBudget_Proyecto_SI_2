const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

// Registro de usuario
app.post('/register', async (req, res) => {
  console.log('🔹 Petición de registro recibida');         // LOG
  console.log('🔹 Body recibido:', req.body);              // LOG

  const { user, email, pass } = req.body;
  const hashed = await bcrypt.hash(pass, 10);
  const query = 'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)';
  db.query(query, [user, email, hashed], (err) => {
    if (err) {
      console.log('❌ Error en query registro:', err);     // LOG
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El usuario o correo ya existen.' });
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    console.log('✅ Usuario registrado correctamente');   // LOG
    res.json({ message: 'Usuario registrado correctamente.' });
  });
});

// Login
app.post('/login', (req, res) => {
  console.log('🔹 Petición de login recibida');         
  console.log('🔹 Body recibido:', req.body);          

  const { user, pass } = req.body;
  const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ? OR email = ?';
  db.query(query, [user, user], async (err, results) => {
    if (err) {
      console.log('❌ Error en query login:', err);    
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    console.log('🔹 Resultados del query:', results); 

    if (results.length === 0) {
      console.log('❌ Usuario no encontrado');        
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const valid = await bcrypt.compare(pass, results[0].contrasena);
    console.log('🔹 Contraseña válida:', valid);      

    if (!valid) {
      console.log('❌ Contraseña incorrecta');        
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    console.log('✅ Login exitoso para usuario ID:', results[0].id); 
    // Devuelve info básica del usuario (incluyendo ID)
    res.json({ id: results[0].id, nombre_usuario: results[0].nombre_usuario, email: results[0].email });
  });
});

// Obtener transacciones de un usuario
app.get('/transactions/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM transacciones WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.log('❌ Error al obtener transacciones:', err); // LOG
      return res.status(500).json({ message: 'Error al obtener transacciones' });
    }
    console.log('🔹 Transacciones obtenidas:', results); // LOG
    res.json(results);
  });
});

// Agregar transacción
app.post('/transactions', (req, res) => {
  console.log('🔹 Petición para agregar transacción:', req.body); // LOG
  const { user_id, type, category, description, amount, date } = req.body;
  db.query(
    'INSERT INTO transacciones (user_id, type, category, description, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, type, category, description, amount, date],
    (err, results) => {
      if (err) {
        console.log('❌ Error al agregar transacción:', err); // LOG
        return res.status(500).json({ message: 'Error al agregar transacción' });
      }
      console.log('✅ Transacción agregada con ID:', results.insertId); // LOG
      res.json({ id: results.insertId, ...req.body });
    }
  );
});

// Actualizar transacción
app.put('/transactions/:id', (req, res) => {
  const id = req.params.id;
  const { type, category, description, amount, date } = req.body;
  db.query(
    'UPDATE transacciones SET type=?, category=?, description=?, amount=?, date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [type, category, description, amount, date, id],
    (err) => {
      if (err) {
        console.log('❌ Error al actualizar transacción:', err); // LOG
        return res.status(500).json({ message: 'Error al actualizar transacción' });
      }
      console.log('✅ Transacción actualizada ID:', id); // LOG
      res.json({ message: 'Transacción actualizada' });
    }
  );
});

// Eliminar transacción
app.delete('/transactions/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM transacciones WHERE id=?', [id], (err) => {
    if (err) {
      console.log('❌ Error al eliminar transacción:', err); // LOG
      return res.status(500).json({ message: 'Error al eliminar transacción' });
    }
    console.log('✅ Transacción eliminada ID:', id); // LOG
    res.json({ message: 'Transacción eliminada' });
  });
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
