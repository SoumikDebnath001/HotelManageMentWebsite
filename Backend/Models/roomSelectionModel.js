const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSelectionSchema = new Schema({
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
    pricePerNight: Number,
    ////////////////////////////////////////////////////////////////////////
    checkInDate: {
        type: Date,
    },
    checkOutDate: {
        type: Date,
    },
    adults: {
        type: Number,
    },
    children: {
        type: Number,
    },
    ////////////////////////////////////////////////////////////////////////
    isFinal: {
        type: Boolean,
        default: false
    },
    selectedOn: {
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

const RoomSelection = mongoose.model('roomSelection', RoomSelectionSchema);

module.exports = RoomSelection;
