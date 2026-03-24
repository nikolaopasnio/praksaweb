import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  let connection;
  try {
    // 1. Проверка дали воопшто се вчитани променливите од Vercel
    if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
      return Response.json([{ username: "MISSING_ENV", value: 0 }]);
    }

    // 2. Поврзување со податоците од Clever Cloud
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306, // Стандардна порта според Clever Cloud
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000
    });

    // 3. SQL Query за табелата што ја видовме во PHPMyAdmin
    const [rows] = await connection.execute(
      'SELECT player_uuid, player_kills FROM player_statistic_player_kills ORDER BY player_kills DESC LIMIT 10'
    );

    await connection.end();

    if (rows.length === 0) {
      return Response.json([{ username: "NO_DATA_IN_DB", value: 0 }]);
    }

    return Response.json(rows.map(r => ({
      username: r.player_uuid.substring(0, 8), // Го кратиме UUID-то за да изгледа подобро
      value: r.player_kills
    })));

  } catch (error) {
    console.error(error);
    // Ова ќе ни ја каже точната грешка на екранот наместо само "500"
    const errorMsg = error.message.includes('Access denied') ? 'WRONG_PASS' :
      error.message.includes('ENOTFOUND') ? 'BAD_HOST' : 'CONN_FAIL';

    return Response.json([{ username: errorMsg, value: 0 }]);
  }
}