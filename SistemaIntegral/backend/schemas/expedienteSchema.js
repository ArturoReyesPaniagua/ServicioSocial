const expedientesSchema = {
    expedientesMaestro: `
      CREATE TABLE IF NOT EXISTS expedientes_maestro (
        idExpediente INT NOT NULL AUTO_INCREMENT,
        noDeExpediente VARCHAR(50) NOT NULL,
        fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (idExpediente),
        UNIQUE INDEX noDeExpediente_UNIQUE (noDeExpediente ASC)
      )
    `,
    
    expedienteDetalle: `
      CREATE TABLE IF NOT EXISTS expediente (
        idDia INT NOT NULL AUTO_INCREMENT,
        idExpediente INT NOT NULL,
        status ENUM('atendido', 'no atendido') NOT NULL,
        estado ENUM('concluido', 'en proceso', 'cancelado') NOT NULL,
        fechaDeRecepcion DATE NOT NULL,
        folioDeSeguimiento VARCHAR(50),
        fechaLimite DATE,
        solicitante VARCHAR(100) NOT NULL,
        asunto TEXT NOT NULL,
        responsableAsignado VARCHAR(100),
        fechaDeRespuesta DATE,
        noDeFolioDeRespuesta VARCHAR(50),
        observaciones TEXT,
        archivado BOOLEAN DEFAULT FALSE,
        rutaArchivoPDF VARCHAR(255),
        PRIMARY KEY (idDia),
        FOREIGN KEY (idExpediente) REFERENCES expedientes_maestro(idExpediente)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        INDEX idx_expediente (idExpediente ASC)
      )
    `
  };
  
  module.exports = expedientesSchema;