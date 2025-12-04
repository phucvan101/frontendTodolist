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
    const sortBy = ref('createdAt');

    // Computed
    const pendingTasks = computed(() =>
        tasks.value.filter(t => t.status === 'pending')
    );

    const completedTasks = computed(() =>
        tasks.value.filter(t => t.status === 'done')
    );

    // Actions
    const fetchTasks = async (page = 1) => {
        loading.value = true;
        try {
            const params = {
                page,
                limit: 10,
                status: filterStatus.value,
                search: searchTerm.value,
                sortBy: sortBy.value
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

    const createTask = async (taskData) => {
        loading.value = true;
        try {
            const response = await taskAPI.create(taskData);
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

    const updateTask = async (id, taskData) => {
        loading.value = true;
        try {
            const response = await taskAPI.update(id, taskData);
            const index = tasks.value.findIndex(t => t._id === id);
            if (index !== -1) {
                tasks.value[index] = response.task;
            }
            ElMessage.success('Cập nhật task thành công!');
            return response.task;
        } catch (error) {
            console.error('Update task error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const deleteTask = async (id) => {
        loading.value = true;
        try {
            await taskAPI.delete(id);
            tasks.value = tasks.value.filter(t => t._id !== id);
            ElMessage.success('Xóa task thành công!');
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const toggleTaskStatus = async (task) => {
        const newStatus = task.status === 'pending' ? 'done' : 'pending';
        await updateTask(task._id, { ...task, status: newStatus });
    };

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
        toggleTaskStatus
    };
});