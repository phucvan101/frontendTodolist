<template>
    <el-dialog v-model="dialogVisible" :title="isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'" width="450px"
        @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
            <el-form-item v-if="isRegister" label="Họ tên" prop="name">
                <el-input v-model="form.name" placeholder="Nhập họ tên của bạn" :prefix-icon="User" />
            </el-form-item>

            <el-form-item label="Email" prop="email">
                <el-input v-model="form.email" type="email" placeholder="Nhập email" :prefix-icon="Message" />
            </el-form-item>

            <el-form-item label="Mật khẩu" prop="password">
                <el-input v-model="form.password" type="password" placeholder="Nhập mật khẩu" :prefix-icon="Lock"
                    show-password />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" :loading="authStore.loading" @click="handleSubmit" class="w-full"
                    size="large">
                    {{ isRegister ? 'Đăng ký' : 'Đăng nhập' }}
                </el-button>
            </el-form-item>
        </el-form>

        <div class="text-center text-gray-600">
            <span>{{ isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?' }}</span>
            <el-button type="primary" link @click="toggleMode">
                {{ isRegister ? 'Đăng nhập' : 'Đăng ký ngay' }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { User, Message, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(props.visible);

watch(() => props.visible, (val) => {
    dialogVisible.value = val;
});

const isRegister = ref(false);
const formRef = ref(null);

const form = reactive({
    name: '',
    email: '',
    password: ''
});

const rules = {
    name: [
        { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }
    ],
    email: [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
    ]
};

const toggleMode = () => {
    isRegister.value = !isRegister.value;
    formRef.value?.clearValidate();
};

const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            if (isRegister.value) {
                await authStore.register(form);
            } else {
                await authStore.login(form);
            }

            handleClose();
            emit('success');
        } catch (error) {
            console.error('Auth error:', error);
        }
    });
};

const handleClose = () => {
    dialogVisible.value = false;
    emit('update:visible', false);
    formRef.value?.resetFields();
};
</script>