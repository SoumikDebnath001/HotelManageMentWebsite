const mongoose = require('mongoose');
const CountryState = require("../../../Models/countrystate");


exports.createCountryState = async (req, res) => {
    try {
          const data = req.body;
          const countryState = await CountryState.create(data);
          res.status(201).json({ message: 'Country and State created successfully', countryState });
      } catch (error) {
          res.status(500).json({ message: 'Error creating Country and State', error: error.message });
      }
};

exports.getAllCountryStates = async (req, res) => {
    try {
        const countryStates = await CountryState.find();
        res.status(200).json({ status: true, message: 'Country and State fetched successfully', data: countryStates });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching Country and State', error: error.message });
    }
};

