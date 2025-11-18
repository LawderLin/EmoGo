import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Button
} from 'react-native';
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDataRecords, deleteDataRecord } from '../../utils/database';

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await getDataRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
      Alert.alert('錯誤', '無法載入歷史記錄');
    } finally {
      setLoading(false);
    }
  };
  const exportRecords = async () => {
    if (records.length === 0) {
      Alert.alert('提示', '沒有資料可以匯出');
      return;
    }

    try {
      // 準備匯出的資料
      const exportData = records.map(record => ({
        時間: formatDate(record.timestamp),
        情緒評分: record.sentiment,
        情緒描述: getSentimentText(record.sentiment),
        緯度: record.latitude,
        經度: record.longitude,
        影片檔案: record.video_path ? record.video_path.split('/').pop() : '無影片',
        記錄ID: record.id
      }));

      // 產生CSV格式的內容
      const csvHeader = '時間,情緒評分,情緒描述,緯度,經度,影片檔案,記錄ID\n';
      const csvContent = exportData.map(row => 
        Object.values(row).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');
      
      const fullCsvContent = csvHeader + csvContent;

      // 建立檔案名稱（包含當前日期時間）
      const now = new Date();
      const dateString = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const fileName = `情感記錄_${dateString}.csv`;

      // 寫入檔案
      const file = new File(Paths.cache, fileName);
      file.write(fullCsvContent)

      // 檢查是否支援分享功能
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: '匯出情感記錄資料',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert(
          '匯出完成', 
          `資料已匯出至: ${fileName}\n\n檔案位置: ${file.info.uri}`,
          [{ text: '確定' }]
        );
      }

    } catch (error) {
      console.error('匯出失敗:', error);
      Alert.alert('錯誤', '匯出資料時發生錯誤，請稍後再試');
    }
  };

  const deleteRecord = async (id) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除這筆記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDataRecord(id);
              await loadRecords();
            } catch (error) {
              Alert.alert('錯誤', '刪除失敗');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const getSentimentText = (sentiment) => {
    const sentiments = {
      1: '非常不好',
      2: '不好',
      3: '普通',
      4: '好',
      5: '非常好'
    };
    return sentiments[sentiment] || '未知';
  };

  const deleteAllRecords = () => {
    const deleteAll = async () => {
      try {
        await deleteDataRecord('all');
        await loadRecords();
      } catch (error) {
        Alert.alert('錯誤', '記錄刪除失敗');
      }
    };
    
    const confirmSecondDelete = () => {
      Alert.alert(
        '再次確認刪除全部記錄',
        '我們將無法復原任何資料，真的確定要刪除所有歷史記錄嗎？',
        [
          { text: '取消', style: 'cancel' },
          { text: '刪除全部', style: 'destructive', onPress: deleteAll }
        ]
      );
    };

    Alert.alert(
      '確認刪除全部記錄',
      '確定要刪除所有歷史記錄嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除全部',
          style: 'destructive',
          onPress: confirmSecondDelete
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>{formatDate(item.timestamp)}</Text>
        <TouchableOpacity
          onPress={() => deleteRecord(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>刪除</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.recordText}>
        情緒: {getSentimentText(item.sentiment)}
      </Text>

      <Text style={styles.recordText}>
        位置: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
      </Text>

      {item.video_path && (
        <View style={styles.videoPlaceholder}>
          <TouchableOpacity onPress={() => router.push({
            pathname: '/video-viewer',
            params: {
              videoPath: item.video_path,
              timestamp: item.timestamp.toString()
            }
          })}>
            <Text style={styles.videoText}>📹 影片已儲存</Text>
            <Text style={styles.videoPath}>{item.video_path.split('/').pop()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>歷史記錄 ({records.length})</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.exportButton} onPress={exportRecords}>
          <Text style={styles.exportButtonText}>匯出資料</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllRecords}>
          <Text style={styles.deleteAllButtonText}>全部刪除</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRecords} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>尚無記錄</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  recordItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteAllButton: {
    flex: 1,
    width: 'fit-content',
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginLeft: 4,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  exportButton: {
    flex: 1,
    width: 'fit-content',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginRight: 4,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  recordText: {
    fontSize: 16,
    marginBottom: 4,
  },
  videoPlaceholder: {
    backgroundColor: '#e8e8e8',
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  videoPath: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});