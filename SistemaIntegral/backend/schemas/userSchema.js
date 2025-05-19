// SistemaIntegral/backend/schemas/userSchema.js
const userSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[users] (
      userId INT IDENTITY(1,1) PRIMARY KEY,
      username NVARCHAR(255) NOT NULL UNIQUE,
      password NVARCHAR(255) NOT NULL,
      role NVARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      id_area INT,
      CONSTRAINT FK_User_Area FOREIGN KEY (id_area) REFERENCES Area(id_area) ON DELETE SET NULL
    )
  END
`;

module.exports = userSchema;