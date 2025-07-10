import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    // 刪除舊表格（如果存在）
    await sql`DROP TABLE IF EXISTS calendar_events`;
    
    // 創建新的資料表
    await sql`
      CREATE TABLE calendar_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date_time TIMESTAMPTZ NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('task', 'event', 'milestone')),
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        category TEXT,
        location TEXT,
        is_all_day BOOLEAN DEFAULT false,
        reminder_minutes INTEGER,
        recurrence_pattern TEXT,
        recurrence_end_date TIMESTAMPTZ,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    // 插入示例數據
    const sampleEvents = [
      {
        title: '完成專案提案',
        description: '準備下週的專案提案簡報',
        date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'task',
        priority: 'high',
        category: '工作',
        location: '辦公室',
        is_all_day: false,
        reminder_minutes: 60,
        is_completed: false
      },
      {
        title: '團隊會議',
        description: '每週例行團隊會議',
        date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'event',
        priority: 'medium',
        category: '工作',
        location: '會議室A',
        is_all_day: false,
        reminder_minutes: 30,
        is_completed: false
      },
      {
        title: '產品發布',
        description: '新版本產品正式發布',
        date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'milestone',
        priority: 'high',
        category: '工作',
        location: '線上',
        is_all_day: true,
        reminder_minutes: 1440,
        is_completed: false
      },
      {
        title: '健身訓練',
        description: '每週固定健身時間',
        date_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'task',
        priority: 'medium',
        category: '健康',
        location: '健身房',
        is_all_day: false,
        reminder_minutes: 30,
        is_completed: false
      },
      {
        title: '生日聚會',
        description: '朋友生日聚會',
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'event',
        priority: 'low',
        category: '個人',
        location: '餐廳',
        is_all_day: false,
        reminder_minutes: 120,
        is_completed: false
      }
    ];

    // 插入示例事件
    for (const event of sampleEvents) {
      await sql`
        INSERT INTO calendar_events (
          title, description, date_time, type, priority, category, location,
          is_all_day, reminder_minutes, is_completed
        ) VALUES (
          ${event.title}, ${event.description}, ${event.date_time}, ${event.type},
          ${event.priority}, ${event.category}, ${event.location}, ${event.is_all_day},
          ${event.reminder_minutes}, ${event.is_completed}
        )
      `;
    }

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      count: sampleEvents.length 
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
} 