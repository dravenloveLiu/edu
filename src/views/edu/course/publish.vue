<template>
  <div class="app-container">
    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="3" finish-status="success" align-center>
        <el-step title="填写课程基本信息" />
        <el-step title="创建课程大纲" />
        <el-step title="发布课程" />
      </el-steps>
    </div>

    <!-- 课程发布信息 -->
    <div class="publish-container">
      <div class="publish-header">
        <h3>
          <i class="el-icon-upload" />
          课程发布确认
        </h3>
        <p>请确认课程信息无误后发布课程</p>
      </div>

      <div class="course-preview">
        <div class="course-cover-section">
          <div class="cover-wrapper">
            <img v-if="coursePublishInfo.cover" :src="coursePublishInfo.cover" class="course-cover" />
            <div v-else class="no-cover">
              <i class="el-icon-picture-outline" />
              <span>暂无封面</span>
            </div>
          </div>
        </div>

        <div class="course-info-section">
          <div class="course-title">
            {{ coursePublishInfo.title }}
          </div>
          
          <div class="course-meta">
            <div class="meta-item">
              <span class="meta-label">课程分类：</span>
              <span class="meta-value">{{ coursePublishInfo.subjectParentTitle }} / {{ coursePublishInfo.subjectTitle }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">课程讲师：</span>
              <span class="meta-value">{{ coursePublishInfo.teacherName }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">总课时数：</span>
              <span class="meta-value">{{ coursePublishInfo.lessonNum }} 课时</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">课程价格：</span>
              <span class="meta-value price">￥{{ coursePublishInfo.price }}</span>
            </div>
          </div>

          <div class="course-description">
            <div class="description-title">课程简介</div>
            <div class="description-content" v-html="coursePublishInfo.description"></div>
          </div>
        </div>
      </div>

      <div class="chapter-summary">
        <div class="summary-header">
          <h4>
            <i class="el-icon-menu" />
            课程大纲概览
          </h4>
          <div class="summary-stats">
            <span>{{ chapterCount }} 个章节</span>
            <span>{{ videoCount }} 个课时</span>
          </div>
        </div>

        <div class="chapter-list">
          <div
            v-for="(chapter, index) in chapterList"
            :key="chapter.id"
            class="chapter-summary-item">
            <div class="chapter-info">
              <span class="chapter-number">第{{ index + 1 }}章</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="video-count">{{ chapter.children ? chapter.children.length : 0 }}个课时</span>
            </div>
          </div>
        </div>
      </div>

      <div class="publish-actions">
        <el-button
          size="large"
          icon="el-icon-back"
          @click="previous">
          上一步
        </el-button>
        <el-button
          :loading="publishLoading"
          type="success"
          size="large"
          icon="el-icon-upload"
          @click="publishCourse">
          发布课程
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import course from '@/api/edu/course'
import chapter from '@/api/edu/chapter'

export default {
  data() {
    return {
      courseId: '',
      coursePublishInfo: {},
      chapterList: [],
      publishLoading: false
    }
  },
  computed: {
    chapterCount() {
      return this.chapterList.length
    },
    videoCount() {
      let total = 0
      this.chapterList.forEach(chapter => {
        if (chapter.children) {
          total += chapter.children.length
        }
      })
      return total
    }
  },
  created() {
    if (this.$route.params && this.$route.params.id) {
      this.courseId = this.$route.params.id
      this.getCoursePublishInfo()
      this.getChapterList()
    }
  },
  methods: {
    getCoursePublishInfo() {
      course.getCoursePublishInfo(this.courseId)
        .then(response => {
          this.coursePublishInfo = response.data.coursePublishInfo
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程信息失败')
        })
    },
    getChapterList() {
      chapter.getChapterList(this.courseId)
        .then(response => {
          this.chapterList = response.data.list
        })
        .catch(error => {
          console.log(error)
        })
    },
    publishCourse() {
      this.$confirm('确定要发布这门课程吗？发布后学员就可以看到该课程', '发布确认', {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.publishLoading = true
        course.publishCourse(this.courseId)
          .then(response => {
            this.$message({
              type: 'success',
              message: '课程发布成功！',
              duration: 3000
            })
            this.$router.push({ path: '/course/list' })
          })
          .catch(error => {
            console.log(error)
            this.$message.error('课程发布失败')
          })
          .finally(() => {
            this.publishLoading = false
          })
      })
    },
    previous() {
      this.$router.push({ path: `/course/chapter/${this.courseId}` })
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

/* 发布容器样式 */
.publish-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.publish-header {
  background: #f8f9fa;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

.publish-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.publish-header i {
  color: #67c23a;
  font-size: 24px;
}

.publish-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 课程预览样式 */
.course-preview {
  padding: 32px;
  display: flex;
  gap: 32px;
}

.course-cover-section {
  flex-shrink: 0;
}

.cover-wrapper {
  width: 300px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.no-cover i {
  font-size: 48px;
  margin-bottom: 8px;
}

.course-info-section {
  flex: 1;
}

.course-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  line-height: 1.3;
}

.course-meta {
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.meta-label {
  font-weight: 500;
  color: #666;
  width: 100px;
  flex-shrink: 0;
}

.meta-value {
  color: #2c3e50;
}

.meta-value.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.course-description {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.description-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.description-content {
  color: #666;
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
}

/* 章节概览样式 */
.chapter-summary {
  border-top: 1px solid #e9ecef;
  padding: 32px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-header i {
  color: #409eff;
  font-size: 20px;
}

.summary-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.chapter-summary-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #409eff;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-number {
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.chapter-title {
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
}

.video-count {
  color: #666;
  font-size: 12px;
  flex-shrink: 0;
}

/* 发布操作样式 */
.publish-actions {
  border-top: 1px solid #e9ecef;
  padding: 24px 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.publish-actions .el-button {
  min-width: 120px;
  height: 44px;
  border-radius: 22px;
  font-weight: 500;
}

.publish-actions .el-button--success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-preview {
    flex-direction: column;
    padding: 20px;
  }
  
  .cover-wrapper {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .chapter-list {
    grid-template-columns: 1fr;
  }
  
  .chapter-summary {
    padding: 20px;
  }
  
  .publish-actions {
    flex-direction: column;
    padding: 20px;
  }
  
  .publish-actions .el-button {
    width: 100%;
  }
}

/* 动画效果 */
.publish-container {
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
