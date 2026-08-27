const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotelRoomBooking",
        required: true
    },
    ////////////////////////////////////////////////////////////////////////
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    reviewedOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: Date,
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


//pre-save hooks 
//indexing
//unique vs index

const Review = mongoose.model('review', ReviewSchema);

module.exports = Review;
