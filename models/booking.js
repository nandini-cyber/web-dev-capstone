import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    // Customer Information
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerEmail: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
    },
    
    // Service Information
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: ['restaurant', 'spa', 'gym', 'salon'],
        lowercase: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    businessLocation: {
        type: String,
        trim: true
    },
    serviceDetails: {
        type: String,
        trim: true
    },
    
    // Booking Details
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    bookingTime: {
        type: String,
        required: [true, 'Booking time is required']
    },
    numberOfGuests: {
        type: Number,
        default: 1,
        min: [1, 'Number of guests must be at least 1']
    },
    specialRequests: {
        type: String,
        trim: true
    },
    
    // Booking Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    
    // Booking Reference
    bookingReference: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        const prefix = this.serviceType.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingReference = `${prefix}-${timestamp}-${random}`;
    }
    next();
});

// Index for faster queries
bookingSchema.index({ customerEmail: 1, createdAt: -1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
