export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch("https://quantumnetwork-server-2121-default-rtdb.europe-west1.firebasedatabase.app/leaderboard.json", {
      cache: 'no-store' // Ова е клучно за да не ти покажува стари податоци
    });

    const data = await response.json();

    if (!data) return Response.json([]);

    // Firebase ги дава како { "Nikuc0_": 77 }, го правиме во листа за табелата
    const leaderboard = Object.entries(data).map(([name, kills]) => ({
      username: name,
      value: parseInt(kills)
    })).sort((a, b) => b.value - a.value); // Најдобрите одат најгоре

    return Response.json(leaderboard);
  } catch (error) {
    console.error("Firebase Error:", error);
    return Response.json([{ username: "Error loading stats", value: 0 }]);
  }
}