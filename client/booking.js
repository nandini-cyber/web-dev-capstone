// API Base URL - Update this to your server URL when deployed
const API_BASE_URL = 'http://localhost:3000/api';

// Business data for each service type
const businesses = {
    restaurant: [
        { name: 'The Gourmet Kitchen', location: 'Downtown Plaza' },
        { name: 'Ocean View Bistro', location: 'Waterfront District' },
        { name: 'Mountain Peak Restaurant', location: 'Highland Center' },
        { name: 'Urban Eatery', location: 'City Square' },
        { name: 'Garden Terrace', location: 'Park Avenue' },
        { name: 'Spice Route', location: 'Asian Quarter' }
    ],
    spa: [
        { name: 'Zen Spa Retreat', location: 'Wellness District' },
        { name: 'Serenity Spa', location: 'Tranquil Gardens' },
        { name: 'Luxury Wellness Center', location: 'Resort Quarter' },
        { name: 'Natural Healing Spa', location: 'Green Valley' },
        { name: 'Royal Spa & Massage', location: 'Palace Street' },
        { name: 'Bliss Body & Soul', location: 'Harmony Plaza' }
    ],
    gym: [
        { name: 'PowerFit Gym', location: 'Sports Complex' },
        { name: 'Elite Fitness Center', location: 'Athletic District' },
        { name: 'Iron Paradise', location: 'Muscle Beach' },
        { name: 'Yoga & Fitness Studio', location: 'Harmony Plaza' },
        { name: 'CrossFit Arena', location: 'Champion Way' },
        { name: '24/7 Fitness Hub', location: 'Downtown' }
    ],
    salon: [
        { name: 'Elite Salon', location: 'Fashion Avenue' },
        { name: 'Glamour Hair Studio', location: 'Style District' },
        { name: 'Prestige Beauty Lounge', location: 'Elegant Square' },
        { name: 'Trendy Cuts & Colors', location: 'Modern Street' },
        { name: 'Luxury Hair Boutique', location: 'Designer Lane' },
        { name: 'Quick Cuts Express', location: 'Downtown' }
    ]
};

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const serviceTypeSelect = document.getElementById('serviceType');
const businessNameSelect = document.getElementById('businessName');
const bookingDateInput = document.getElementById('bookingDate');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const checkBookingsModal = document.getElementById('checkBookingsModal');
const checkBookingBtn = document.querySelector('.check-booking-btn');
const checkBookingsForm = document.getElementById('checkBookingsForm');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
bookingDateInput.setAttribute('min', today);

// Handle service type change
serviceTypeSelect.addEventListener('change', function() {
    const selectedService = this.value;
    businessNameSelect.innerHTML = '<option value="">Select a business</option>';
    
    if (selectedService && businesses[selectedService]) {
        businesses[selectedService].forEach(business => {
            const option = document.createElement('option');
            option.value = business.name;
            option.dataset.location = business.location;
            option.textContent = `${business.name} - ${business.location}`;
            businessNameSelect.appendChild(option);
        });
        businessNameSelect.disabled = false;
    } else {
        businessNameSelect.innerHTML = '<option value="">First select a service type</option>';
        businessNameSelect.disabled = true;
    }
});

// Handle form submission
bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Get form data
    const formData = new FormData(bookingForm);
    const selectedBusiness = businessNameSelect.options[businessNameSelect.selectedIndex];
    const businessLocation = selectedBusiness ? selectedBusiness.dataset.location : '';
    
    const bookingData = {
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        serviceType: formData.get('serviceType'),
        businessName: formData.get('businessName'),
        businessLocation: businessLocation,
        serviceDetails: formData.get('serviceDetails'),
        bookingDate: formData.get('bookingDate'),
        bookingTime: formData.get('bookingTime'),
        numberOfGuests: parseInt(formData.get('numberOfGuests')),
        specialRequests: formData.get('specialRequests')
    };
    
    try {
        // Send booking request to API
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal with booking reference
            document.getElementById('bookingRef').textContent = result.data.bookingReference;
            showSuccessModal();
            
            // Reset form
            bookingForm.reset();
            businessNameSelect.innerHTML = '<option value="">First select a service type</option>';
            businessNameSelect.disabled = true;
        } else {
            // Show error message
            alert('Booking failed: ' + (result.message || 'Please try again later.'));
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('An error occurred while processing your booking. Please try again later.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Show success modal
function showSuccessModal() {
    successModal.classList.add('active');
}

// Close success modal
function closeModal() {
    successModal.classList.remove('active');
}

// Close modal on outside click
successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
        closeModal();
    }
});

