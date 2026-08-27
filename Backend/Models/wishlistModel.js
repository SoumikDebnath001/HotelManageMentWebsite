const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
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
    roomType: String,
    ////////////////////////////////////////////////////////////////////////
    addedOn: {
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

const Wishlist = mongoose.model('wishlist', WishlistSchema);

module.exports = Wishlist;
