const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passwordHash = require('password-hash');

const UserSchema = new Schema({
    firstMiddleName: String,
    lastName: String,

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: [String],
    },

    token: {
        type: String,
    },


    ////////////////////////////////////////////////////////////////////////
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    dateOfBirth: Date,
    ///////////////////////////
    nationalityid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country"
    },
    nationalityName: String,
    //////////////////////////
    maritalStatus: {
        type: String,
        enum: ["Single", "Married"]
    },
    anniversary: Date,
    ///////////////////////////
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City"
    },
    cityName: String,
    //////////////////////////
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State"
    },
    stateName: String,
    //////////////////////////
    contact: {
        mobileNumber: String,
        email: {
            type: String,
            required: true
        }
    },
    

    documents: {
        passportNumber: String,
        passportExpiryDate: Date,
        issuingCountry: String,
        panCardNumber: String
    },
    ////////////////////////////////////////////////////////////////////////
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

});

UserSchema.methods.comparePassword = function (userPassword) {
    return passwordHash.verify(userPassword, this.password)
}

const User = mongoose.model('user', UserSchema);

module.exports = User;