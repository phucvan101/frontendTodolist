import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/services/api';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const token = ref(null);
    const loading = ref(false);

    // Computed
    const isLoggedIn = computed(() => !!token.value);

    // Initialize from localStorage
    const initAuth = () => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            token.value = savedToken;
            user.value = JSON.parse(savedUser);
        }
    };

    // Actions
    const login = async (credentials) => {
        loading.value = true;
        try {
            const response = await authAPI.login(credentials);

            token.value = response.token;
            user.value = response.user;

            localStorage.setItem('token', response.token);
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

            token.value = response.token;
            user.value = response.user;

            localStorage.setItem('token', response.token);
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

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        ElMessage.success('Đăng xuất thành công!');
    };

    return {
        user,
        token,
        loading,
        isLoggedIn,
        initAuth,
        login,
        register,
        logout
    };
});