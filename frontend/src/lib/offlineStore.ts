export interface OfflineReport {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  description: string;
  imageUrl?: string;
  timestamp: string;
  status: 'pending' | 'synced';
}

export interface OfflineSOS {
  id: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
  status: 'pending' | 'synced';
}

const DB_NAME = 'safepath_offline_db';
const REPORTS_STORE = 'emergency_reports';
const SOS_STORE = 'sos_events';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(REPORTS_STORE)) {
        db.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SOS_STORE)) {
        db.createObjectStore(SOS_STORE, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

// Reports (Hazards)
export async function saveOfflineReport(report: OfflineReport): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(REPORTS_STORE, 'readwrite');
    const store = transaction.objectStore(REPORTS_STORE);
    const request = store.put(report);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingReports(): Promise<OfflineReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(REPORTS_STORE, 'readonly');
    const store = transaction.objectStore(REPORTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as OfflineReport[];
      resolve(all.filter(r => r.status === 'pending').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markReportSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(REPORTS_STORE, 'readwrite');
    const store = transaction.objectStore(REPORTS_STORE);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const report = getRequest.result as OfflineReport;
      if (report) {
        report.status = 'synced';
        store.put(report).onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// SOS Events
export async function saveOfflineSOS(sos: OfflineSOS): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOS_STORE, 'readwrite');
    const store = transaction.objectStore(SOS_STORE);
    const request = store.put(sos);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingSOS(): Promise<OfflineSOS[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOS_STORE, 'readonly');
    const store = transaction.objectStore(SOS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as OfflineSOS[];
      resolve(all.filter(r => r.status === 'pending').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markSOSSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOS_STORE, 'readwrite');
    const store = transaction.objectStore(SOS_STORE);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const sos = getRequest.result as OfflineSOS;
      if (sos) {
        sos.status = 'synced';
        store.put(sos).onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function syncAllPending(): Promise<{ sosCount: number, hazardCount: number }> {
  // Demo mock sync
  const pendingSOS = await getPendingSOS();
  const pendingReports = await getPendingReports();

  for (const sos of pendingSOS) {
    await markSOSSynced(sos.id);
  }
  for (const rep of pendingReports) {
    await markReportSynced(rep.id);
  }

  return { sosCount: pendingSOS.length, hazardCount: pendingReports.length };
}
