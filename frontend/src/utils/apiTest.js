import instance from '../config/axios';

export const checkApiHealth = async () => {
  try {
    const response = await instance.get('/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('API Health check failed:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data?.message || error.message
    };
  }
};

export const testApiConnection = async () => {
  try {
    const healthCheck = await checkApiHealth();
    if (healthCheck.success) {
      console.log('✅ Backend connection successful');
      console.log('API Status:', healthCheck.data);
      return true;
    } else {
      console.error('❌ Backend connection failed');
      console.error('Error:', healthCheck.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};