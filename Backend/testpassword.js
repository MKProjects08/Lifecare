// const bcrypt = require('bcrypt');

// bcrypt.compare('Password123!', '$2b$10$//pscmR8bKU2kKqGksZPCOKA2zL7GkRP2mPozrMQIsp.Tx3Ew6IqG')
//   .then(result => console.log(result))
//   .catch(err => console.error('Error:', err));

const bcrypt = require('bcrypt');
bcrypt.hash('Password@123', 10)
  .then(hash => console.log(hash))
  .catch(err => console.error('Error:', err));