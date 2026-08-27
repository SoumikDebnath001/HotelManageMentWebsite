const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomsSchema = new Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel",
        required: true
    },
    hotelName: String,
    ////////////////////////////////////////////////////////////////////////
    roomNumber: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        enum: ['single', 'double', 'triple', 'queen', 'king', 'suite', 'deluxe'],
        required: true
    },
    floor: {
        type: Number,
    },
    description: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    pricePerNight: {
        type: Number,
        required: true
    },
    maxAdults: {
        type: Number,
    },
    maxChildren: {
        type: Number,
    },
    bedCount: {
        type: Number,
    },
    ////////////////////////////////////////////////////////////////////////
    amenities: {
        type: [String],
    },
    image: {
        type: [String],
    },
    ////////////////////////////////////////////////////////////////////////
    availabilityStatus: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
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

const Rooms = mongoose.model('rooms', RoomsSchema);

module.exports = Rooms;
