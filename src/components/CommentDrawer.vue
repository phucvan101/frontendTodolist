<template>
    <el-drawer v-model="drawerVisible" title="Comments" direction="rtl" size="500px" @close="handleClose">
        <div class="flex flex-col h-full">
            <!-- Task Info -->
            <div class="px-4 pb-4 border-b">
                <h3 class="font-semibold text-lg mb-2">{{ task?.title }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <el-icon>
                        <ChatDotRound />
                    </el-icon>
                    <span>{{ commentStore.comments.length }} comments</span>
                </div>
            </div>

            <!-- Comments List -->
            <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <el-skeleton v-if="commentStore.loading" :rows="3" animated />

                <el-empty v-else-if="commentStore.comments.length === 0" description="Chưa có comment nào"
                    :image-size="120" />

                <div v-for="comment in commentStore.comments" :key="comment._id" class="bg-gray-50 rounded-lg p-3">
                    <div class="flex items-start gap-3">
                        <el-avatar :size="36" :icon="UserFilled" />

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-sm">{{ comment.userId?.name }}</span>
                                <span class="text-xs text-gray-500">
                                    {{ dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm') }}
                                </span>
                                <el-tag v-if="comment.isEdited" type="info" size="small" effect="plain">
                                    Đã chỉnh sửa
                                </el-tag>
                            </div>

                            <div v-if="editingCommentId !== comment._id">
                                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
                            </div>

                            <div v-else>
                                <el-input v-model="editContent" type="textarea" :rows="3"
                                    placeholder="Nhập comment..." />
                                <div class="flex gap-2 mt-2">
                                    <el-button type="primary" size="small" @click="handleUpdateComment(comment._id)">
                                        Lưu
                                    </el-button>
                                    <el-button size="small" @click="cancelEdit">
                                        Hủy
                                    </el-button>
                                </div>
                            </div>

                            <div v-if="editingCommentId !== comment._id && isMyComment(comment)"
                                class="flex gap-2 mt-2">
                                <el-button type="primary" :icon="Edit" size="small" link @click="startEdit(comment)">
                                    Sửa
                                </el-button>
                                <el-button type="danger" :icon="Delete" size="small" link
                                    @click="handleDeleteComment(comment._id)">
                                    Xóa
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Comment Form -->
            <div class="border-t px-4 py-4">
                <el-input v-model="newComment" type="textarea" :rows="3" placeholder="Viết comment của bạn..."
                    @keyup.ctrl.enter="handleAddComment" />
                <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">Ctrl + Enter để gửi</span>
                    <el-button type="primary" :icon="Promotion" @click="handleAddComment"
                        :loading="commentStore.loading" :disabled="!newComment.trim()">
                        Gửi
                    </el-button>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ChatDotRound, UserFilled, Edit, Delete, Promotion } from '@element-plus/icons-vue';
import { useCommentStore } from '@/stores/commentStore';
import { useAuthStore } from '@/stores/authStore';
import { ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

const commentStore = useCommentStore();
const authStore = useAuthStore();

const props = defineProps({
    visible: Boolean,
    task: Object
});

const emit = defineEmits(['update:visible']);

const drawerVisible = ref(props.visible);
const newComment = ref('');
const editingCommentId = ref(null);
const editContent = ref('');

watch(() => props.visible, (val) => {
    drawerVisible.value = val;
    if (val && props.task) {
        commentStore.fetchComments(props.task._id);
    }
});

const isMyComment = (comment) => {
    return comment.userId?._id === authStore.user?.id;
};

const handleAddComment = async () => {
    if (!newComment.value.trim()) return;

    try {
        await commentStore.createComment(props.task._id, { content: newComment.value });
        newComment.value = '';
    } catch (error) {
        console.error('Add comment error:', error);
    }
};

const startEdit = (comment) => {
    editingCommentId.value = comment._id;
    editContent.value = comment.content;
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editContent.value = '';
};

const handleUpdateComment = async (id) => {
    if (!editContent.value.trim()) return;

    try {
        await commentStore.updateComment(id, { content: editContent.value });
        cancelEdit();
    } catch (error) {
        console.error('Update comment error:', error);
    }
};

const handleDeleteComment = async (id) => {
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc muốn xóa comment này?',
            'Xác nhận xóa',
            {
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                type: 'warning'
            }
        );

        await commentStore.deleteComment(id);
    } catch (error) {
        // User cancelled
    }
};

const handleClose = () => {
    drawerVisible.value = false;
    emit('update:visible', false);
    newComment.value = '';
    cancelEdit();
};
</script>