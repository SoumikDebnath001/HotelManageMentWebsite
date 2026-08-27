const { z } = require("zod");

const employeeRegistration = z.object({
  name: z.string().min(3).max(50),

  email: z.string().email(),

  role: z.enum([
    "manager",
    "staff",
    "receptionist",
    "housekeeping",
    "chef",
    "maintenance",
  ]),

  password: z.string().min(6).max(40),
});

module.exports = { employeeRegistration };