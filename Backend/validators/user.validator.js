const {z} = require("zod");

const userRegistration = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(40),
});

module.exports = { userRegistration };