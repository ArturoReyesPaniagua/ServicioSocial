// SistemaIntegral/backend/schemas/oficiosSchema.js (modificado)
const oficioSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Oficio]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Oficio] (
      id_oficio INT IDENTITY(1,1) PRIMARY KEY,
      estado NVARCHAR(20) CHECK (estado IN ('concluido', 'en proceso', 'urgencia')) NOT NULL,
      numero_de_oficio NVARCHAR(25) NOT NULL,
      fecha_recepcion DATE,
      fecha_limite DATE,
      archivado NVARCHAR(30),
      expediente NVARCHAR(30),
      fecha_respuesta DATE,
      id_solicitante INT,
      asunto NVARCHAR(255),
      observaciones NVARCHAR(255),
      id_responsable INT,
      id_area INT,
      id_UPEyCE INT,
      oficios_relacionados NVARCHAR(MAX),
      oficio_respuesta NVARCHAR(255),
      CONSTRAINT FK_Oficio_Solicitante FOREIGN KEY (id_solicitante) REFERENCES Solicitante(id_solicitante),
      CONSTRAINT FK_Oficio_Responsable FOREIGN KEY (id_responsable) REFERENCES Responsable(id_responsable),
      CONSTRAINT FK_Oficio_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_Oficio_UPEyCE FOREIGN KEY (id_UPEyCE) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL
    )
  END;

  -- Verificar si las columnas existen y añadirlas si no
  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Oficio]') AND name = 'id_UPEyCE')
  BEGIN
    ALTER TABLE [dbo].[Oficio] ADD id_UPEyCE INT;
    ALTER TABLE [dbo].[Oficio] ADD CONSTRAINT FK_Oficio_UPEyCE FOREIGN KEY (id_UPEyCE) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL;
  END;

  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Oficio]') AND name = 'oficios_relacionados')
  BEGIN
    ALTER TABLE [dbo].[Oficio] ADD oficios_relacionados NVARCHAR(MAX);
  END;

  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Oficio]') AND name = 'oficio_respuesta')
  BEGIN
    ALTER TABLE [dbo].[Oficio] ADD oficio_respuesta NVARCHAR(255);
  END;
`;

module.exports = oficioSchema;