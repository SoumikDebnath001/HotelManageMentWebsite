const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HotelSchema = new Schema({
    hotelName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    email: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    address: {
        type: String,
    },
    ////////////////////////////////Hotel code 
    hotelCode: {
        type: String,
    },
    ////////////////////////////////////////////////////////////////////////
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CountryState"
    },
    countryName: String,
    stateName: String,
    stateUniqueCode: String,
    cityName: String,
    cityUniqueCode: String,
    ////////////////////////////////////////////////////////////////////////
    starRating: {
        type: Number,
    },
    amenities: {
        type: [String],
    },
    image: {
        type: [String],
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin"
    },
    ////////////////////////////////////////////////////////////////////////
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee"
    },
    managerName: String,
    //////////////////////////
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "superadmin"
    },
    approvedOn: Date,
    rejectReason: String,
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


},
    {
        timestamps: true,   //to note created at and updated at 
        versionKey: false  //in  case of large version  we need this
    }

);

const Hotel = mongoose.model('hotel', HotelSchema);

module.exports = Hotel;
