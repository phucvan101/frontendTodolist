import { defineStore } from "pinia";
import { ref } from 'vue';
import { commentAPI } from "../services/api";


export const useCommentStore = defineStore('comment', () => {
    const comments = ref([]);
    const loading = ref(false);

    const fetchComments = async (taskId) => {
        loading.value = true;
        try {
            const response = await commentAPI.getAll(taskId);
            comments.value = response.comments;
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    }

    const createComment = async (taskId, commentData) => {
        loading.value = true;
        try {
            const response = await commentAPI.create(taskId, commentData);
            comments.value.push(response.comment);
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    }

    const updateComment = async (commentId, commentData) => {
        loading.value = true;
        try {
            const response = await commentAPI.update(commentId, commentData);
            const index = comments.value.findIndex(c => c._id === commentId);
            if (index !== -1) {
                comments.value[index] = response.comment;
            }
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    }


    return {
        comments,
        loading,
        fetchComments,
        createComment,
        updateComment,
    }
})