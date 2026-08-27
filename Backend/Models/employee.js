const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passwordHash = require('password-hash');

const EmployeeSchema = new Schema({
    //============================================================Required Fields 
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,       
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['manager', 'staff', 'receptionist', 'housekeeping', 'chef', 'maintenance']
    },
    password: {
        type: String,
        required: true
    },
    token : {
        type:String,
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel"
    },

    //============================================================Optional Fields
    image: {
        type: [String],
    },
    customFields:[
        {
            fieldName: {
                type: String,
            },
            fieldValue: {
                type: mongoose.Schema.Types.Mixed,
            }
        }
    ],
    isDefaultPassword: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }


});

EmployeeSchema.methods.comparePassword = function (employeePassword) {
    return passwordHash.verify(employeePassword, this.password)
}

const Employee = mongoose.model('employee', EmployeeSchema);

module.exports = Employee;
