import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import SentimentQuestionnaire from './SentimentQuestionnaire';
import VlogRecorder from './VlogRecorder';
import { getCurrentLocation } from '../utils/location';
import { saveDataRecord, getTodaysRecordsCount } from '../utils/database';

export default function DataCollector() {
  const [currentStep, setCurrentStep] = useState('questionnaire'); // questionnaire -> video -> complete
  const [sentiment, setSentiment] = useState(null);
  const [videoPath, setVideoPath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todaysCount, setTodaysCount] = useState(0);

  React.useEffect(() => {
    checkTodaysRecords();
  }, []);

  const checkTodaysRecords = async () => {
    try {
      const count = await getTodaysRecordsCount();
      setTodaysCount(count);
    } catch (error) {
      console.error('Failed to check today records:', error);
    }
  };

  const handleSentimentComplete = (sentimentValue) => {
    setSentiment(sentimentValue);
    setCurrentStep('video');
  };

  const handleVideoComplete = (path) => {
    setVideoPath(path);
    setCurrentStep('location');
    handleLocationAndSave(path);
  };

  const handleLocationAndSave = async (videoPath) => {
    setIsLoading(true);
    
    try {
      // 取得GPS位置
      const location = await getCurrentLocation();
      
      // 儲存到資料庫
      await saveDataRecord({
        sentiment,
        videoPath,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      });

      Alert.alert(
        '完成！',
        '數據已成功收集和儲存',
        [
          {
            text: 'OK',
            onPress: () => {
              // 重置狀態
              setCurrentStep('questionnaire');
              setSentiment(null);
              setVideoPath(null);
              checkTodaysRecords();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save data:', error);
      Alert.alert('錯誤', '儲存數據時發生錯誤');
      setCurrentStep('questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep('questionnaire');
    setSentiment(null);
    setVideoPath(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>正在保存數據...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          今日已收集: {todaysCount}/3 次
        </Text>
        
        {todaysCount >= 3 && (
          <Text style={styles.completeText}>
            ✅ 今日任務已完成！
          </Text>
        )}
      </View>

      <View style={styles.stepIndicator}>
        <View style={[
          styles.step,
          currentStep === 'questionnaire' && styles.activeStep
        ]}>
          <Text style={styles.stepText}>1. 情感問卷</Text>
        </View>
        <View style={[
          styles.step,
          currentStep === 'video' && styles.activeStep
        ]}>
          <Text style={styles.stepText}>2. 錄製短片</Text>
        </View>
        <View style={[
          styles.step,
          currentStep === 'location' && styles.activeStep
        ]}>
          <Text style={styles.stepText}>3. 定位儲存</Text>
        </View>
      </View>

      {currentStep === 'questionnaire' && (
        <SentimentQuestionnaire onComplete={handleSentimentComplete} />
      )}

      {currentStep === 'video' && (
        <VlogRecorder onComplete={handleVideoComplete} />
      )}

      {currentStep !== 'questionnaire' && (
        <TouchableOpacity style={styles.resetButton} onPress={resetProcess}>
          <Text style={styles.resetButtonText}>重新開始</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completeText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  step: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#007AFF',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});