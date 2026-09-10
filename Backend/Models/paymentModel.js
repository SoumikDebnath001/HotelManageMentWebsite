const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotelRoomBooking",
        required: true
    },
    ////////////////////////////////////////////////////////////////////////
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
    },
    roomNumber: String,
    ////////////////////////////////////////////////////////////////////////
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'Razorpay'],
        required: true
    },
    transactionId: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    paymentStatus: {
        type: String,
        enum: ['paid', 'refunded'],
        default: 'paid'
    },
    paidOn: {
        type: Date,
        default: Date.now
    },
    refundedOn: Date,
    refundReason: String,
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

const Payment = mongoose.model('payment', PaymentSchema);

module.exports = Payment;
