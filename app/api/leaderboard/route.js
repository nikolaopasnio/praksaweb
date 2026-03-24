import mysql from 'mysql2/promise';

// Ова спречува Vercel да го кешира сајтот (секогаш влече свежи податоци)
export const dynamic = 'force-dynamic';

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

    // Овој SQL е направен да работи со твоите табели од сликите
    const [rows] = await connection.execute(`
      SELECT 
        player_uuid as uuid, 
        player_kills as kills
      FROM player_statistic_player_kills 
      ORDER BY player_kills DESC 
      LIMIT 10
    `);

    // Ако нема убиства во базата
    if (rows.length === 0) {
      return Response.json([{ username: "No Stats Yet", value: 0 }]);
    }

    // Го средуваме форматот за твојот дизајн
    const data = rows.map(row => ({
      // Ако е долго UUID, земи ги само првите 8 карактери за да биде убаво
      username: row.uuid.length > 16 ? row.uuid.substring(0, 8) : row.uuid,
      value: row.kills
    }));

    return Response.json(data);

  } catch (error) {
    console.error('Clever Cloud Error:', error.message);
    // Ова ќе ти испише на екранот ако има проблем со лозинка или хост
    return Response.json([{ username: "Conn_Error", value: 0 }], { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}