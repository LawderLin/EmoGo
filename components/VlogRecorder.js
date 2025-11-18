import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function VlogRecorder({ onComplete }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const onCameraReady = async () => setIsCameraReady(true);
  const cameraRef = useRef(null);
  const recordingRef = useRef(null);

  if (!permission) {
    return <View style={styles.container}><Text>載入相機權限...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>需要相機權限才能錄製影片</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>授權相機權限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 1, // 1秒錄製
          VideoCodec: 'jpeg', // iOS 需要指定編碼格式
        });

        setTimeout(() => {
          stopRecording();
          console.log('自動停止錄製');
        }, 1000); // 1秒後自動停止錄製

        recordingRef.current = video;
      } catch (error) {
        Alert.alert('錯誤', error.message || '錄製影片時發生錯誤');
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        cameraRef.current.stopRecording();
        setIsRecording(false);

        if (recordingRef.current) {
          // 將影片移動到應用程式目錄
          const newPath = recordingRef.current.uri;
          console.log('影片儲存至:', newPath);

          onComplete(newPath);
        }
      } catch (error) {
        console.error('停止錄製失敗:', error);
        Alert.alert('錯誤', '停止錄製時發生錯誤');
        setIsRecording(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>錄製 1 秒短片</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          mode="video"
          ratio='1:1'
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          videoQuality="720p"
          onCameraReady={onCameraReady}
        />

        {isRecording ? (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingText}>錄製中... (1秒)</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <Text style={styles.recordButtonText}>開始錄製</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.instruction}>
          點擊「開始錄製」後，將會自動錄製1秒鐘的影片
        </Text>
      </View>

      {isRecording ? (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={stopRecording}
        >
          <Text style={styles.recordButtonText}>停止錄製</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    minWidth: 120,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});