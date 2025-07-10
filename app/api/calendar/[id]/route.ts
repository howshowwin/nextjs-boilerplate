import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      UPDATE calendar_events 
      SET 
        title = ${title},
        description = ${description},
        date_time = ${date_time},
        type = ${type},
        priority = ${priority},
        category = ${category},
        location = ${location},
        is_all_day = ${is_all_day},
        reminder_minutes = ${reminder_minutes},
        recurrence_pattern = ${recurrence_pattern},
        recurrence_end_date = ${recurrence_end_date},
        is_completed = ${is_completed},
        updated_at = now()
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      DELETE FROM calendar_events 
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
} 