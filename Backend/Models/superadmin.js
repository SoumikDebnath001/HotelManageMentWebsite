const mongoose = require('mongoose');
const { token } = require('morgan');
const Schema = mongoose.Schema;
const passwordHash = require('password-hash');

const SuperAdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token : {
        type:String,
    },
    
 
},{
    timestamps: true,
    versionKey: false
}

);


SuperAdminSchema.pre("save", function () {

  if (this.isModified("password")) {
    this.password = passwordHash.generate(this.password);
  }

});
SuperAdminSchema.methods.comparePassword= function(adminPassword){
return passwordHash.verify(adminPassword,this.password)}

const SuperAdmin = mongoose.model('superadmin', SuperAdminSchema);

module.exports = SuperAdmin;