import { sql } from '@vercel/postgres';

export type LogType = 'incoming_message' | 'outgoing_message' | 'error' | 'webhook_payload' | 'optimization';

interface LogEntry {
    chatId?: string;
    updateId?: number;
    type: LogType;
    payload?: any;
    errorMessage?: string;
}

export async function logTelegramEvent(entry: LogEntry) {
    try {
        const { chatId, updateId, type, payload, errorMessage } = entry;

        // Convert payload to JSON string if it's an object, or null
        const payloadJson = payload ? JSON.stringify(payload) : null;

        await sql`
      INSERT INTO telegram_logs (chat_id, update_id, type, payload, error_message)
      VALUES (
        ${chatId || null}, 
        ${updateId || null}, 
        ${type}, 
        ${payloadJson}::jsonb, 
        ${errorMessage || null}
      )
    `;
    } catch (error) {
        // Failsafe: Don't let logging errors break the application
        console.error('Failed to write log entry:', error);
    }
}
