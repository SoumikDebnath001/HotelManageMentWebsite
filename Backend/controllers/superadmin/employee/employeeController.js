const mongoose = require("mongoose");
const Employee = require("../../../Models/employee");
const {employeeRegistration} = require("../../../validators/employee.validator");
const { Validator } = require("node-input-validator");
const passwordHash = require("password-hash");
var jwt = require("jsonwebtoken");

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  let employeeData = await Employee.findOne({ token: token, isDeleted: false }).exec();
  return employeeData;
};
//=========================================================================================================== Create Employee
const createEmployee = async (req, res) => {
  const v = new Validator(req.body, {
    name: "required",
    email: "required|email",
    role: "required",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    if (req.body.role == "manager") {
      return res.status(403).json({
        status: false,
        message: "Managers must be created by an admin for one of their hotels",
      });
    }

    const existingEmployee = await Employee.findOne({ email: req.body.email, isDeleted: false });
    if (existingEmployee) {
      return res.status(400).json({
        status: false,
        message: "Employee already exists with this email",
      });
    }

    let employeeData = {
      ...req.body,
      password: passwordHash.generate(req.body.email), // default password is the email
      token: createToken({ email: req.body.email, role: req.body.role, createdOn: new Date() }),
      isDefaultPassword: true,
      createdOn: new Date(),
    };

    const employeeInsert = new Employee(employeeData);
    await employeeInsert.save();

    employeeInsert.password = null; // Hide password from response
    return res.status(201).json({
      status: true,
      message: "Employee created successfully, default password is the employee email",
      data: employeeInsert,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {createEmployee}
