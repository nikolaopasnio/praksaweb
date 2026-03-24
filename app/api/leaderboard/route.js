import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      ssl: {
        rejectUnauthorized: false // Задолжително за поврзување со Clever Cloud
      }
    });

    // ВАЖНО: Бидејќи во твојата табела нема 'username', го користиме 'id' како замена за име.
    // Ова ќе ги извлече топ 10 играчи според вредноста (kills).
    const [rows] = await connection.execute(
      'SELECT id AS username, value FROM player_statistic_player_kills ORDER BY value DESC LIMIT 10'
    );

    await connection.end();
    
    // Враќање на податоците во JSON формат за твојот page.js
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ 
      error: "Грешка при поврзување со базата", 
      details: error.message 
    }, { status: 500 });
  }
}