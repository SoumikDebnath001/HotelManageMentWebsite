const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountryStateSchema = new Schema({
    countryName: {
        type: String,
        required: true
    },
    State: [{
        stateName: {
            type: String,
        },
        stateUniqueCode: {
            type: String,
        },
        city: [{
            cityName: {
                type: String,
            },
            cityUniqueCode: {
                type: String,
            },

        }]

    }],



});

const CountryState = mongoose.model('CountryState', CountryStateSchema);

module.exports = CountryState;