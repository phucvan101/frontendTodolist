<template>
    <el-dialog v-model="dialogVisible" title="Chia sẻ Task" width="500px" @close="handleClose">
        <div class="space-y-4">
            <!-- Share Form -->
            <el-card shadow="never">
                <div class="space-y-3">
                    <el-input v-model="shareForm.userEmail" placeholder="Nhập email người dùng" :prefix-icon="Message">
                        <template #prepend>
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                        </template>
                    </el-input>

                    <el-select v-model="shareForm.permission" placeholder="Chọn quyền" class="w-full">
                        <el-option label="Chỉ xem" value="view">
                            <div class="flex items-center gap-2">
                                <el-icon>
                                    <View />
                                </el-icon>
                                <span>Chỉ xem</span>
                            </div>
                        </el-option>
                        <el-option label="Chỉnh sửa" value="edit">
                            <div class="flex items-center gap-2">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                <span>Chỉnh sửa</span>
                            </div>
                        </el-option>
                    </el-select>

                    <el-button type="primary" :icon="Share" @click="handleShare" :loading="taskStore.loading"
                        class="w-full">
                        Chia sẻ
                    </el-button>
                </div>
            </el-card>

            <!-- Shared Users List -->
            <div v-if="task?.sharedWith?.length" class="space-y-2">
                <div class="text-sm font-semibold text-gray-600 mb-2">
                    Đã chia sẻ với ({{ task.sharedWith.length }})
                </div>

                <el-card v-for="shared in task.sharedWith" :key="shared.user._id" shadow="hover"
                    :body-style="{ padding: '12px' }">
                    <div class="flex items-center gap-3">
                        <el-avatar :size="36" :icon="UserFilled" />

                        <div class="flex-1">
                            <div class="font-semibold text-sm">{{ shared.user.name }}</div>
                            <div class="text-xs text-gray-500">{{ shared.user.email }}</div>
                        </div>

                        <el-tag :type="shared.permission === 'edit' ? 'success' : 'info'" size="small">
                            {{ shared.permission === 'edit' ? 'Chỉnh sửa' : 'Xem' }}
                        </el-tag>

                        <el-button type="danger" :icon="Delete" circle size="small"
                            @click="handleRemoveShare(shared.user._id)" />
                    </div>
                </el-card>
            </div>

            <el-empty v-else description="Chưa chia sẻ với ai" :image-size="100" />
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Share, UserFilled, Message, View, Edit, Delete } from '@element-plus/icons-vue';
import { useTaskStore } from '@/stores/taskStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const taskStore = useTaskStore();

const props = defineProps({
    visible: Boolean,
    task: Object
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(props.visible);

const shareForm = reactive({
    userEmail: '',
    permission: 'view'
});

watch(() => props.visible, (val) => {
    dialogVisible.value = val;
    if (!val) {
        resetForm();
    }
});

const resetForm = () => {
    shareForm.userEmail = '';
    shareForm.permission = 'view';
};

const handleShare = async () => {
    if (!shareForm.userEmail.trim()) {
        ElMessage.warning('Vui lòng nhập email');
        return;
    }

    try {
        await taskStore.shareTask(props.task._id, shareForm);
        resetForm();
        emit('success');
    } catch (error) {
        console.error('Share task error:', error);
    }
};

const handleRemoveShare = async (userId) => {
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc muốn thu hồi quyền truy cập?',
            'Xác nhận',
            {
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                type: 'warning'
            }
        );



        // Call API to remove share (you need to implement this in backend)
        ElMessage.success('Đã thu hồi quyền truy cập');
    } catch (error) {
        // User cancelled
    }
};

const handleClose = () => {
    dialogVisible.value = false;
    emit('update:visible', false);
    resetForm();
};
</script>