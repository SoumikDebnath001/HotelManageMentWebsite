const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passwordHash = require('password-hash');

const AdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    },
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
}, {
    timestamps: true,
    versionKey: false
});

AdminSchema.pre("save", function () {
    if (this.isModified("password")) {
        this.password = passwordHash.generate(this.password);
    }
});

AdminSchema.methods.comparePassword = function (adminPassword) {
    return passwordHash.verify(adminPassword, this.password);
};

const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;
