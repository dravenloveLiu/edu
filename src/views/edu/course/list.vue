<template>
  <div class="app-container">
    <!-- 操作工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-left">
        <el-button
          type="primary"
          size="medium"
          icon="el-icon-plus"
          @click="addCourse">
          添加课程
        </el-button>
        <el-button
          size="medium"
          icon="el-icon-refresh"
          @click="resetSearch">
          重置
        </el-button>
      </div>
    </div>

    <!-- 统计信息卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card stat-card-1">
            <i class="el-icon-video-camera" />
            <span class="stat-label">总课程</span>
            <span class="stat-value">{{ total }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card-2">
            <i class="el-icon-check" />
            <span class="stat-label">已发布</span>
            <span class="stat-value">{{ publishedCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card-3">
            <i class="el-icon-edit-outline" />
            <span class="stat-label">草稿</span>
            <span class="stat-value">{{ draftCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-card-4">
            <i class="el-icon-time" />
            <span class="stat-label">最后更新</span>
            <span class="stat-value">{{ lastUpdateTime }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索表单 -->
    <div class="search-container">
      <el-form :inline="true" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model="courseQuery.title"
            placeholder="请输入课程名称"
            prefix-icon="el-icon-search"
            clearable />
        </el-form-item>
        <el-form-item label="讲师">
          <el-select
            v-model="courseQuery.teacherId"
            placeholder="请选择讲师"
            clearable
            filterable>
            <el-option
              v-for="teacher in teacherList"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="courseQuery.status"
            placeholder="请选择状态"
            clearable>
            <el-option label="已发布" value="Normal" />
            <el-option label="草稿" value="Draft" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getCourseList">
            搜索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 课程列表 -->
    <div class="table-container">
      <el-table
        :data="courseList"
        border
        stripe
        style="width: 100%"
        v-loading="listLoading">
        <el-table-column
          type="index"
          label="序号"
          width="60"
          align="center">
        </el-table-column>
        <el-table-column
          prop="title"
          label="课程名称"
          width="200">
          <template slot-scope="scope">
            <div class="course-title">
              <i class="el-icon-video-camera"></i>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="cover"
          label="课程封面"
          width="120"
          align="center">
          <template slot-scope="scope">
            <img
              v-if="scope.row.cover"
              :src="scope.row.cover"
              class="course-cover"
              @click="previewImage(scope.row.cover)">
            <span v-else class="no-cover">暂无封面</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="teacherName"
          label="讲师"
          width="100">
        </el-table-column>
        <el-table-column
          prop="subjectParentTitle"
          label="一级分类"
          width="120">
        </el-table-column>
        <el-table-column
          prop="subjectTitle"
          label="二级分类"
          width="120">
        </el-table-column>
        <el-table-column
          prop="lessonNum"
          label="课时数"
          width="80"
          align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="mini">{{ scope.row.lessonNum }}课时</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="100"
          align="center">
          <template slot-scope="scope">
            <span class="course-price">￥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === 'Normal' ? 'success' : 'warning'"
              size="mini">
              {{ scope.row.status === 'Normal' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="gmtCreate"
          label="创建时间"
          width="160">
          <template slot-scope="scope">
            {{ scope.row.gmtCreate | formatDate }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          align="center"
          fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click="editCourse(scope.row.id)">
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-video-camera"
              @click="editChapter(scope.row.id)">
              章节
            </el-button>
            <el-button
              v-if="scope.row.status === 'Draft'"
              type="text"
              size="mini"
              icon="el-icon-upload"
              @click="publishCourse(scope.row.id)">
              发布
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              class="delete-btn"
              @click="deleteCourse(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="page"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="课程封面预览"
      :visible.sync="imagePreviewVisible"
      width="50%"
      center>
      <div class="image-preview">
        <img :src="previewImageUrl" style="width: 100%" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import course from '@/api/edu/course'
import teacher from '@/api/edu/teacher'

export default {
  data() {
    return {
      courseList: [],
      teacherList: [],
      total: 0,
      page: 1,
      limit: 10,
      listLoading: false,
      publishedCount: 0,
      draftCount: 0,
      lastUpdateTime: '刚刚',
      imagePreviewVisible: false,
      previewImageUrl: '',
      courseQuery: {
        title: '',
        teacherId: '',
        status: ''
      }
    }
  },
  created() {
    this.getCourseList()
    this.getTeacherList()
  },
  methods: {
    getCourseList() {
      this.listLoading = true
      course.getCourseList(this.page, this.limit, this.courseQuery)
        .then(response => {
          this.courseList = response.data.items
          this.total = response.data.total
          this.calculateStats()
          this.updateLastTime()
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程列表失败')
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    getTeacherList() {
      course.getAllTeacher()
        .then(response => {
          this.teacherList = response.data.list
        })
        .catch(error => {
          console.log(error)
        })
    },
    calculateStats() {
      this.publishedCount = this.courseList.filter(course => course.status === 'Normal').length
      this.draftCount = this.courseList.filter(course => course.status === 'Draft').length
    },
    updateLastTime() {
      this.lastUpdateTime = new Date().toLocaleTimeString()
    },
    handleSizeChange(newSize) {
      this.limit = newSize
      this.getCourseList()
    },
    handleCurrentChange(newPage) {
      this.page = newPage
      this.getCourseList()
    },
    resetSearch() {
      this.courseQuery = {
        title: '',
        teacherId: '',
        status: ''
      }
      this.page = 1
      this.getCourseList()
    },
    addCourse() {
      this.$router.push({ path: '/course/info' })
    },
    editCourse(id) {
      this.$router.push({ path: `/course/info/${id}` })
    },
    editChapter(id) {
      this.$router.push({ path: `/course/chapter/${id}` })
    },
    publishCourse(id) {
      this.$confirm('确定要发布这门课程吗？发布后学员就可以看到该课程', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        course.publishCourse(id)
          .then(response => {
            this.$message.success('课程发布成功')
            this.getCourseList()
          })
          .catch(error => {
            console.log(error)
            this.$message.error('课程发布失败')
          })
      })
    },
    deleteCourse(id) {
      this.$confirm('此操作将永久删除该课程，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        course.deleteCourse(id)
          .then(response => {
            this.$message.success('删除成功')
            this.getCourseList()
          })
          .catch(error => {
            console.log(error)
            this.$message.error('删除失败')
          })
      })
    },
    previewImage(url) {
      this.previewImageUrl = url
      this.imagePreviewVisible = true
    }
  },
  filters: {
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      return date.toLocaleString()
    }
  }
}
</script>

<style scoped>
/* 工具栏样式 */
.toolbar-container {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

/* 统计卡片样式 */
.stats-container {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card i {
  font-size: 32px;
  margin-bottom: 12px;
}

.stat-card-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-card-4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-label {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

/* 搜索表单样式 */
.search-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-form .el-form-item {
  margin-bottom: 0;
}

/* 表格容器样式 */
.table-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 课程标题样式 */
.course-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-title i {
  color: #409eff;
}

/* 课程封面样式 */
.course-cover {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-cover:hover {
  transform: scale(1.1);
}

.no-cover {
  color: #999;
  font-size: 12px;
}

/* 课程价格样式 */
.course-price {
  color: #f56c6c;
  font-weight: 600;
}

/* 删除按钮样式 */
.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  background-color: #fef0f0 !important;
}

/* 分页样式 */
.pagination-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

/* 图片预览样式 */
.image-preview {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar-container {
    flex-direction: column;
    gap: 16px;
  }

  .search-form {
    display: block;
  }

  .search-form .el-form-item {
    display: block;
    margin-bottom: 16px;
  }
}

/* 动画效果 */
.table-container {
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
</style>