// Check Bookings functionality
checkBookingBtn.addEventListener('click', function(e) {
    e.preventDefault();
    checkBookingsModal.classList.add('active');
});

function closeCheckBookingsModal() {
    checkBookingsModal.classList.remove('active');
    document.getElementById('checkEmail').value = '';
    document.getElementById('bookingsList').innerHTML = '';
}

checkBookingsModal.addEventListener('click', function(e) {
    if (e.target === checkBookingsModal) {
        closeCheckBookingsModal();
    }
});

// Handle check bookings form submission
checkBookingsForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('checkEmail').value;
    const bookingsList = document.getElementById('bookingsList');
    
    bookingsList.innerHTML = '<p style="text-align: center;">Loading...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/customer/${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            bookingsList.innerHTML = '';
            
            result.data.forEach(booking => {
                const bookingItem = document.createElement('div');
                bookingItem.className = 'booking-item';
                
                const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const serviceIcon = {
                    restaurant: '🍽️',
                    spa: '✨',
                    gym: '🏋️',
                    salon: '✂️'
                }[booking.serviceType] || '📅';
                
                bookingItem.innerHTML = `
                    <h4>${serviceIcon} ${booking.businessName}</h4>
                    <p><strong>Reference:</strong> ${booking.bookingReference}</p>
                    <p><strong>Date:</strong> ${bookingDate}</p>
                    <p><strong>Time:</strong> ${booking.bookingTime}</p>
                    <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                    <p><strong>Service:</strong> ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)}</p>
                    ${booking.serviceDetails ? `<p><strong>Details:</strong> ${booking.serviceDetails}</p>` : ''}
                    <span class="booking-status status-${booking.status}">${booking.status.toUpperCase()}</span>
                `;
                
                bookingsList.appendChild(bookingItem);
            });
        } else {
            bookingsList.innerHTML = '<p style="text-align: center; color: #666;">No bookings found for this email address.</p>';
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        bookingsList.innerHTML = '<p style="text-align: center; color: #e74c3c;">Error loading bookings. Please try again.</p>';
    }
});

// Phone number formatting (optional enhancement)
const phoneInput = document.getElementById('customerPhone');
phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            e.target.value = value;
        } else if (value.length <= 6) {
            e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
});

// Form validation enhancements
const emailInput = document.getElementById('customerEmail');
emailInput.addEventListener('blur', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        this.setCustomValidity('Please enter a valid email address');
        this.reportValidity();
    } else {
        this.setCustomValidity('');
    }
});

// Number of guests validation
const guestsInput = document.getElementById('numberOfGuests');
guestsInput.addEventListener('input', function() {
    if (this.value < 1) {
        this.value = 1;
    } else if (this.value > 20) {
        this.value = 20;
    }
});

// Auto-populate service type from URL parameter (if coming from main page)
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceType = urlParams.get('service');
    const businessName = urlParams.get('business');
    
    if (serviceType && businesses[serviceType]) {
        serviceTypeSelect.value = serviceType;
        serviceTypeSelect.dispatchEvent(new Event('change'));
        
        if (businessName) {
            setTimeout(() => {
                businessNameSelect.value = businessName;
            }, 100);
        }
    }
});

console.log('BookEasy Booking System Initialized');
console.log('API Base URL:', API_BASE_URL);