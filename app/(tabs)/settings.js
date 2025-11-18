import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { 
  getDatabaseStats,
  getTodaysRecordsCount 
} from '../../utils/database';
import { 
  getScheduledNotifications, 
  cancelAllNotifications,
  scheduleNotifications,
  sendTestNotification 
} from '../../utils/notifications';

export default function SettingsScreen() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    todaysRecords: 0,
    lastRecordTime: null,
    scheduledNotifications: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await getDatabaseStats();
      const todaysCount = await getTodaysRecordsCount();
      const notifications = await getScheduledNotifications();
      
      setStats({
        totalRecords: dbStats.totalRecords,
        todaysRecords: todaysCount,
        lastRecordTime: dbStats.lastRecordTime,
        scheduledNotifications: notifications.length
      });
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  const handleResetNotifications = async () => {
    Alert.alert(
      '重設通知',
      '這將取消所有現有通知並重新設定每日提醒',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              await scheduleNotifications();
              await loadStats();
              Alert.alert('成功', '通知已重新設定');
            } catch (error) {
              Alert.alert('錯誤', '重設通知失敗');
            }
          }
        }
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('測試通知已發送', '請檢查通知是否正常顯示');
    } catch (error) {
      Alert.alert('錯誤', '發送測試通知失敗');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '無';
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>設定與統計</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 數據統計</Text>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總記錄數</Text>
          <Text style={styles.statValue}>{stats.totalRecords}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>今日記錄數</Text>
          <Text style={styles.statValue}>{stats.todaysRecords}/3</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>最後記錄時間</Text>
          <Text style={styles.statValue}>{formatDate(stats.lastRecordTime)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 通知管理</Text>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>已排程通知</Text>
          <Text style={styles.statValue}>{stats.scheduledNotifications}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResetNotifications}
        >
          <Text style={styles.buttonText}>重設每日通知</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleTestNotification}
        >
          <Text style={styles.buttonText}>發送測試通知</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ 應用資訊</Text>
        
        <Text style={styles.infoText}>
          本應用每天會在以下時間提醒您收集數據：
        </Text>
        <Text style={styles.timeText}>• 上午 9:00</Text>
        <Text style={styles.timeText}>• 下午 2:00</Text>
        <Text style={styles.timeText}>• 晚上 8:00</Text>
        
        <Text style={styles.infoText}>
          每次收集包含：情感問卷、1秒短片、GPS位置
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.refreshButton]} 
        onPress={loadStats}
      >
        <Text style={styles.buttonText}>刷新統計</Text>
      </TouchableOpacity>
    </ScrollView>
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
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 16,
    marginBottom: 4,
  },
});
