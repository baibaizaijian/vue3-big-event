<script setup>
import ChannelSelect from './ChannelSelect.vue'
import { ref, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import {
  artPublishService,
  artGetDetailService,
  artEditService
} from '@/api/article.js' //富文本编辑器
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from 'axios'
import { baseURL } from '@/utils/request.js'
const emit = defineEmits(['success'])
const visibleDrawer = ref(false)
const editorRef = ref()
const imageUrl = ref('')
//表单数据
const defaultForm = {
  title: '',
  cate_id: '',
  cover_img: '',
  content: '',
  state: ''
}

const formModel = ref({
  title: '',
  cate_id: '',
  cover_img: '',
  content: '',
  state: ''
})

const open = async (row) => {
  visibleDrawer.value = true
  if (row.id) {
    console.log('编辑回显')
    const res = await artGetDetailService(row.id)
    formModel.value = res.data.data
    imageUrl.value = baseURL + formModel.value.cover_img
    // 提交给后台，需要的是 file 格式的，将网络图片，转成 file 格式
    // 网络图片转成 file 对象, 需要转换一下
    formModel.value.cover_img = await imageUrlToFile(
      imageUrl.value,
      formModel.value.cover_img
    )
  } else {
    formModel.value = { ...defaultForm } //这里如果加ref要展开加value
    imageUrl.value = ''
    //setup执行是Dom还没有实现,所以会报错
    nextTick(() => {
      // 在 DOM 更新之后执行这个回调函数
      editorRef.value.setHTML('')
    })
  }
  // 将网络图片地址转换为File对象
  async function imageUrlToFile(url, fileName) {
    try {
      // 第一步：使用axios获取网络图片数据
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      const imageData = response.data

      // 第二步：将图片数据转换为Blob对象
      const blob = new Blob([imageData], {
        type: response.headers['content-type']
      })

      // 第三步：创建一个新的File对象
      const file = new File([blob], fileName, { type: blob.type })

      return file
    } catch (error) {
      console.error('将图片转换为File对象时发生错误:', error)
      throw error
    }
  }
}
const onUploadFile = (uploadFile) => {
  console.log(uploadFile) //当前上传对象
  imageUrl.value = URL.createObjectURL(uploadFile.raw) //实现预览
  formModel.value.cover_img = uploadFile.raw
}
const onPublish = async (state) => {
  // 将已发布还是草稿状态，存入 state
  formModel.value.state = state

  // 普通对象 转换 formData 数据
  const fd = new FormData()
  //遍历对象,添加到formDate格式
  for (let key in formModel.value) {
    fd.append(key, formModel.value[key])
  }

  if (formModel.value.id) {
    await artEditService(fd)
    ElMessage.success('编辑成功')
    visibleDrawer.value = false
    emit('success', 'edit')
  } else {
    // 添加请求
    await artPublishService(fd)
    ElMessage.success('添加成功')
    visibleDrawer.value = false
    emit('success', 'add')
  }
}
defineExpose({
  open
})
</script>

<template>
  <!-- 抽屉 -->
  <el-drawer v-model="visibleDrawer" title="大标题" direction="rtl" size="50%">
    <el-form :model="formModel" ref="formRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <channel-select
          v-model="formModel.cate_id"
          width="100%"
        ></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <!-- 需要关闭自动上传 -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="onUploadFile"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <quill-editor
            theme="snow"
            v-model:content="formModel.content"
            contentType="html"
            ref="editorRef"
          >
          </quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onPublish('已发布')">发布</el-button>
        <el-button type="info" @click="onPublish('草稿')">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style lang="scss" scoped>
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }
    .el-upload:hover {
      border-color: var(--el-color-primary);
    }
    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}
.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
