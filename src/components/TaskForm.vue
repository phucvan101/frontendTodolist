<template>
    <el-drawer v-model="drawerVisible" :title="editMode ? 'Chỉnh sửa Task' : 'Thêm Task Mới'" direction="rtl"
        size="500px" @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="px-4">
            <el-form-item label="Tiêu đề" prop="title">
                <el-input v-model="form.title" placeholder="Nhập tiêu đề task" :prefix-icon="EditPen" clearable />
            </el-form-item>

            <el-form-item label="Mô tả" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="4"
                    placeholder="Nhập mô tả chi tiết về task" />
            </el-form-item>

            <el-form-item label="Hạn chót" prop="dueDate">
                <el-date-picker v-model="form.dueDate" type="date" placeholder="Chọn ngày hạn chót" format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD" class="w-full" :prefix-icon="Calendar" />
            </el-form-item>

            <el-form-item label="Trạng thái" prop="status">
                <el-select v-model="form.status" placeholder="Chọn trạng thái" class="w-full">
                    <el-option label="Đang làm" value="pending">
                        <div class="flex items-center gap-2">
                            <el-tag type="warning" size="small">Đang làm</el-tag>
                        </div>
                    </el-option>
                    <el-option label="Hoàn thành" value="done">
                        <div class="flex items-center gap-2">
                            <el-tag type="success" size="small">Hoàn thành</el-tag>
                        </div>
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex gap-3">
                <el-button @click="handleClose" size="large" class="flex-1">
                    Hủy
                </el-button>
                <el-button type="primary" @click="handleSubmit" :loading="taskStore.loading" size="large"
                    class="flex-1">
                    {{ editMode ? 'Cập nhật' : 'Thêm mới' }}
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { EditPen, Calendar } from '@element-plus/icons-vue';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

const props = defineProps({
    visible: Boolean,
    task: Object
});

const emit = defineEmits(['update:visible', 'success']);

const drawerVisible = ref(props.visible);

watch(() => props.visible, (val) => {
    drawerVisible.value = val;
});
const editMode = ref(false);
const formRef = ref(null);

const form = reactive({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
});

const rules = {
    title: [
        { required: true, message: 'Vui lòng nhập tiêu đề', trigger: 'blur' }
    ]
};

const resetForm = () => {
    Object.assign(form, {
        title: '',
        description: '',
        dueDate: '',
        status: 'pending'
    });
};

// Watch for task prop changes (for edit mode)
watch(() => props.task, (newTask) => {
    if (newTask) {
        editMode.value = true;
        Object.assign(form, {
            title: newTask.title,
            description: newTask.description || '',
            dueDate: newTask.dueDate || '',
            status: newTask.status
        });
    } else {
        editMode.value = false;
        resetForm();
    }
}, { immediate: true });



const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            if (editMode.value && props.task) {
                await taskStore.updateTask(props.task._id, form);
            } else {
                await taskStore.createTask(form);
            }

            handleClose();
            emit('success');
        } catch (error) {
            console.error('Submit task error:', error);
        }
    });
};

const handleClose = () => {
    drawerVisible.value = false;
    emit('update:visible', false);
    // formRef.value?.resetFields();
    // resetForm();
};
</script>