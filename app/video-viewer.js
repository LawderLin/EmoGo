import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Button
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, router } from 'expo-router';
import { File } from 'expo-file-system';

export default function VideoViewerScreen() {
    const { videoPath, timestamp } = useLocalSearchParams();
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const video = useRef(null);

    const formatDate = (timestamp) => {
        return new Date(parseInt(timestamp)).toLocaleString('zh-TW');
    };

    const handleVideoLoad = () => {
        setLoading(false);
    };

    const handleVideoError = (error) => {
        setLoading(false);
        console.error('影片載入錯誤:', error);
        Alert.alert('錯誤', '無法載入影片檔案');
    };

    const checkFileExists = async () => {
        try {
            const file = new File(videoPath);
            if (!file.exists) {
                Alert.alert('錯誤', '影片檔案不存在');
                router.back();
            }
        } catch (error) {
            console.error('檢查檔案錯誤:', error);
            Alert.alert('錯誤', '無法存取影片檔案');
            router.back();
        }
    };

    React.useEffect(() => {
        if (videoPath) {
            checkFileExists();
        }
    }, [videoPath]);

    if (!videoPath) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>找不到影片路徑</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>返回</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const player = useVideoPlayer(videoPath, player => {
        player.loop = true;
        player.play();
    });


    return (
        <View style={styles.container}>
            {timestamp && (
                <Text style={styles.dateText}>
                    錄製時間: {formatDate(timestamp)}
                </Text>
            )}

            <View style={styles.videoContainer}>
                <VideoView
                    VideoView style={styles.video} player={player} fullscreenOptions={true}/>
                <View style={styles.controlsContainer}>
                    <Button
                        title={isPlaying ? 'Pause' : 'Play'}
                        onPress={() => {
                            if (isPlaying) {
                                player.pause();
                            } else {
                                player.play();
                            }
                        }}
                    />
                </View>
            </View>

            <Text style={styles.videoInfo}>
                檔案: {videoPath.split('/').pop()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1a1a1a',
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 16,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateText: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 8,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    video: {
        marginTop: 20,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        alignItems: 'center',
        zIndex: 1,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#1a1a1a',
    },
    controlButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    videoInfo: {
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 20,
    },
});