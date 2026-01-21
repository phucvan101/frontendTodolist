<template>
    <el-dialog v-model="dialogVisible" title="🤖 AI Task Assistant" width="700px" @close="handleClose">
        <div class="space-y-6">
            <!-- Quick Generate -->
            <el-card shadow="never" class="bg-gradient-to-r from-blue-50 to-purple-50">
                <template #header>
                    <div class="flex items-center gap-2">
                        <el-icon :size="20" color="#409eff">
                            <MagicStick />
                        </el-icon>
                        <span class="font-semibold">Smart Task Generation</span>
                    </div>
                </template>

                <div class="space-y-4">
                    <el-input v-model="shortDescription" type="textarea" :rows="3"
                        placeholder="Nhập mô tả ngắn gọn về task... (VD: 'làm landing page cho sản phẩm mới')"
                        @keyup.ctrl.enter="handleQuickGenerate" />

                    <div class="flex gap-2">
                        <el-button type="primary" :icon="MagicStick" @click="handleQuickGenerate" :loading="generating"
                            :disabled="!shortDescription.trim()">
                            Tạo Task Thông Minh
                        </el-button>
                        <el-button type="success" :icon="Check" @click="handleGenerateAndSave" :loading="generating"
                            :disabled="!shortDescription.trim()">
                            Tạo & Lưu Luôn
                        </el-button>
                    </div>

                    <div class="text-xs text-gray-500">
                        💡 Tips: Mô tả càng cụ thể, AI sẽ tạo task càng chính xác. VD: "Thiết kế logo cho app mobile
                        banking, phong cách
                        hiện đại"
                    </div>
                </div>
            </el-card>

            <!-- Generated Task Preview -->
            <el-card v-if="generatedTask" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-semibold">✨ Task AI đã tạo</span>
                        <el-tag type="success">AI Generated</el-tag>
                    </div>
                </template>

                <div class="space-y-4">
                    <!-- Title -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-1 block">Tiêu đề</label>
                        <el-input v-model="generatedTask.title" />
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-1 block">Mô tả chi tiết</label>
                        <el-input v-model="generatedTask.description" type="textarea" :rows="6" />
                    </div>

                    <!-- Priority & Time -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-1 block">Danh mục</label>
                            <el-select v-model="generatedTask.category" class="w-full">
                                <el-option v-for="cat in categoryStore.categories" :key="cat._id" :label="cat.name"
                                    :value="cat._id">
                                    <div class="flex items-center gap-2">
                                        <span>{{ cat.icon }}</span>
                                        <span>{{ cat.name }}</span>
                                        <div class="w-3 h-3 rounded-full ml-auto"
                                            :style="{ backgroundColor: cat.color }"></div>
                                    </div>
                                </el-option>
                            </el-select>
                        </div>

                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-1 block">Trạng thái</label>
                            <el-select v-model="generatedTask.status" placeholder="Chọn trạng thái" class="w-full">
                                <el-option label="Chưa bắt đầu" value="pending">
                                    <div class="flex items-center gap-2">
                                        <el-tag
                                            style="background-color:#f4f4f5; color: #909399; border: 0.5px #909399 solid;"
                                            size="small">Chưa
                                            bắt
                                            đầu</el-tag>
                                    </div>
                                </el-option>
                                <el-option label="Đang làm" value="in-progress">
                                    <div class="flex items-center gap-2">
                                        <el-tag type="warning" size="small">Đang làm</el-tag>
                                    </div>
                                </el-option>
                            </el-select>
                        </div>
                    </div>

                    <!-- Priority & Time -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-1 block">Độ ưu tiên</label>
                            <el-select v-model="generatedTask.priority" class="w-full">
                                <el-option label="Thấp" value="low">
                                    <el-tag type="info" size="small">Thấp</el-tag>
                                </el-option>
                                <el-option label="Trung bình" value="medium">
                                    <el-tag type="warning" size="small">Trung bình</el-tag>
                                </el-option>
                                <el-option label="Cao" value="high">
                                    <el-tag type="danger" size="small">Cao</el-tag>
                                </el-option>
                                <el-option label="Khẩn cấp" value="urgent">
                                    <el-tag type="danger" effect="dark" size="small">Khẩn cấp</el-tag>
                                </el-option>
                            </el-select>
                        </div>

                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-1 block">Hạn chót</label>
                            <el-date-picker v-model="generatedTask.dueDate" type="date" placeholder="Chọn ngày"
                                format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="w-full" />
                        </div>
                    </div>

                    <!-- Tags -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
                        <div class="flex gap-2 flex-wrap">
                            <el-tag v-for="tag in generatedTask.tags" :key="tag" closable @close="removeTag(tag)">
                                {{ tag }}
                            </el-tag>
                        </div>
                    </div>

                    <!-- Checklist -->
                    <div v-if="generatedTask.checklist?.length">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">
                            📋 Checklist ({{ generatedTask.checklist.length }} bước)
                        </label>
                        <div class="space-y-2">
                            <div v-for="(item, idx) in generatedTask.checklist" :key="idx"
                                class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <el-icon color="#67c23a"><Select /></el-icon>
                                <span class="text-sm">{{ item }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- AI Metadata -->
                    <el-alert type="info" :closable="false" show-icon>
                        <template #title>
                            <div class="text-xs">
                                ⏱️ Thời gian ước tính: <strong>{{ generatedTask.estimatedTime }}</strong>
                            </div>
                        </template>
                    </el-alert>

                    <!-- Actions -->
                    <div class="flex gap-2 pt-2">
                        <el-button type="primary" :icon="Check" @click="handleSaveGeneratedTask" :loading="saving"
                            class="flex-1">
                            Lưu Task
                        </el-button>
                        <el-button :icon="RefreshRight" @click="handleQuickGenerate" :loading="generating">
                            Tạo lại
                        </el-button>
                        <el-button :icon="Close" @click="generatedTask = null">
                            Hủy
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- Batch Generate -->
            <el-card shadow="never">
                <template #header>
                    <div class="flex items-center gap-2">
                        <el-icon :size="20" color="#67c23a">
                            <DocumentCopy />
                        </el-icon>
                        <span class="font-semibold">Tạo Nhiều Tasks Cùng Lúc</span>
                    </div>
                </template>

                <div class="space-y-3">
                    <el-input v-model="batchInput" type="textarea" :rows="5" placeholder="Nhập mỗi task trên một dòng:
- Thiết kế wireframe
- Code frontend
- Viết unit tests
- Deploy lên production" />

                    <el-button type="success" :icon="DocumentCopy" @click="handleBatchGenerate"
                        :loading="batchGenerating" :disabled="!batchInput.trim()">
                        Tạo Tất Cả ({{batchInput.split('\n').filter(l => l.trim()).length}} tasks)
                    </el-button>
                </div>
            </el-card>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import {
    MagicStick,
    Check,
    Close,
    RefreshRight,
    DocumentCopy,
    Select
} from '@element-plus/icons-vue';
import { aiAPI } from '@/services/api';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { ElMessage } from 'element-plus';

const taskStore = useTaskStore();
const categoryStore = useCategoryStore();

const props = defineProps({
    visible: Boolean
});

onMounted(() => {
    if (!categoryStore.categories.length) {
        categoryStore.fetchCategories();
        console.log('c: ', categoryStore.categories)
    }
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(props.visible);
const shortDescription = ref('');
const generatedTask = ref({
    status: 'pending', // mặc định
    category: null,
});
const generating = ref(false);
const saving = ref(false);
const batchInput = ref('');
const batchGenerating = ref(false);

watch(() => props.visible, (val) => {
    dialogVisible.value = val;
    if (!val) {
        resetForm();
    }
});

const resetForm = () => {
    shortDescription.value = '';
    generatedTask.value = null;
    batchInput.value = '';
};

const handleQuickGenerate = async () => {
    if (!shortDescription.value.trim()) {
        ElMessage.warning('Vui lòng nhập mô tả task');
        return;
    }

    generating.value = true;
    try {
        const response = await aiAPI.generateTask(shortDescription.value);
        const details = response.taskDetails;
        generatedTask.value = {
            status: 'pending',
            category: null,
            ...details
        }
        ElMessage.success('AI đã tạo task thành công! 🎉');
    } catch (error) {
        console.error('Generate task error:', error);
    } finally {
        generating.value = false;
    }
};

const handleGenerateAndSave = async () => {
    if (!shortDescription.value.trim()) {
        ElMessage.warning('Vui lòng nhập mô tả task');
        return;
    }

    generating.value = true;
    try {
        const response = await aiAPI.createTaskWithAI(shortDescription.value, true);
        ElMessage.success('AI đã tạo và lưu task thành công! 🎉');
        emit('success');
        handleClose();
    } catch (error) {
        console.error('Generate and save error:', error);
    } finally {
        generating.value = false;
    }
};

const handleSaveGeneratedTask = async () => {
    saving.value = true;

    try {
        console.log('Saving task:', generatedTask.value);
        await taskStore.createTask(generatedTask.value);
        ElMessage.success('Đã lưu task thành công! 🎉');
        emit('success');
        handleClose();
    } catch (error) {
        console.error('Save task error:', error);
    } finally {
        saving.value = false;
    }
};

const removeTag = (tag) => {
    const index = generatedTask.value.tags.indexOf(tag);
    if (index > -1) {
        generatedTask.value.tags.splice(index, 1);
    }
};

const handleBatchGenerate = async () => {
    const descriptions = batchInput.value
        .split('\n')
        .map(line => line.trim().replace(/^[-*]\s*/, ''))
        .filter(line => line.length > 0);

    if (descriptions.length === 0) {
        ElMessage.warning('Vui lòng nhập ít nhất 1 task');
        return;
    }

    if (descriptions.length > 10) {
        ElMessage.warning('Tối đa 10 tasks mỗi lần');
        return;
    }

    batchGenerating.value = true;
    try {
        const response = await aiAPI.batchGenerate(descriptions);

        // Save all tasks
        for (const task of response.tasks) {
            await taskStore.createTask(task);
        }

        ElMessage.success(`Đã tạo ${response.tasks.length} tasks thành công! 🎉`);
        emit('success');
        handleClose();
    } catch (error) {
        console.error('Batch generate error:', error);
    } finally {
        batchGenerating.value = false;
    }
};

const handleClose = () => {
    dialogVisible.value = false;
    emit('update:visible', false);
    resetForm();
};
</script>