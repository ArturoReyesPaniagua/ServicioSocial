const estadoSchema = `
  CREATE TABLE IF NOT EXISTS Estado (
    idEstado INT AUTO_INCREMENT PRIMARY KEY,
    nombreEstado ENUM('Concluido', 'En proceso', 'Cancelado') NOT NULL
  );
`;

module.exports = estadoSchema;