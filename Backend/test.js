const bcrypt = require('bcrypt'); // <---- use bcrypt, not bcryptjs

const hashed = "$2b$10$SYpiMyQjDnYjHUjh5bnc2.Y84cyIHlA1LuiQM/lKMSGB.MES6j71W";
const candidate = "Mithu@1208";

bcrypt.compare(candidate, hashed).then((match) => {
  console.log(match ? "Match!" : "No match.");
});
