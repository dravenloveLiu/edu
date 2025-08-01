<template>
  <div class="app-container">
    <!-- 表单容器 -->
    <div class="form-container">
      <div class="form-header">
        <h3>
          <i class="el-icon-edit" />
          {{ isEdit ? '编辑分类' : '添加分类' }}
        </h3>
      </div>

      <el-form
        ref="subjectForm"
        :model="subject"
        :rules="rules"
        label-width="120px"
        class="subject-form">

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="分类级别" prop="level">
              <el-radio-group v-model="subject.level" class="level-radio" @change="levelChange">
                <el-radio :label="1" class="radio-item">
                  <div class="radio-content">
                    <i class="el-icon-folder" />
                    <span>一级分类</span>
                  </div>
                </el-radio>
                <el-radio :label="2" class="radio-item">
                  <div class="radio-content">
                    <i class="el-icon-document" />
                    <span>二级分类</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col v-if="subject.level === 2" :span="12">
            <el-form-item label="上级分类" prop="parentId">
              <el-select
                v-model="subject.parentId"
                placeholder="请选择上级分类"
                style="width: 100%"
                filterable>
                <el-option
                  v-for="item in oneSubjectList"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id">
                  <span style="float: left">{{ item.title }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">一级分类</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="16">
            <el-form-item label="分类名称" prop="title">
              <el-input
                v-model="subject.title"
                placeholder="请输入分类名称"
                prefix-icon="el-icon-edit" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="subject.sort"
                :min="0"
                placeholder="请输入排序"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="分类描述">
          <el-input
            v-model="subject.description"
            :rows="3"
            type="textarea"
            placeholder="请输入分类描述（可选）" />
        </el-form-item>

        <div class="form-actions">
          <el-button
            :loading="saveBtnDisabled"
            type="primary"
            size="large"
            icon="el-icon-check"
            @click="saveSubject">
            {{ isEdit ? '更新分类' : '保存分类' }}
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
            @click="$router.push('/subject/list')">
            返回列表
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import subject from '@/api/edu/subject'

export default {
  data() {
    return {
      subject: {
        id: '',
        title: '',
        parentId: '0',
        level: 1,
        sort: 0,
        description: ''
      },
      oneSubjectList: [],
      saveBtnDisabled: false,
      isEdit: false,
      rules: {
        level: [
          { required: true, message: '请选择分类级别', trigger: 'change' }
        ],
        parentId: [
          { required: true, message: '请选择上级分类', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入排序', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取一级分类列表
    this.getOneSubjectList()

    // 判断是否为编辑模式
    if (this.$route.params && this.$route.params.id) {
      this.isEdit = true
      this.getSubjectInfo(this.$route.params.id)
    }
  },
  methods: {
    getOneSubjectList() {
      subject.getOneSubjectList()
        .then(response => {
          this.oneSubjectList = response.data.list
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取一级分类失败')
        })
    },
    getSubjectInfo(id) {
      subject.getSubjectInfo(id)
        .then(response => {
          this.subject = response.data.subject
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取分类信息失败')
        })
    },
    levelChange(value) {
      if (value === 1) {
        this.subject.parentId = '0'
      } else {
        this.subject.parentId = ''
      }
    },
    saveSubject() {
      this.$refs.subjectForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true

          // 根据是否为编辑模式调用不同的API
          const apiMethod = this.isEdit ? subject.updateSubject : subject.addSubject
          const successMessage = this.isEdit ? '修改成功!' : '添加成功!'
          const errorMessage = this.isEdit ? '修改失败' : '添加失败'

          apiMethod(this.subject)
            .then(response => {
              this.$message({
                type: 'success',
                message: successMessage
              })
              this.$router.push({ path: '/subject/list' })
            })
            .catch(error => {
              console.log(error)
              this.$message.error(errorMessage)
            })
            .finally(() => {
              this.saveBtnDisabled = false
            })
        }
      })
    },
    resetForm() {
      this.$refs.subjectForm.resetFields()
      this.subject = {
        id: '',
        title: '',
        parentId: '0',
        level: 1,
        sort: 0,
        description: ''
      }
    }
  }
}
</script>

<style scoped>
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
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表单样式 */
.subject-form {
  padding: 32px;
}

.level-radio {
  display: flex;
  gap: 24px;
}

.radio-item {
  margin-right: 0 !important;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.radio-item:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.05);
}

.radio-item.is-checked {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.radio-content i {
  font-size: 18px;
  color: #667eea;
}

/* 表单项样式优化 */
.el-form-item {
  margin-bottom: 24px;
}

.el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
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

.el-select {
  width: 100%;
}

.el-input-number {
  width: 100%;
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
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
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
  .subject-form {
    padding: 20px;
  }

  .level-radio {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .page-title {
    font-size: 24px;
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

/* 选择器选项样式 */
.el-select-dropdown__item {
  padding: 12px 20px;
}

.el-select-dropdown__item:hover {
  background-color: rgba(102, 126, 234, 0.1);
}
</style>
