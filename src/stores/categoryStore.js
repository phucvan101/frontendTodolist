import { defineStore } from "pinia";
import { ref } from 'vue';
import { categoryAPI } from "../services/api";
import { ElMessage } from "element-plus";

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([]);
    const loading = ref(false);

    const fetchCategories = async () => {
        loading.value = true;
        try {
            const response = await categoryAPI.getAll();
            categories.value = response.categories;
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    }

    const createCategory = async (categoryData) => {
        loading.value = true;
        try {
            const response = await categoryAPI.create(categoryData);
            categories.value.push(response.category);
            ElMessage.success('Tạo danh mục thành công!');
            return response.category;
        } catch (error) {
            console.error('Create category error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const updateCategory = async (id, categoryData) => {
        loading.value = true;
        try {
            const response = await categoryAPI.update(id, categoryData);
            const index = categories.value.findIndex(cat => cat.id === id);
            if (index !== -1) {
                categories.value[index] = response.category;
                ElMessage.success('Cập nhật thành công danh mục');
            }
        } catch (error) {
            console.error('Update category error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const deleteCategory = async (id) => {
        loading.value = true;
        try {
            await categoryAPI.delete(id);
            const index = categories.value.findIndex(cat => cat.id === id);
            if (index !== -1) {
                categories.value.splice(index, 1);
                ElMessage.success('Xoá danh mục thành công');
            }
        } catch (error) {
            console.error('Delete category error:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
})