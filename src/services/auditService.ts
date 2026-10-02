import { supabase, isSupabaseConfigured } from './supabase';
import { AuditLog } from '../types';

const LOCAL_STORAGE_AUDIT_KEY = 'pfs_audit_logs';

function getLocalAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading audit logs', e);
  }
  return [
    {
      id: 'log-1',
      admin_email: 'admin@pocketfriendlysarees.com',
      action: 'INITIALIZE_STORE',
      entity_type: 'SYSTEM',
      details: { message: 'PocketFriendly Sarees system initialized with default catalog and settings.' },
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
}

function saveLocalAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Error saving audit logs', e);
  }
}

export const auditService = {
  async logAction(action: string, entityType: string, entityId?: string, details?: any): Promise<void> {
    const logEntry: AuditLog = {
      id: `log-${Date.now()}`,
      admin_email: 'admin@pocketfriendlysarees.com',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert([{
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
        }]);
      } catch (e) {
        console.warn('Supabase audit log insert failed', e);
      }
    }

    const current = getLocalAuditLogs();
    saveLocalAuditLogs([logEntry, ...current]);
  },

  async getLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (!error && data) return data as AuditLog[];
      } catch (e) {
        // fallback
      }
    }
    return getLocalAuditLogs();
  }
};
