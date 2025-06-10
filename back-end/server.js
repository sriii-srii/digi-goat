// server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');



const app = express();
const PORT = 5000;

// ✅ CORS CONFIG — very important for Firefox + session
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session Setup — used to store user after login
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,         // 🔐 true only on HTTPS
    httpOnly: true,
    sameSite: 'lax'        // 🔁 required for cookie to pass in Firefox
  }
}));

// ✅ Allow uploads (like photo or goat image)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  express.static(path.join(__dirname, 'uploads'))(req, res, next);
});

// ✅ Route Imports (make sure these files exist)
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const goatRoutes = require('./routes/goatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const healthRoutes = require('./routes/healthRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

// ✅ Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/goats', goatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/purchases', purchaseRoutes);



// ✅ Catch-All 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Launch Backend Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
