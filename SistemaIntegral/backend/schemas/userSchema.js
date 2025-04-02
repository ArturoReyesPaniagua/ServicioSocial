// usuarioSchema.js
const usuarioSchema = `
  CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin', 'user'),
    id_area INT,
    FOREIGN KEY (id_area) REFERENCES Area(id_area)
  )
`;
module.exports = usuarioSchema;