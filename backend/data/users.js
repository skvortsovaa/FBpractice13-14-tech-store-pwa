const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

const users = [
  {
    id: nanoid(6),
    email: "admin@mail.com",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "admin",
  },
  {
    id: nanoid(6),
    email: "user@mail.com",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "user",
  },
];

module.exports = users;