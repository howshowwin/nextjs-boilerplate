import { neon } from '@neondatabase/serverless';

const connectionString = process.env.POSTGRES_URL;

// 若 build 階段未設置環境變數，導出一個會在執行時拋錯的占位函式，
// 避免 Next.js 編譯期直接呼叫 neon() 造成失敗。
const placeholder = () => {
  throw new Error('Database connection not initialized.');
};

// 使用環境變數中的連線字串建立 SQL query 函式（僅在執行環境）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sql: any = connectionString ? neon(connectionString) : placeholder;

export default sql; 