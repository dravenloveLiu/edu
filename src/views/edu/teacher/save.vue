<template>
  <div class="app-container">
    <el-form ref="teacherForm" :model="teacher" :rules="rules" label-width="120px">
      <el-form-item label="讲师名称" prop="name">
        <el-input v-model="teacher.name" placeholder="请输入讲师名称" />
      </el-form-item>

      <el-form-item label="讲师排序" prop="sort">
        <el-input-number v-model="teacher.sort" :min="0" placeholder="请输入排序" />
      </el-form-item>

      <el-form-item label="讲师头衔" prop="level">
        <el-select v-model="teacher.level" clearable placeholder="请选择讲师头衔">
          <el-option :value="1" label="高级讲师" />
          <el-option :value="2" label="首席讲师" />
        </el-select>
      </el-form-item>

      <el-form-item label="讲师资历" prop="career">
        <el-input v-model="teacher.career" placeholder="请输入讲师资历" />
      </el-form-item>

      <el-form-item label="讲师简介" prop="intro">
        <el-input
          v-model="teacher.intro"
          :rows="4"
          type="textarea"
          placeholder="请输入讲师简介"
        />
      </el-form-item>

      <el-form-item label="讲师头像" prop="avatar">
        <el-upload
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :action="BASE_API + '/eduoss/fileoss'"
          class="avatar-uploader">
          <img v-if="teacher.avatar" :src="teacher.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button :loading="saveBtnDisabled" type="primary" @click="saveOrUpdate">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button @click="$router.push('/teacher/table')">返回列表</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import teacher from '@/api/edu/teacher'

export default {
  data() {
    return {
      teacher: {
        name: '',
        sort: 0,
        level: 1,
        career: '',
        intro: '',
        avatar: ''
      },
      saveBtnDisabled: false, // 保存按钮是否禁用
      BASE_API: process.env.BASE_API, // 接口API地址
      rules: {
        name: [
          { required: true, message: '请输入讲师名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入排序', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择讲师头衔', trigger: 'change' }
        ],
        career: [
          { required: true, message: '请输入讲师资历', trigger: 'blur' }
        ],
        intro: [
          { required: true, message: '请输入讲师简介', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    $route(to, from) {
      this.init()
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // 获取路由中的id值
      if (this.$route.params && this.$route.params.id) {
        const id = this.$route.params.id
        this.getInfo(id)
      } else {
        // 如果没有id，重置表单数据（用于添加讲师）
        this.teacher = {
          name: '',
          sort: 0,
          level: 1,
          career: '',
          intro: '',
          avatar: ''
        }
      }
    },
    getInfo(id) {
      teacher.getTeacherInfo(id)
        .then(response => {
          this.teacher = response.data.teacher
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取讲师信息失败')
        })
    },
    saveOrUpdate() {
      this.$refs.teacherForm.validate(valid => {
        if (valid) {
          this.saveBtnDisabled = true
          if (!this.teacher.id) {
            this.save()
          } else {
            this.update()
          }
        }
      })
    },
    save() {
      teacher.addTeacher(this.teacher)
        .then(response => {
          this.$message({
            type: 'success',
            message: '添加成功!'
          })
          this.$router.push({ path: '/teacher/table' })
        })
        .catch(error => {
          console.log(error)
          this.$message.error('添加失败')
        })
        .finally(() => {
          this.saveBtnDisabled = false
        })
    },
    update() {
      teacher.updateTeacher(this.teacher)
        .then(response => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
          this.$router.push({ path: '/teacher/table' })
        })
        .catch(error => {
          console.log(error)
          this.$message.error('修改失败')
        })
        .finally(() => {
          this.saveBtnDisabled = false
        })
    },
    resetForm() {
      this.$refs.teacherForm.resetFields()
      this.teacher = {
        name: '',
        sort: 0,
        level: 1,
        career: '',
        intro: '',
        avatar: ''
      }
    },
    handleAvatarSuccess(res, file) {
      this.teacher.avatar = res.data.url
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
