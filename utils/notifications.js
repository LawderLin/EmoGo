import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 設定通知處理方式
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 請求通知權限
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('通知權限被拒絕');
    }

    // Android 需要額外設定通知頻道
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: '每日提醒',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.error('請求通知權限失敗:', error);
    return false;
  }
};

// 請求所有必要的權限
export const requestPermissions = async () => {
  try {
    // 請求通知權限
    await requestNotificationPermissions();
    
    console.log('所有權限請求完成');
    return true;
  } catch (error) {
    console.error('權限請求失敗:', error);
    throw error;
  }
};

// 排程每日通知
export const scheduleNotifications = async () => {
  try {
    // 先取消所有現有通知
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 設定三個時間點：早上9點、下午2點、晚上8點
    const notificationTimes = [
      { hour: 9, minute: 0, identifier: 'morning-reminder' },
      { hour: 14, minute: 0, identifier: 'afternoon-reminder' },
      { hour: 20, minute: 0, identifier: 'evening-reminder' }
    ];

    for (const time of notificationTimes) {
      await Notifications.scheduleNotificationAsync({
        identifier: time.identifier,
        content: {
          title: '📊 每日數據收集提醒',
          body: '該收集今天的數據了！包含情感問卷、短片錄製和位置信息。',
          data: { 
            action: 'collect_data',
            time: `${time.hour}:${time.minute.toString().padStart(2, '0')}` 
          },
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
    }
    
    console.log('每日通知排程設定完成');
  } catch (error) {
    console.error('設定通知失敗:', error);
    throw error;
  }
};

// 發送立即通知（測試用）
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '測試通知',
        body: '這是一個測試通知',
        data: { action: 'test' },
      },
      trigger: { seconds: 1 },
    });
  } catch (error) {
    console.error('發送測試通知失敗:', error);
  }
};

// 取得已排程的通知
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('取得排程通知失敗:', error);
    return [];
  }
};

// 取消所有通知
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('已取消所有通知');
  } catch (error) {
    console.error('取消通知失敗:', error);
  }
};