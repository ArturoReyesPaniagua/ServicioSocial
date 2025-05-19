// SistemaIntegral/backend/schemas/oficiosSchema.js
const oficioSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Oficio]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Oficio] (
      id_oficio INT IDENTITY(1,1) PRIMARY KEY,
      estado NVARCHAR(20) CHECK (estado IN ('concluido', 'en proceso', 'cancelado')) NOT NULL,
      numero_de_oficio INT NOT NULL,
      fecha_recepcion DATE,
      fecha_limite DATE,
      archivado BIT DEFAULT 0,
      fecha_respuesta DATE,
      id_solicitante INT,
      asunto NVARCHAR(255),
      observaciones NVARCHAR(255),
      id_responsable INT,
      id_area INT,
      CONSTRAINT FK_Oficio_Solicitante FOREIGN KEY (id_solicitante) REFERENCES Solicitante(id_solicitante),
      CONSTRAINT FK_Oficio_Responsable FOREIGN KEY (id_responsable) REFERENCES Responsable(id_responsable),
      CONSTRAINT FK_Oficio_Area FOREIGN KEY (id_area) REFERENCES Area(id_area)
    )
  END
`;

module.exports = oficioSchema;