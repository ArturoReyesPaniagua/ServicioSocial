const areaSchema = `
  CREATE TABLE IF NOT EXISTS Area (
    id_area INT PRIMARY KEY,
    nombre_area VARCHAR(255),
    contador INT AUTO_INCREMENT
  )
`;
module.exports = areaSchema;