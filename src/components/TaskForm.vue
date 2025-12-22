<template>
    <el-drawer v-model="drawerVisible" :title="editMode ? 'Chỉnh sửa Task' : 'Thêm Task Mới'" direction="rtl"
        size="500px" @close="handleClose" :close-on-click-modal="false">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="px-4">
            <el-form-item label="Tiêu đề" prop="title">
                <el-input v-model="form.title" placeholder="Nhập tiêu đề task" :prefix-icon="EditPen" clearable />
            </el-form-item>

            <el-form-item label="Mô tả" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="4"
                    placeholder="Nhập mô tả chi tiết về task" />
            </el-form-item>

            <div class="grid grid-cols-2 gap-4">
                <el-form-item label="Độ ưu tiên" prop="priority">
                    <el-select v-model="form.priority" placeholder="Chọn độ ưu tiên" class="w-full">
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
                </el-form-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <el-form-item label="Hạn chót" prop="dueDate">
                    <el-date-picker v-model="form.dueDate" type="date" placeholder="Chọn ngày hạn chót"
                        format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="w-full" :prefix-icon="Calendar" />
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
            </div>

            <el-form-item label="Tags">
                <el-select v-model="form.tags" multiple filterable allow-create
                    placeholder="Thêm tags (Enter để tạo mới)" class="w-full">
                    <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
                </el-select>
            </el-form-item>

            <!-- File Upload Section -->
            <el-form-item label="File đính kèm">
                <el-upload multiple name="attachments" :auto-upload="false" :on-change="handleFileChange"
                    :show-file-list="false" drag>
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        Kéo thả file vào đây hoặc <em>click để chọn</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            File tối đa 5MB (hỗ trợ: jpg, png, pdf, doc, docx)
                        </div>
                    </template>
                </el-upload>

                <!-- Selected new files -->
                <div v-if="selectedFiles.length" class="mt-2 space-y-2">
                    <div v-for="(file, idx) in selectedFiles" :key="file.name + idx"
                        class="p-2 bg-blue-50 rounded flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span class="text-sm">{{ file.name }}</span>
                        </div>

                        <el-icon @click="removeSelectedFile(idx)" class="cancel-file ml-1" style="color: red;">
                            <CircleClose />
                        </el-icon>
                    </div>
                </div>


                <!-- Existing Attachments -->
                <div v-if="form.attachments?.length" class="mt-3 space-y-2">
                    <div v-for="(att, idx) in form.attachments" :key="att._id"
                        class="p-2 bg-gray-50 rounded flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <Paperclip />
                            </el-icon>
                            <a :href="att.url" target="_blank" class="text-sm text-blue-600">
                                {{ att.filename }}
                            </a>
                        </div>


                        <el-icon @click="removeAttachment(att, idx)" class="cancel-file ml-1" style="color: red;">
                            <CircleClose />
                        </el-icon>
                    </div>

                </div>
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
import dayjs from 'dayjs'


const taskStore = useTaskStore();

const props = defineProps({
    visible: Boolean,
    task: Object
});

const emit = defineEmits(['update:visible', 'success']);

const drawerVisible = ref(props.visible);

watch(
    () => props.visible,
    (val) => {
        drawerVisible.value = val;

        // CHỈ reset khi ĐÓNG
        if (!val) {
            formRef.value?.resetFields();
            resetForm();
            editMode.value = false;
        }
    }
);


const editMode = ref(false);
const formRef = ref(null);
const selectedFiles = ref([]);


const form = reactive({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    status: 'pending',
    attachments: [],
    tags: [],

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
        priority: '',
        dueDate: '',
        status: 'pending',
        tags: [],
        attachments: [],
    });
    selectedFiles.value = [];
};

// Watch for task prop changes (for edit mode)
watch(() => props.task, (newTask) => {
    if (newTask) {
        editMode.value = true;
        Object.assign(form, {
            title: newTask.title,
            description: newTask.description || '',
            priority: newTask.priority || '',
            dueDate: newTask.dueDate || '',
            status: newTask.status,
            tags: newTask.tags,
            attachments: newTask.attachments,
        });
        console.log('fetchDetail: ', form)
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
                await taskStore.updateTask(
                    props.task._id,
                    form,
                    selectedFiles,
                    removedAttachmentIds
                );
            }
            else {
                await taskStore.createTask(form, selectedFiles);
            }

            handleClose();
            emit('success');
        } catch (error) {
            console.error('Submit task error:', error);
        }
    });
};

const handleClose = () => {
    // Always reset form and mode when closing to avoid stale edit state
    // formRef.value?.resetFields();
    // resetForm();
    // editMode.value = false;

    drawerVisible.value = false;
    emit('update:visible', false);
};

const handleFileChange = (file) => {
    const exists = selectedFiles.value.some(
        f => f.name === file.raw.name && f.size === file.raw.size
    );

    if (!exists) {
        selectedFiles.value.push(file.raw);
    }
};

const removeSelectedFile = (idx) => {
    selectedFiles.value.splice(idx, 1);
}

const removedAttachmentIds = ref([]);

const removeAttachment = (att, idx) => {
    removedAttachmentIds.value.push(att._id);
    form.attachments.splice(idx, 1);
    console.log('file: ', form.attachments)
};


</script>

<style scoped>
.cancel-file:hover {
    cursor: pointer;
    color: #c89c9c5a;
}
</style>