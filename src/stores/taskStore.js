import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { taskAPI } from '@/services/api';
import { ElMessage } from 'element-plus';

export const useTaskStore = defineStore('task', () => {
    // State
    const tasks = ref([]);
    const loading = ref(false);
    const pagination = ref({
        total: 0,
        page: 1,
        pages: 1
    });

    // Filters
    const searchTerm = ref('');
    const filterStatus = ref('all');
    const filterPriority = ref('all');
    // const filterCategory = ref('');
    const sortBy = ref('createdAt');

    // Computed
    const pendingTasks = computed(() =>
        tasks.value.filter(t => t.status === 'pending' && !t.isDeleted)
    );

    const completedTasks = computed(() =>
        tasks.value.filter(t => t.status === 'done' && !t.isDeleted)
    );

    const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in-progress' && !t.isDeleted));

    const urgentTasks = computed(() =>
        task.value.filter(t => t.priority === 'urgent' && !t.isDeleted)
    )

    // Actions
    const fetchTasks = async (page = 1) => {
        loading.value = true;
        try {
            const params = {
                page,
                limit: 10,
                status: filterStatus.value,
                search: searchTerm.value,
                priority: filterPriority.value,
                sortBy: sortBy.value,
                search: searchTerm.value,
            };

            const response = await taskAPI.getAll(params);
            tasks.value = response.tasks;
            pagination.value = response.pagination;
            console.log('Fetched', response);
        } catch (error) {
            console.error('Fetch tasks error:', error);
        } finally {
            loading.value = false;
        }
    };

    const createTask = async (taskData, selectedFiles) => {
        loading.value = true;
        try {
            const formData = new FormData();

            formData.append('title', taskData.title);
            formData.append('description', taskData.description);
            formData.append('priority', taskData.priority);
            formData.append('dueDate', taskData.dueDate);
            formData.append('status', taskData.status);

            taskData.tags?.forEach(tag => {
                formData.append('tags[]', tag);
            });

            if (selectedFiles) {
                selectedFiles.value.forEach(file => {
                    formData.append('attachments', file); // 👈 key trùng multer
                });
            }

            const response = await taskAPI.create(formData);

            tasks.value.unshift(response.task);
            ElMessage.success('Tạo task thành công!');
            return response.task;
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateTask = async (id, taskData, selectedFiles, removedAttachmentIds) => {
        loading.value = true;
        try {
            const formData = new FormData();

            formData.append('title', taskData.title);
            formData.append('description', taskData.description);
            formData.append('priority', taskData.priority);
            formData.append('dueDate', taskData.dueDate);
            formData.append('status', taskData.status);

            taskData.tags?.forEach(tag => {
                formData.append('tags[]', tag);
            });

            // 🔥 gửi id file bị xoá
            removedAttachmentIds.value.forEach(id => {
                formData.append('removeAttachments[]', id);
            });

            // 🔥 chỉ gửi FILE MỚI
            selectedFiles.value.forEach(file => {
                formData.append('attachments', file);
            });

            for (const [k, v] of formData.entries()) {
                console.log(k, v);
            }

            const response = await taskAPI.update(id, formData);
            return response.task;
        } finally {
            loading.value = false;
        }
    };


    const deleteTask = async (id) => {
        loading.value = true;
        try {
            await taskAPI.delete(id);
            const index = tasks.value.findIndex(t => t._id === id);
            if (index !== - 1) {
                tasks.value[index].isDeleted = true;
                task.value[index].deletedAt = new Date();
            }
            ElMessage.success('Xóa task thành công!');
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const toggleTaskStatus = async (task) => {
        const statusMap = {
            'pending': 'in-progress',
            'in-progress': 'done',
            'done': 'pending'
        }
        const newStatus = statusMap[task.status] || 'pending';
        await updateTask(task._id, { ...task, status: newStatus });
    };

    const shareTask = async (id, taskData) => {
        loading.value = true;
        try {
            const response = await taskAPI.share(id, taskData);
            const index = tasks.value.findIndex(t => t._id === id);
            if (index !== -1) {
                tasks.value[index] = response.task;
            }
            ElMessage.success('Chia sẻ task thành công');
        } catch (error) {
            console.error('Share task error: ', error)
        } finally {
            loading.value = false;
        }
    }

    const uploadAttachment = async (id, file) => {
        loading.value = true;
        try {
            const formData = new FormData();;
            formData.append('file', file);

            const response = await taskAPI.uploadAttachment(id, formData);
            ElMessage.success('Upload file thành công !')
            return response.attachment;

        } catch (error) {
            console.error('Upload file error: ', error)
        } finally {
            loading.value = false;
        }
    }

    return {
        tasks,
        loading,
        pagination,
        searchTerm,
        filterStatus,
        sortBy,
        pendingTasks,
        completedTasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        shareTask,
        uploadAttachment
    };
});