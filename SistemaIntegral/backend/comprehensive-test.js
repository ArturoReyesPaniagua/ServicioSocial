// comprehensive-test.js
// Script para probar múltiples configuraciones de conexión a SQL Server
require('dotenv').config();
const sql = require('mssql');

// Array de diferentes configuraciones para probar
const testConfigs = [
  {
    name: "Config 1: Usando tu configuración actual",
    config: {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Polopolo123',
      server: process.env.DB_SERVER || 'AZHURIAS\\SQLEXPRESS',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_DATABASE || 'ssdb',
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true'
      }
    }
  },
  {
    name: "Config 2: Usando localhost con instancia",
    config: {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Polopolo123',
      server: 'localhost\\SQLEXPRESS',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_DATABASE || 'ssdb',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  },
  {
    name: "Config 3: Usando punto con instancia",
    config: {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Polopolo123',
      server: '.\\SQLEXPRESS',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_DATABASE || 'ssdb',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  },
  {
    name: "Config 4: Usando IP local con instancia",
    config: {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Polopolo123',
      server: '127.0.0.1\\SQLEXPRESS',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_DATABASE || 'ssdb',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  },
  {
    name: "Config 5: Usando IP local sin instancia",
    config: {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Polopolo123',
      server: '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_DATABASE || 'ssdb',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  }
];

// Función para probar una configuración
async function testConfig(testCase) {
  console.log(`\n\n===== Probando ${testCase.name} =====`);
  console.log('Configuración:', {
    ...testCase.config,
    password: '********' // No mostrar la contraseña
  });
  
  try {
    console.log('Intentando conectar...');
    const pool = await sql.connect(testCase.config);
    console.log('¡CONEXIÓN EXITOSA!');
    
    try {
      // Probar una consulta simple
      const result = await pool.request().query('SELECT @@version as version');
      console.log('Versión de SQL Server:', result.recordset[0].version);
      
      // Listar bases de datos disponibles
      const dbResult = await pool.request().query('SELECT name FROM sys.databases');
      console.log('Bases de datos disponibles:');
      dbResult.recordset.forEach(db => {
        console.log(`- ${db.name}`);
      });
    } catch (queryError) {
      console.error('Error al ejecutar consulta:', queryError);
    }
    
    await pool.close();
    console.log('Conexión cerrada correctamente');
    return true;
  } catch (error) {
    console.error('ERROR DE CONEXIÓN:', error.message);
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    return false;
  }
}

// Ejecutar todas las pruebas en secuencia
async function runAllTests() {
  console.log('INICIANDO PRUEBAS DE CONEXIÓN A SQL SERVER');
  console.log('=========================================');
  
  let successfulConfigs = [];
  
  for (const testCase of testConfigs) {
    const success = await testConfig(testCase);
    if (success) {
      successfulConfigs.push(testCase.name);
    }
  }
  
  console.log('\n\n=========== RESUMEN DE PRUEBAS ===========');
  if (successfulConfigs.length > 0) {
    console.log('Configuraciones exitosas:');
    successfulConfigs.forEach(name => {
      console.log(`✅ ${name}`);
    });
    
    console.log('\nPara resolver tu problema:');
    console.log('1. Actualiza tu archivo .env con la configuración que funcionó');
    console.log('2. Si modificaste db/config.js, asegúrate de que use los valores correctos');
  } else {
    console.log('❌ Ninguna configuración funcionó. Verificaciones adicionales:');
    console.log('1. ¿Está SQL Server en ejecución?');
    console.log('2. ¿Está habilitado SQL Server Browser?');
    console.log('3. ¿Está habilitado el protocolo TCP/IP en SQL Server Configuration Manager?');
    console.log('4. ¿El firewall permite conexiones en los puertos 1433 (TCP) y 1434 (UDP)?');
    console.log('5. ¿La cuenta "sa" está habilitada y tiene la contraseña correcta?');
    console.log('6. ¿SQL Server está configurado para autenticación mixta (SQL + Windows)?');
  }
}

runAllTests();