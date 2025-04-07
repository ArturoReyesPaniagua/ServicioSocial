const oficioSchema = `
  CREATE TABLE IF NOT EXISTS Oficio (
    id_oficio INT PRIMARY KEY,
    estado ENUM('concluido', 'en proceso', 'cancelado') NOT NULL,
    numero_de_oficio VARCHAR(255),
    fecha_recepcion DATE,
    fecha_limite DATE,
    archivado BOOLEAN,
    fecha_respuesta DATE,
    id_solicitante INT,
    asunto VARCHAR(255),
    observaciones VARCHAR(255),
    id_responsable INT,
    id_area INT,
    FOREIGN KEY (id_solicitante) REFERENCES Solicitante(id_solicitante),
    FOREIGN KEY (id_responsable) REFERENCES Responsable(id_responsable),
    FOREIGN KEY (id_area) REFERENCES Area(id_area)
  )
`;
module.exports = oficioSchema;