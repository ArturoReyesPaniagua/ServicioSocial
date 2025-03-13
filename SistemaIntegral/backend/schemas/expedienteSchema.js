const expedienteSchema = `
  CREATE TABLE IF NOT EXISTS Expediente (
    idExpediente INT AUTO_INCREMENT PRIMARY KEY,
    idEstado INT,
    fechaDeRecepcion DATE,
    noFolioDeSeguimiento VARCHAR(50) UNIQUE,
    fechaLimite DATE,
    solicitante VARCHAR(50),
    asunto VARCHAR(50),
    responsable VARCHAR(50),
    fechaDeRespuesta DATE,
    observaciones VARCHAR(250),
    archivado BOOLEAN,
    NoExpediente VARCHAR(50) UNIQUE,
    FOREIGN KEY (idEstado) REFERENCES Estado(idEstado)
  );
`;

module.exports = expedienteSchema;
