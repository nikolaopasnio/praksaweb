export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch("https://quantumnetwork-server-2121-default-rtdb.europe-west1.firebasedatabase.app/leaderboard.json", {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!data) return Response.json([]);

    const leaderboard = Object.entries(data).map(([name, stats]) => ({
      username: name,
      kills: stats.kills ?? 0,
      deaths: stats.deaths ?? 0,
      value: stats.kills ?? 0
    })).sort((a, b) => b.value - a.value);

    return Response.json(leaderboard);
  } catch (error) {
    console.error("Firebase Error:", error);
    return Response.json([{ username: "Error loading stats", value: 0 }]);
  }
}