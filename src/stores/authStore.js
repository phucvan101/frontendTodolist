import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/services/api';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const loading = ref(false);

    // Computed
    const isLoggedIn = computed(() => !!accessToken.value);

    // Initialize from localStorage
    const initAuth = () => {
        const saveAccessToken = localStorage.getItem('accessToken');
        const saveRefreshToken = localStorage.getItem('refreshToken');
        const savedUser = localStorage.getItem('user');

        if (saveRefreshToken && saveAccessToken) {
            accessToken.value = saveAccessToken;
            refreshToken.value = saveRefreshToken;
            user.value = JSON.parse(savedUser);

        }
    };

    // Actions
    const login = async (credentials) => {
        loading.value = true;
        try {
            const response = await authAPI.login(credentials);

            accessToken.value = response.accessToken;
            refreshToken.value = response.refreshToken;

            user.value = response.user;

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            ElMessage.success('Đăng nhập thành công!');
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const register = async (userData) => {
        loading.value = true;
        try {
            const response = await authAPI.register(userData);

            accessToken.value = response.accessToken;
            refreshToken.value = response.refreshToken;
            user.value = response.user;

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            ElMessage.success('Đăng ký thành công!');
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error: ', error);
        } finally {
            user.value = null;
            accessToken.value = null;
            refreshToken.value = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            ElMessage.success('Đăng xuất thành công');
        }
    };

    return {
        user,
        accessToken,
        refreshToken,
        loading,
        isLoggedIn,
        initAuth,
        login,
        register,
        logout
    };
});