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

    return {
        categories,
        loading,
        fetchCategories
    }
})