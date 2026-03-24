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
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Оваа линија ги користи точните имиња на табелата и колоните од твојата слика
    const [rows] = await connection.execute(
      'SELECT player_uuid as username, player_kills as value FROM player_statistic_player_kills ORDER BY player_kills DESC LIMIT 10'
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}