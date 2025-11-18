import { View, Text, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import DataCollector from "../../components/DataCollector";
import { requestPermissions, scheduleNotifications } from "../../utils/notifications";
import { initializeDatabase } from "../../utils/database";

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 初始化數據庫
      await initializeDatabase();
      
      // 請求權限
      await requestPermissions();
      
      // 設定通知
      await scheduleNotifications();
      
      setIsReady(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert('初始化失敗', '應用程式初始化時發生錯誤');
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>正在初始化...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>每日數據收集</Text>
      <DataCollector />
      
      <Link href="/(tabs)/history" style={styles.link}>
        查看歷史記錄
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    marginBottom: 12,
    textDecorationLine: "underline",
  },
});
