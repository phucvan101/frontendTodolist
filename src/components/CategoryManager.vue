<template>
    <el-dialog v-model="dialogVisible" title="Quản lý Danh mục" width="600px" @close="handleClose">
        <div class="space-y-4">
            <!-- Add New Category Form -->
            <el-card shadow="never">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-semibold">Thêm danh mục mới</span>
                    </div>
                </template>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-1">
                        <el-input v-model="newCategory.icon" placeholder="📁" maxlength="2" />
                    </div>
                    <div class="col-span-5">
                        <el-input v-model="newCategory.name" placeholder="Tên danh mục"
                            @keyup.enter="handleAddCategory" />
                    </div>
                    <div class="col-span-3">
                        <el-color-picker v-model="newCategory.color" />
                    </div>
                    <div class="col-span-3">
                        <el-button type="primary" :icon="Plus" @click="handleAddCategory"
                            :loading="categoryStore.loading" class="w-full">
                            Thêm
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- Categories List -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
                <el-card v-for="category in categoryStore.categories" :key="category._id" shadow="hover"
                    :body-style="{ padding: '12px' }">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            :style="{ backgroundColor: category.color + '20' }">
                            {{ category.icon }}
                        </div>

                        <div class="flex-1">
                            <div v-if="editingId !== category._id">
                                <div class="font-semibold">{{ category.name }}</div>
                                <div class="text-xs text-gray-500">
                                    {{ countTasksByCategory(category._id) }} tasks
                                </div>
                            </div>

                            <div v-else class="grid grid-cols-12 gap-2">
                                <el-input v-model="editForm.icon" class="col-span-2" maxlength="2" />
                                <el-input v-model="editForm.name" class="col-span-7" />
                                <el-color-picker v-model="editForm.color" class="col-span-3" />
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <template v-if="editingId !== category._id">
                                <el-button type="primary" :icon="Edit" circle size="small"
                                    @click="startEdit(category)" />
                                <el-button type="danger" :icon="Delete" circle size="small"
                                    @click="handleDeleteCategory(category._id)" />
                            </template>
                            <template v-else>
                                <el-button type="success" :icon="Check" circle size="small"
                                    @click="handleUpdateCategory" />
                                <el-button type="info" :icon="Close" circle size="small" @click="cancelEdit" />
                            </template>
                        </div>
                    </div>
                </el-card>

                <el-empty v-if="categoryStore.categories.length === 0" description="Chưa có danh mục nào"
                    :image-size="100" />
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Plus, Edit, Delete, Check, Close } from '@element-plus/icons-vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTaskStore } from '@/stores/taskStore';
import { ElMessageBox } from 'element-plus';

const categoryStore = useCategoryStore();
const taskStore = useTaskStore();

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);
const editingId = ref(null);

const newCategory = reactive({
    name: '',
    icon: '📁',
    color: '#409eff'
});

const editForm = reactive({
    name: '',
    icon: '',
    color: ''
});

watch(() => props.visible, (val) => {
    dialogVisible.value = val;
    if (val) {
        categoryStore.fetchCategories();
    }
});

const countTasksByCategory = (categoryId) => {
    return taskStore.tasks.filter(t => t.category === categoryId).length;
};

const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
        await categoryStore.createCategory({
            name: newCategory.name,
            icon: newCategory.icon || '📁',
            color: newCategory.color
        });

        newCategory.name = '';
        newCategory.icon = '📁';
        newCategory.color = '#409eff';
    } catch (error) {
        console.error('Add category error:', error);
    }
};

const startEdit = (category) => {
    editingId.value = category._id;
    editForm.name = category.name;
    editForm.icon = category.icon;
    editForm.color = category.color;
};

const cancelEdit = () => {
    editingId.value = null;
    editForm.name = '';
    editForm.icon = '';
    editForm.color = '';
};

const handleUpdateCategory = async () => {
    if (!editForm.name.trim()) return;

    try {
        await categoryStore.updateCategory(editingId.value, {
            name: editForm.name,
            icon: editForm.icon,
            color: editForm.color
        });
        categoryStore.fetchCategories();
        cancelEdit();
    } catch (error) {
        console.error('Update category error:', error);
    }
};

const handleDeleteCategory = async (id) => {
    const taskCount = countTasksByCategory(id);

    try {
        await ElMessageBox.confirm(
            taskCount > 0
                ? `Danh mục này có ${taskCount} tasks. Các tasks sẽ không bị xóa nhưng sẽ mất danh mục. Tiếp tục?`
                : 'Bạn có chắc muốn xóa danh mục này?',
            'Xác nhận xóa',
            {
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                type: 'warning'
            }
        );

        await categoryStore.deleteCategory(id);
        categoryStore.fetchCategories();
    } catch (error) {
        // User cancelled
    }
};

const handleClose = () => {
    dialogVisible.value = false;
    emit('update:visible', false);
    cancelEdit();
};
</script>