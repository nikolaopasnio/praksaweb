import mysql from 'mysql2/promise';

export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      ssl: { rejectUnauthorized: false }
    });

    // 1. Прво проверуваме дали воопшто има нешто во табелата
    const [rows] = await connection.execute(
      'SELECT * FROM player_statistic_player_kills LIMIT 10'
    );

    // Ако нема ништо, праќаме тест податок за да видиме дали работи дизајнот
    if (rows.length === 0) {
      console.log("Базата е празна!");
      return Response.json([
        { username: "DATABASE_EMPTY", value: 0 }
      ]);
    }

    // 2. Ако има податоци, ги мапираме точно според твојата база
    // Ги користиме колоните што ги видовме на PHPMyAdmin
    const formattedData = rows.map(row => ({
      username: row.player_uuid || row.username || "Unknown",
      value: row.player_kills || row.kills || 0
    }));

    return Response.json(formattedData);

  } catch (error) {
    console.error('Грешка:', error.message);
    return Response.json([{ username: "ERROR: " + error.message.substring(0, 15), value: 500 }]);
  } finally {
    if (connection) await connection.end();
  }
}