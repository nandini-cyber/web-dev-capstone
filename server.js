import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Booking from './models/Booking.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "client")));
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/BookEasy';

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));


// ===================== API ROUTES ======================

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking({ ...req.body, status: 'pending' });
        await booking.save();
        res.status(201).json({ success: true, message: 'Booking created', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, message: 'Status updated', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get bookings by customer email
app.get('/api/bookings/customer/:email', async (req, res) => {
    try {
        const bookings = await Booking.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API Running' }));


// ✅ Serve index.html for all frontend routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));