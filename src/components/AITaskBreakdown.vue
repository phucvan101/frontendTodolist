<template>
    <el-dialog v-model="dialogVisible" title="🧩 AI Task Breakdown" width="800px" @close="handleClose">
        <div class="space-y-6">
            <!-- Input Task -->
            <el-card shadow="never" class="bg-blue-50">
                <div class="space-y-3">
                    <el-input v-model="taskTitle"
                        placeholder="Nhập tiêu đề task lớn (VD: 'Xây dựng website e-commerce')" />
                    <el-input v-model="taskDescription" type="textarea" :rows="3"
                        placeholder="Mô tả chi tiết task (tùy chọn)" />
                    <el-button type="primary" :icon="MagicStick" @click="handleBreakdown" :loading="loading"
                        :disabled="!taskTitle.trim()" class="w-full">
                        Chia Nhỏ Task
                    </el-button>
                </div>
            </el-card>

            <!-- Breakdown Result -->
            <div v-if="breakdown" class="space-y-4">
                <!-- Analysis -->
                <el-alert type="info" :closable="false" show-icon>
                    <template #title>
                        <div class="text-sm">
                            <strong>Phân tích AI:</strong> {{ breakdown.analysis }}
                        </div>
                    </template>
                </el-alert>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4">
                    <el-card shadow="hover">
                        <el-statistic title="Subtasks" :value="breakdown.subtasks.length">
                            <template #prefix>
                                <el-icon color="#409eff">
                                    <List />
                                </el-icon>
                            </template>
                        </el-statistic>
                    </el-card>
                    <el-card shadow="hover">
                        <el-statistic :title="breakdown.totalEstimatedTime" value="">
                            <template #prefix>
                                <el-icon color="#67c23a">
                                    <Timer />
                                </el-icon>
                            </template>
                        </el-statistic>
                    </el-card>
                    <el-card shadow="hover">
                        <div class="text-center">
                            <div class="text-xs text-gray-500 mb-1">Approach</div>
                            <div class="text-sm font-semibold line-clamp-2">
                                {{ breakdown.recommendedApproach }}
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- Subtasks List -->
                <div class="space-y-3">
                    <div v-for="(subtask, idx) in breakdown.subtasks" :key="idx" class="relative">
                        <el-card shadow="hover" :body-style="{ padding: '16px' }">
                            <div class="flex items-start gap-3">
                                <!-- Order Badge -->
                                <div class="flex-shrink-0">
                                    <div
                                        class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                        {{ subtask.order }}
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-2 mb-2">
                                        <h4 class="font-semibold text-gray-800">{{ subtask.title }}</h4>
                                        <el-tag :type="getPriorityType(subtask.priority)" size="small">
                                            {{ getPriorityLabel(subtask.priority) }}
                                        </el-tag>
                                    </div>

                                    <p class="text-sm text-gray-600 mb-2">{{ subtask.description }}</p>

                                    <div class="flex items-center gap-3 text-xs text-gray-500">
                                        <div class="flex items-center gap-1">
                                            <el-icon>
                                                <Timer />
                                            </el-icon>
                                            <span>{{ subtask.estimatedTime }}</span>
                                        </div>
                                        <div v-if="subtask.dependencies?.length" class="flex items-center gap-1">
                                            <el-icon>
                                                <Link />
                                            </el-icon>
                                            <span>Phụ thuộc: #{{ subtask.dependencies.join(', #') }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Checkbox -->
                                <el-checkbox v-model="selectedSubtasks[idx]" />
                            </div>
                        </el-card>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <el-button type="primary" :icon="Check" @click="handleSaveAll" :loading="saving"
                        :disabled="selectedSubtasksCount === 0" class="flex-1">
                        Tạo {{ selectedSubtasksCount }} Tasks Đã Chọn
                    </el-button>
                    <el-button type="success" @click="selectAll">
                        Chọn tất cả
                    </el-button>
                    <el-button @click="deselectAll">
                        Bỏ chọn
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { MagicStick, Check, List, Timer, Link } from '@element-plus/icons-vue';
import { aiAPI } from '@/services/api';
import { useTaskStore } from '@/stores/taskStore';
import { ElMessage } from 'element-plus';

const taskStore = useTaskStore();

const props = defineProps({
    visible: Boolean,
    initialTask: Object
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(props.visible);
const taskTitle = ref('');
const taskDescription = ref('');
const breakdown = ref(null);
const loading = ref(false);
const saving = ref(false);
const selectedSubtasks = ref({});

watch(() => props.visible, (val) => {
    dialogVisible.value = val;
    if (val && props.initialTask) {
        taskTitle.value = props.initialTask.title || '';
        taskDescription.value = props.initialTask.description || '';
    } else if (!val) {
        resetForm();
    }
});

const selectedSubtasksCount = computed(() => {
    return Object.values(selectedSubtasks.value).filter(Boolean).length;
});

const resetForm = () => {
    taskTitle.value = '';
    taskDescription.value = '';
    breakdown.value = null;
    selectedSubtasks.value = {};
};

const getPriorityType = (priority) => {
    const map = { low: 'info', medium: 'warning', high: 'danger', urgent: 'danger' };
    return map[priority] || 'info';
};

const getPriorityLabel = (priority) => {
    const map = { low: 'Thấp', medium: 'TB', high: 'Cao', urgent: 'Khẩn' };
    return map[priority] || priority;
};

const handleBreakdown = async () => {
    loading.value = true;
    try {
        const response = await aiAPI.breakdownTask(taskTitle.value, taskDescription.value);
        breakdown.value = response.breakdown;

        // Select all by default
        breakdown.value.subtasks.forEach((_, idx) => {
            selectedSubtasks.value[idx] = true;
        });

        ElMessage.success('AI đã chia nhỏ task thành công! 🎉');
    } catch (error) {
        console.error('Breakdown error:', error);
    } finally {
        loading.value = false;
    }
};

const selectAll = () => {
    breakdown.value.subtasks.forEach((_, idx) => {
        selectedSubtasks.value[idx] = true;
    });
};

const deselectAll = () => {
    selectedSubtasks.value = {};
};

const handleSaveAll = async () => {
    saving.value = true;
    try {
        const tasksToCreate = breakdown.value.subtasks.filter((_, idx) => selectedSubtasks.value[idx]);

        for (const subtask of tasksToCreate) {
            await taskStore.createTask({
                title: subtask.title,
                description: subtask.description,
                dueDate: null,
                priority: subtask.priority,
                status: 'pending',
            });
        }

        ElMessage.success(`Đã tạo ${tasksToCreate.length} tasks! 🎉`);
        emit('success');
        handleClose();
    } catch (error) {
        console.error('Save subtasks error:', error);
    } finally {
        saving.value = false;
    }
};

const handleClose = () => {
    dialogVisible.value = false;
    emit('update:visible', false);
    resetForm();
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>