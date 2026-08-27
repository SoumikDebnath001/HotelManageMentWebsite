const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomTypeSchema = new Schema({
    typeName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    basePrice: {
        type: Number,
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin"
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

const RoomType = mongoose.model('roomType', RoomTypeSchema);

module.exports = RoomType;
