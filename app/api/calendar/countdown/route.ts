import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // 獲取未完成的任務（待辦事項）
    const todoTasks = await sql`
      SELECT * FROM calendar_events 
      WHERE type = 'task' AND is_completed = false AND date_time > now()
      ORDER BY date_time ASC
      LIMIT 10
    `;

    // 獲取重大事件（里程碑）
    const majorEvents = await sql`
      SELECT * FROM calendar_events 
      WHERE type = 'milestone' AND date_time > now()
      ORDER BY date_time ASC
      LIMIT 10
    `;

    // 統計數據
    const todoStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN date_time <= now() + interval '1 day' THEN 1 END) as urgent
      FROM calendar_events 
      WHERE type = 'task' AND is_completed = false AND date_time > now()
    `;

    const majorStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN date_time <= now() + interval '7 days' THEN 1 END) as urgent
      FROM calendar_events 
      WHERE type = 'milestone' AND date_time > now()
    `;

    return NextResponse.json({
      todoItems: {
        events: todoTasks,
        stats: {
          total: parseInt(todoStats[0]?.total || '0'),
          urgent: parseInt(todoStats[0]?.urgent || '0')
        }
      },
      majorEvents: {
        events: majorEvents,
        stats: {
          total: parseInt(majorStats[0]?.total || '0'),
          urgent: parseInt(majorStats[0]?.urgent || '0')
        }
      }
    });
  } catch (error) {
    console.error('Error fetching countdown data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countdown data' },
      { status: 500 }
    );
  }
} 