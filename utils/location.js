import * as Location from 'expo-location';

// 請求位置權限並獲取當前位置
export const getCurrentLocation = async () => {
  try {
    // 請求位置權限
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('位置權限被拒絕');
    }

    // 獲取當前位置
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000, // 10秒超時
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('獲取位置失敗:', error);
    
    // 如果無法獲取精確位置，嘗試獲取粗略位置
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
        timeout: 5000,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };
    } catch (fallbackError) {
      console.error('獲取粗略位置也失敗:', fallbackError);
      throw new Error('無法獲取位置信息');
    }
  }
};

// 檢查位置權限狀態
export const checkLocationPermissions = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('檢查位置權限失敗:', error);
    return false;
  }
};

// 請求位置權限
export const requestLocationPermissions = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('請求位置權限失敗:', error);
    return false;
  }
};

// 將座標轉換為地址（可選功能）
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (addresses.length > 0) {
      const address = addresses[0];
      return {
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode
      };
    }
    return null;
  } catch (error) {
    console.error('反向地理編碼失敗:', error);
    return null;
  }
};