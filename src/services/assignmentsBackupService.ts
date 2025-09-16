class AssignmentsBackupService {
  private backupKey = 'music_backup_snapshot';

  public backup(reason: string = 'manual'): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const assignments = localStorage.getItem('music_collection_assignments');
      const clients = localStorage.getItem('music_clients');
      const payload = {
        timestamp: new Date().toISOString(),
        reason,
        data: {
          assignments: assignments ? JSON.parse(assignments) : {},
          clients: clients ? JSON.parse(clients) : []
        }
      };
      localStorage.setItem(this.backupKey, JSON.stringify(payload));
      // eslint-disable-next-line no-console
      console.log('💾 Assignments backed up:', payload.timestamp, 'reason:', reason);
    } catch (e) {
      console.warn('Failed to backup assignments', e);
    }
  }

  public hasBackup(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      return !!localStorage.getItem(this.backupKey);
    } catch {
      return false;
    }
  }

  public getBackupMeta(): { timestamp: string; reason?: string } | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.backupKey);
      if (!raw) return null;
      const { timestamp, reason } = JSON.parse(raw);
      return { timestamp, reason };
    } catch {
      return null;
    }
  }

  public restore(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(this.backupKey);
      if (!raw) return false;
      const { data } = JSON.parse(raw);
      if (data?.assignments !== undefined) {
        localStorage.setItem('music_collection_assignments', JSON.stringify(data.assignments || {}));
      }
      if (data?.clients !== undefined) {
        localStorage.setItem('music_clients', JSON.stringify(data.clients || []));
      }
      // eslint-disable-next-line no-console
      console.log('♻️ Assignments restored from backup');
      return true;
    } catch (e) {
      console.warn('Failed to restore assignments', e);
      return false;
    }
  }

  public clear(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(this.backupKey);
    } catch {
      /* noop */
    }
  }
}

const assignmentsBackupService = new AssignmentsBackupService();
export default assignmentsBackupService;


