import * as SQLite from 'expo-sqlite';

let db = null;

// 初始化資料庫
export const initializeDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('dailyData.db');
    
    // 建立資料表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS data_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentiment INTEGER NOT NULL,
        video_path TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);
    
    console.log('資料庫初始化成功');
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    throw error;
  }
};

// 儲存數據記錄
export const saveDataRecord = async (data) => {
  try {
    if (!db) {
      throw new Error('資料庫未初始化');
    }
    console.log('Saving data record:', data);
    const result = await db.runAsync(
      'INSERT INTO data_records (sentiment, video_path, latitude, longitude, timestamp) VALUES (?, ?, ?, ?, ?)',
      [data.sentiment, data.videoPath, data.latitude, data.longitude, data.timestamp]
    );

    console.log('資料儲存成功，ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('儲存資料失敗:', error);
    throw error;
  }
};

// 取得所有數據記錄
export const getDataRecords = async () => {
  try {
    if (!db) {
      throw new Error('資料庫未初始化');
    }

    const result = await db.getAllAsync(
      'SELECT * FROM data_records ORDER BY timestamp DESC'
    );

    return result;
  } catch (error) {
    console.error('取得資料失敗:', error);
    throw error;
  }
};

// 取得今日記錄數量
export const getTodaysRecordsCount = async () => {
  try {
    if (!db) {
      throw new Error('資料庫未初始化');
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM data_records WHERE timestamp BETWEEN ? AND ?',
      [startOfDay, endOfDay]
    );

    return result?.count || 0;
  } catch (error) {
    console.error('取得今日記錄數量失敗:', error);
    throw error;
  }
};

// 刪除數據記錄
export const deleteDataRecord = async (id) => {
  try {
    if (!db) {
      throw new Error('資料庫未初始化');
    }

    if (id.length === 1) {
      await db.runAsync('DELETE FROM data_records WHERE id = ?', [id]);
    } else if (id === 'all') {
      await db.runAsync('DELETE FROM data_records');
    } else {
      const placeholders = id.map(() => '?').join(',');
      await db.runAsync(`DELETE FROM data_records WHERE id IN (${placeholders})`, id);
    }
    console.log('資料刪除成功，ID:', id);
  } catch (error) {
    console.error('刪除資料失敗:', error);
    throw error;
  }
};

// 取得資料庫統計
export const getDatabaseStats = async () => {
  try {
    if (!db) {
      throw new Error('資料庫未初始化');
    }

    const totalRecords = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM data_records'
    );

    const lastRecord = await db.getFirstAsync(
      'SELECT timestamp FROM data_records ORDER BY timestamp DESC LIMIT 1'
    );

    return {
      totalRecords: totalRecords?.count || 0,
      lastRecordTime: lastRecord?.timestamp || null
    };
  } catch (error) {
    console.error('取得資料庫統計失敗:', error);
    throw error;
  }
};