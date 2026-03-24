import mysql from 'mysql2/promise';

// ОВАА ЛИНИЈА Е КЛУЧНА - го исклучува кеширањето на Vercel
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

    // Ги влечеме податоците и ги подредуваме од најмногу кон најмалку убиства
    const [rows] = await connection.execute(
      'SELECT player_uuid, player_kills FROM player_statistic_player_kills WHERE player_kills > 0 ORDER BY player_kills DESC LIMIT 10'
    );

    if (rows.length === 0) {
      return Response.json([{ username: "No Kills Yet", value: 0 }]);
    }

    // Ги мапираме колоните точно како што ги бара фронтендот
    const formattedData = rows.map(row => ({
      username: row.player_uuid.substring(0, 8) + "...", // Кратиме UUID за да не го грди дизајнот
      value: row.player_kills
    }));

    return Response.json(formattedData);

  } catch (error) {
    console.error('Database Error:', error.message);
    return Response.json([{ username: "DB_ERROR", value: 0 }], { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}