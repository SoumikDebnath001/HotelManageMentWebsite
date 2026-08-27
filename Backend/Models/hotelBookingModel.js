const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HotelRoomBookingSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    userName: String,
    ////////////////////////////////////////////////////////////////////////
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel",
        required: true
    },
    hotelName: String,
    ////////////////////////////////////////////////////////////////////////
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
        required: true
    },
    roomNumber: String,
    roomType: String,
    ////////////////////////////////////////////////////////////////////////
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    numberOfNights: {
        type: Number,
    },
    adults: {
        type: Number,
    },
    children: {
        type: Number,
    },
    ////////////////////////////////////////////////////////////////////////
    pricePerNight: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    },
    ////////////////////////////////Offer applied on booking
    offerCode: {
        type: String,
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    payableAmount: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    ////////////////////////////////////////////////////////////////////////
    bookingStatus: {
        type: String,
        enum: ['booked', 'checkedIn', 'checkedOut', 'cancelled'],
        default: 'booked'
    },
    cancelledOn: Date,
    cancelReason: String,
    checkedInOn: Date,
    checkedOutOn: Date,
    ////////////////////////////////////////////////////////////////////////
    bookedOn: {
        type: Date,
        default: Date.now
    },
    ////////////////////////////////////////////////////////////////////////
    customFields: [
        {
            fieldName: {
                type: String,
            },
            fieldValue: {
                type: mongoose.Schema.Types.Mixed,
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }


});

const HotelRoomBooking = mongoose.model('hotelRoomBooking', HotelRoomBookingSchema);

module.exports = HotelRoomBooking;
