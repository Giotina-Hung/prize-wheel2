import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface DrawRecord {
  winner: string;
  timestamp: string;
}

export default function DrawHistory() {
  const [history, setHistory] = useState<DrawRecord[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'draws'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const records: DrawRecord[] = [];
        snapshot.forEach((doc) => {
            records.push(doc.data() as DrawRecord);
        });
        setHistory(records);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-12 w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">抽籤歷史紀錄</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">目前沒有紀錄。</p>
      ) : (
        <ul className="space-y-2">
          {history.map((record, index) => (
            <li key={index} className="flex justify-between border-b pb-2">
              <span className="font-semibold text-indigo-700">{record.winner}</span>
              <span className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
