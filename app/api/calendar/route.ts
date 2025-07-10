import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM calendar_events 
      ORDER BY date_time ASC
    `;
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      date_time,
      type,
      priority,
      category,
      location,
      is_all_day,
      reminder_minutes,
      recurrence_pattern,
      recurrence_end_date,
      is_completed
    } = body;

    const result = await sql`
      INSERT INTO calendar_events (
        title, description, date_time, type, priority, category, location,
        is_all_day, reminder_minutes, recurrence_pattern, recurrence_end_date, is_completed
      ) VALUES (
        ${title}, ${description}, ${date_time}, ${type}, ${priority}, ${category}, ${location},
        ${is_all_day}, ${reminder_minutes}, ${recurrence_pattern}, ${recurrence_end_date}, ${is_completed}
      )
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
} 