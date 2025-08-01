<template>
  <div class="app-container">
    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="1" finish-status="success" align-center>
        <el-step title="填写课程基本信息" />
        <el-step title="创建课程大纲" />
        <el-step title="发布课程" />
      </el-steps>
    </div>

    <!-- 表单容器 -->
    <div class="form-container">
      <div class="form-header">
        <h3>
          <i class="el-icon-video-camera" />
          {{ isEdit ? '编辑课程信息' : '添加课程信息' }}
        </h3>
      </div>

      <el-form
        ref="courseForm"
        :model="courseInfo"
        :rules="rules"
        label-width="120px"
        class="course-form">

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="课程标题" prop="title">
              <el-input
                v-model="courseInfo.title"
                placeholder="请输入课程标题"
                prefix-icon="el-icon-edit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程讲师" prop="teacherId">
              <el-select
                v-model="courseInfo.teacherId"
                placeholder="请选择课程讲师"
                style="width: 100%"
                filterable>
                <el-option
                  v-for="teacher in teacherList"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id">
                  <span style="float: left">{{ teacher.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ teacher.career }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="课程分类" prop="subjectParentId">
              <el-cascader
                v-model="subjectNestedList"
                :options="subjectList"
                :props="subjectProps"
                placeholder="请选择课程分类"
                style="width: 100%"
                @change="subjectChanged" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总课时" prop="lessonNum">
              <el-input-number
                v-model="courseInfo.lessonNum"
                :min="0"
                placeholder="请输入总课时"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="课程价格" prop="price">
              <el-input-number
                v-model="courseInfo.price"
                :min="0"
                :precision="2"
                placeholder="请输入课程价格"
                style="width: 100%">
                <template slot="prepend">￥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程排序" prop="sort">
              <el-input-number
                v-model="courseInfo.sort"
                :min="0"
                placeholder="请输入课程排序"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程封面" prop="cover">
          <el-upload
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            :on-error="handleCoverError"
            :action="BASE_API + '/eduoss/fileoss'"
            class="cover-uploader">
            <img v-if="courseInfo.cover" :src="courseInfo.cover" class="cover-image">
            <i v-else class="el-icon-plus cover-uploader-icon" />
            <div class="cover-uploader-text">
              {{ courseInfo.cover ? '更换封面' : '上传封面' }}
            </div>
          </el-upload>
          <div class="upload-tip">
            只能上传jpg/png文件，且不超过2MB，建议尺寸：16:9
          </div>
        </el-form-item>

        <el-form-item label="课程简介" prop="description">
          <div style="margin-bottom: 10px;">
            <el-button size="mini" type="primary" @click="switchEditor">
              {{ useRichText ? '切换到普通文本' : '切换到富文本' }}
            </el-button>
            <el-button size="mini" type="warning" @click="clearDescription">清空简介</el-button>
          </div>

          <!-- 简单富文本编辑器 -->
          <div v-if="useRichText" class="simple-rich-editor">
            <!-- 工具栏 -->
            <div class="editor-toolbar">
              <button type="button" @click="execCommand('bold')" :class="{ active: isCommandActive('bold') }" title="粗体">
                <i class="el-icon-bold"></i>
              </button>
              <button type="button" @click="execCommand('italic')" :class="{ active: isCommandActive('italic') }" title="斜体">
                <i class="el-icon-italic"></i>
              </button>
              <button type="button" @click="execCommand('underline')" :class="{ active: isCommandActive('underline') }" title="下划线">
                <i class="el-icon-underline"></i>
              </button>

              <span class="separator">|</span>

              <button type="button" @click="execCommand('formatBlock', 'h1')" title="标题1">H1</button>
              <button type="button" @click="execCommand('formatBlock', 'h2')" title="标题2">H2</button>
              <button type="button" @click="execCommand('formatBlock', 'p')" title="段落">P</button>

              <span class="separator">|</span>

              <button type="button" @click="execCommand('insertUnorderedList')" :class="{ active: isCommandActive('insertUnorderedList') }" title="无序列表">
                <i class="el-icon-menu"></i>
              </button>
              <button type="button" @click="execCommand('insertOrderedList')" :class="{ active: isCommandActive('insertOrderedList') }" title="有序列表">
                <i class="el-icon-s-order"></i>
              </button>

              <span class="separator">|</span>

              <button type="button" @click="execCommand('justifyLeft')" title="左对齐">
                <i class="el-icon-align-left"></i>
              </button>
              <button type="button" @click="execCommand('justifyCenter')" title="居中">
                <i class="el-icon-align-center"></i>
              </button>
              <button type="button" @click="execCommand('justifyRight')" title="右对齐">
                <i class="el-icon-align-right"></i>
              </button>

              <span class="separator">|</span>

              <button type="button" @click="clearFormat" title="清除格式">
                <i class="el-icon-refresh"></i>
              </button>
            </div>

            <!-- 编辑区域 -->
            <div
              ref="richEditor"
              class="editor-content"
              contenteditable="true"
              @input="onRichInput"
              @focus="onRichFocus"
              @blur="onRichBlur"
              @keydown="onKeyDown"
              v-html="courseInfo.description">
            </div>
          </div>

          <!-- 普通文本框 -->
          <el-input
            v-else
            v-model="courseInfo.description"
            :rows="8"
            type="textarea"
            placeholder="请输入课程简介" />
        </el-form-item>

        <div class="form-actions">
          <el-button
            :loading="saveBtnDisabled"
            type="primary"
            size="large"
            icon="el-icon-check"
            @click="saveOrUpdate">
            {{ isEdit ? '更新课程' : '保存并下一步' }}
          </el-button>
          <el-button
            size="large"
            icon="el-icon-refresh-left"
            @click="resetForm">
            重置
          </el-button>
          <el-button
            size="large"
            icon="el-icon-back"
            @click="goBack">
            返回列表
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import course from '@/api/edu/course'
import subject from '@/api/edu/subject'

// 富文本编辑器暂时移除，避免兼容性问题
// import Editor from '@tinymce/tinymce-vue'

const defaultForm = {
  title: '',
  subjectId: '',
  subjectParentId: '',
  teacherId: '',
  lessonNum: 0,
  description: '',
  cover: '',
  price: 0,
  sort: 0
}

export default {
  components: {
    // Editor  // 暂时注释掉，避免加载问题
  },
  data() {
    return {
      courseInfo: Object.assign({}, defaultForm),
      saveBtnDisabled: false,
      teacherList: [],
      subjectList: [],
      subjectNestedList: [],
      isEdit: false,
      BASE_API: process.env.BASE_API,
      subjectProps: {
        value: 'id',
        label: 'title',
        children: 'children'
      },
      useRichText: false, // 默认使用普通文本框


      rules: {
        title: [
          { required: true, message: '请输入课程标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        teacherId: [
          { required: true, message: '请选择课程讲师', trigger: 'change' }
        ],
        subjectParentId: [
          { required: true, message: '请选择课程分类', trigger: 'change' }
        ],
        lessonNum: [
          { required: true, message: '请输入总课时', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入课程价格', trigger: 'blur' }
        ],
        cover: [
          { required: true, message: '请上传课程封面', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入课程简介', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取讲师列表
    this.getTeacherList()
    // 获取课程分类列表
    this.getSubjectList()
    
    // 判断是否为编辑模式
    if (this.$route.params && this.$route.params.id) {
      this.isEdit = true
      this.getCourseInfo(this.$route.params.id)
    }
  },
  methods: {
    getTeacherList() {
      course.getAllTeacher()
        .then(response => {
          this.teacherList = response.data.items
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取讲师列表失败')
        })
    },
    getSubjectList() {
      subject.getSubjectList()
        .then(response => {
          this.subjectList = response.data.list
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程分类失败')
        })
    },
    getCourseInfo(id) {
      course.getCourseInfoById(id)
        .then(response => {
          this.courseInfo = response.data.courseInfoVo
          // 设置分类级联选择器的值
          if (this.courseInfo.subjectParentId && this.courseInfo.subjectId) {
            this.subjectNestedList = [this.courseInfo.subjectParentId, this.courseInfo.subjectId]
          }
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程信息失败')
        })
    },
    subjectChanged(value) {
      if (value.length === 2) {
        this.courseInfo.subjectParentId = value[0]
        this.courseInfo.subjectId = value[1]
      }
    },
    handleCoverSuccess(res, file) {
      this.courseInfo.cover = res.data.url
      this.$refs.courseForm.clearValidate('cover')
    },
    beforeCoverUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleCoverError() {
      this.$message.error('上传失败，请重试')
    },
    saveOrUpdate() {
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true
          
          const apiMethod = this.isEdit ? course.updateCourseInfo : course.addCourseInfo
          const successMessage = this.isEdit ? '课程信息修改成功' : '课程信息添加成功'
          
          apiMethod(this.courseInfo)
            .then(response => {
              this.$message.success(successMessage)
              
              if (this.isEdit) {
                this.$router.push({ path: '/course/list' })
              } else {
                // 添加成功后跳转到章节管理
                this.$router.push({ path: `/course/chapter/${response.data.courseId}` })
              }
            })
            .catch(error => {
              console.log(error)
              this.$message.error('操作失败')
            })
            .finally(() => {
              this.saveBtnDisabled = false
            })
        }
      })
    },
    resetForm() {
      this.$refs.courseForm.resetFields()
      this.courseInfo = Object.assign({}, defaultForm)
      this.subjectNestedList = []
    },
    goBack() {
      this.$router.push({ path: '/course/list' })
    },

    // 切换编辑器类型
    switchEditor() {
      this.useRichText = !this.useRichText
      this.$message.success(`已切换到${this.useRichText ? '富文本' : '普通文本'}编辑器`)

      // 切换到富文本时，确保内容同步
      if (this.useRichText) {
        this.$nextTick(() => {
          if (this.$refs.richEditor) {
            this.$refs.richEditor.innerHTML = this.courseInfo.description || ''
          }
        })
      }
    },

    // 富文本编辑器方法
    execCommand(command, value = null) {
      document.execCommand(command, false, value)
      this.$refs.richEditor.focus()
      this.updateRichContent()
    },

    isCommandActive(command) {
      return document.queryCommandState(command)
    },

    clearFormat() {
      document.execCommand('removeFormat', false, null)
      this.$refs.richEditor.focus()
      this.updateRichContent()
    },

    onRichInput() {
      this.updateRichContent()
    },

    onRichFocus() {
      // 富文本编辑器获得焦点
    },

    onRichBlur() {
      // 富文本编辑器失去焦点
      this.updateRichContent()
    },

    onKeyDown(event) {
      // 支持快捷键
      if (event.ctrlKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault()
            this.execCommand('bold')
            break
          case 'i':
            event.preventDefault()
            this.execCommand('italic')
            break
          case 'u':
            event.preventDefault()
            this.execCommand('underline')
            break
        }
      }
    },

    updateRichContent() {
      if (this.$refs.richEditor) {
        this.courseInfo.description = this.$refs.richEditor.innerHTML
      }
    },
    // 清空课程简介
    clearDescription() {
      this.$confirm('确定要清空课程简介吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.courseInfo.description = ''
        this.$message.success('课程简介已清空')
      }).catch(() => {
        // 取消操作
      })
    }
  }
}
</script>

<style scoped>
/* 步骤条样式 */
.steps-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表单容器样式 */
.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-header i {
  color: #409eff;
  font-size: 20px;
}

/* 表单样式 */
.course-form {
  padding: 32px;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-input__inner,
.el-textarea__inner {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.el-input__inner:focus,
.el-textarea__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.el-select,
.el-cascader {
  width: 100%;
}

.el-input-number {
  width: 100%;
}

/* 封面上传样式 */
.cover-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  width: 200px;
  height: 150px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.cover-image {
  width: 200px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.cover-uploader-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-uploader:hover .cover-uploader-text {
  opacity: 1;
}

.upload-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}

/* 操作按钮样式 */
.form-actions {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.form-actions .el-button {
  min-width: 120px;
  height: 44px;
  border-radius: 22px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.form-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .cover-uploader {
    width: 100%;
    max-width: 200px;
  }
}

/* 动画效果 */
.form-container {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 步骤条自定义样式 */
.steps-container .el-steps {
  margin: 0;
}

.steps-container .el-step__title {
  font-size: 16px;
  font-weight: 500;
}

/* 简单富文本编辑器样式 */
.simple-rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  background: #fafafa;
  border-bottom: 1px solid #dcdfe6;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.editor-toolbar button {
  background: none;
  border: none;
  padding: 6px 8px;
  border-radius: 3px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-toolbar button:hover {
  background: #e6f7ff;
  color: #409eff;
}

.editor-toolbar button.active {
  background: #409eff;
  color: white;
}

.editor-toolbar .separator {
  color: #dcdfe6;
  margin: 0 4px;
  font-size: 16px;
}

.editor-content {
  min-height: 200px;
  max-height: 400px;
  padding: 12px 15px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.editor-content:empty:before {
  content: '请输入课程简介，支持富文本格式...';
  color: #c0c4cc;
  font-style: normal;
}

.editor-content h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0 8px 0;
  color: #303133;
}

.editor-content h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 14px 0 6px 0;
  color: #303133;
}

.editor-content p {
  margin: 8px 0;
}

.editor-content ul, .editor-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-content li {
  margin: 4px 0;
}

.editor-content strong {
  font-weight: bold;
}

.editor-content em {
  font-style: italic;
}

.editor-content u {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tox-tinymce {
    font-size: 12px;
  }

  .tox-toolbar {
    padding: 4px;
  }
}
</style>
