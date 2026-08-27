const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel",
        required: true
    },
    hotelName: String,
    ////////////////////////////////////////////////////////////////////////
    offerName: {
        type: String,
        required: true
    },
    offerCode: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    maxDiscountAmount: {
        type: Number,
    },
    minBookingAmount: {
        type: Number,
    },
    ////////////////////////////////////////////////////////////////////////
    validFrom: {
        type: Date,
        required: true
    },
    validTill: {
        type: Date,
        required: true
    },
    ////////////////////////////////////////////////////////////////////////
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee"
    },
    createdOn: {
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

const Offer = mongoose.model('offer', OfferSchema);

module.exports = Offer;
