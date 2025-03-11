const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    userId VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )
`;

module.exports = userSchema;
