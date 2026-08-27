const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AmenitySchema = new Schema({
    amenityName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    icon: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "superadmin"
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

const Amenity = mongoose.model('amenity', AmenitySchema);

module.exports = Amenity;
