import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  let connection;
  try {
    // 1. Поврзување со твоите Vercel променливи
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      // Пробај го ова - кај некои верзии на Clever Cloud помага ако се тргне или смени SSL
      ssl: { rejectUnauthorized: false }
    });

    // 2. SQL Query што ги влече убиствата и се обидува да ги најде имињата
    // Ја користиме табелата 'player_statistic_player_kills' што ја видовме на сликата
    const [rows] = await connection.execute(`
      SELECT 
        s.player_uuid as uuid,
        COALESCE(e.player_name, s.player_uuid) as username, 
        s.player_kills as value 
      FROM player_statistic_player_kills s
      LEFT JOIN player_extras e ON s.player_uuid = e.player_uuid
      ORDER BY s.player_kills DESC 
      LIMIT 10
    `);

    // 3. Ако табелата е празна, прати тест податоци за да видиш дека работи дизајнот
    if (rows.length === 0) {
      return new Response(JSON.stringify([
        { username: "No Data Yet", value: 0 }
      ]), { status: 200 });
    }

    // 4. Форматирање: Ако името е предолго (UUID), скрати го
    const formatted = rows.map(r => ({
      username: r.username.length > 16 ? r.username.substring(0, 8) + '...' : r.username,
      value: r.value
    }));

    return new Response(JSON.stringify(formatted), { status: 200 });

  } catch (error) {
    console.error('Database Error:', error.message);
    // Ова ќе ти каже точно зошто не се поврзува (на пр. "Access denied" или "Invalid Host")
    return new Response(JSON.stringify([
      { username: "Error: " + error.message.substring(0, 10), value: 0 }
    ]), { status: 200 });
  } finally {
    if (connection) await connection.end();
  }
}