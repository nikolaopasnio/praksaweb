import { status } from 'minecraft-server-util';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const result = await status('asia-trail.gl.joinmc.link');
        return Response.json({
            online: result.players.online,
            max: result.players.max,
        });
    } catch (err) {
        console.error('MC ping error:', err.message);
        return Response.json({ online: 0, max: 0, error: err.message });
    }
}