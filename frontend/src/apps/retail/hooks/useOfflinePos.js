import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../lib/api';
import {
  saveOfflineTransaction,
  getPendingOfflineTransactions,
  updateOfflineTransactionStatus,
  getOfflineQueueStats,
  cleanupSyncedOfflineTransactions
} from '../../../lib/offlinePosDb';

export function useOfflinePos(onSyncSuccess = null) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const syncingRef = useRef(false);

  // Refresh count and pending list from IndexedDB
  const refreshStats = useCallback(async () => {
    try {
      const stats = await getOfflineQueueStats();
      setPendingCount(stats.pendingCount);
      setPendingTransactions(stats.pendingItems);
    } catch (err) {
      console.error('Failed to read offline queue stats:', err);
    }
  }, []);

  // Sync pending transactions to server
  const syncNow = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const pendingList = await getPendingOfflineTransactions();
      if (pendingList.length === 0) {
        setIsSyncing(false);
        syncingRef.current = false;
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const tx of pendingList) {
        try {
          await updateOfflineTransactionStatus(tx.offline_id, 'SYNCING');
          
          // Attach offline metadata into the payload
          const syncPayload = {
            ...tx.payload,
            offline_id: tx.offline_id,
            offline_invoice_no: tx.invoice_no,
            is_offline_sync: true
          };

          const res = await api.post('/retail/transactions', syncPayload);

          await updateOfflineTransactionStatus(tx.offline_id, 'SYNCED');
          successCount++;
        } catch (err) {
          console.error(`Failed to sync offline transaction ${tx.offline_id}:`, err);
          const errorMsg = err?.response?.data?.message || err?.message || 'Network error';
          await updateOfflineTransactionStatus(tx.offline_id, 'FAILED', errorMsg);
          failCount++;
        }
      }

      // Cleanup old synced records
      await cleanupSyncedOfflineTransactions();
      await refreshStats();

      setLastSyncResult({
        timestamp: new Date(),
        successCount,
        failCount
      });

      if (successCount > 0 && typeof onSyncSuccess === 'function') {
        onSyncSuccess(successCount);
      }
    } catch (err) {
      console.error('Error in sync cycle:', err);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [refreshStats, onSyncSuccess]);

  // Queue a new offline transaction
  const queueTransaction = useCallback(async (payload, receiptData) => {
    const offlineInvoiceNo = `OFF-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const offlineRecord = {
      offline_id: `OFF-TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      invoice_no: offlineInvoiceNo,
      payload,
      receipt_data: {
        ...receiptData,
        invoice_no: offlineInvoiceNo,
        created_at: new Date().toISOString(),
        is_offline: true
      },
      created_at: new Date().toISOString()
    };

    await saveOfflineTransaction(offlineRecord);
    await refreshStats();

    return offlineRecord;
  }, [refreshStats]);

  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when network reconnects
      setTimeout(() => {
        syncNow();
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshStats();

    // Periodic check / sync if online and there are pending items
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setIsOnline(true);
        getPendingOfflineTransactions().then((pending) => {
          if (pending.length > 0 && !syncingRef.current) {
            syncNow();
          }
        });
      } else {
        setIsOnline(false);
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshStats, syncNow]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    pendingTransactions,
    lastSyncResult,
    syncNow,
    queueTransaction,
    refreshStats
  };
}
