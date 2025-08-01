<template>
  <div class="app-container">
    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="2" finish-status="success" align-center>
        <el-step title="填写课程基本信息" />
        <el-step title="创建课程大纲" />
        <el-step title="发布课程" />
      </el-steps>
    </div>

    <!-- 课程信息 -->
    <div class="course-info-container">
      <div class="course-info" v-if="courseInfo">
        <div class="course-title">
          <i class="el-icon-video-camera" />
          <span>{{ courseInfo.title }}</span>
        </div>
        <div class="course-meta">
          <span>讲师：{{ courseInfo.teacherName || '未设置' }}</span>
          <span>分类：{{ courseInfo.subjectParentTitle || '未设置' }} / {{ courseInfo.subjectTitle || '未设置' }}</span>
          <span>价格：￥{{ courseInfo.price || 0 }}</span>
        </div>
      </div>
      <div v-else class="loading-info">
        <i class="el-icon-loading" />
        <span>加载课程信息中...</span>
      </div>
      <div class="course-actions">
        <el-button
          type="primary"
          size="medium"
          icon="el-icon-plus"
          @click="openChapterDialog">
          添加章节
        </el-button>
        <el-button
          size="medium"
          icon="el-icon-back"
          @click="previous">
          上一步
        </el-button>
        <el-button
          type="success"
          size="medium"
          icon="el-icon-right"
          @click="next">
          下一步
        </el-button>
      </div>
    </div>

    <!-- 章节列表 -->
    <div class="chapter-container">
      <div class="chapter-header">
        <h3>
          <i class="el-icon-menu" />
          课程大纲
        </h3>
        <div class="chapter-stats">
          <span>共 {{ chapterList ? chapterList.length : 0 }} 个章节</span>
          <span>共 {{ totalVideos }} 个课时</span>
        </div>
      </div>

      <div class="chapter-list">
        <div
          v-for="(chapter, index) in chapterList"
          :key="chapter.id"
          class="chapter-item">
          <div class="chapter-header-item">
            <div class="chapter-info">
              <span class="chapter-number">第{{ index + 1 }}章</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="chapter-sort">排序：{{ chapter.sort }}</span>
            </div>
            <div class="chapter-actions">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-plus"
                @click="openVideoDialog(chapter.id)">
                添加课时
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-edit"
                @click="openChapterDialog(chapter)">
                编辑
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                class="delete-btn"
                @click="deleteChapter(chapter.id)">
                删除
              </el-button>
            </div>
          </div>

          <!-- 课时列表 -->
          <div v-if="chapter.children && chapter.children.length > 0" class="video-list">
            <div
              v-for="video in chapter.children"
              :key="video.id"
              class="video-item">
              <div class="video-info">
                <i class="el-icon-video-play" />
                <span class="video-title">{{ video.title }}</span>
                <span class="video-duration" v-if="video.duration">{{ formatDuration(video.duration) }}</span>
                <el-tag v-if="video.isFree" type="success" size="mini">免费</el-tag>
              </div>
              <div class="video-actions">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  @click="openVideoDialog(chapter.id, video)">
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  class="delete-btn"
                  @click="deleteVideo(video.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-video">
            <i class="el-icon-warning-outline" />
            <span>暂无课时，请添加课时</span>
          </div>
        </div>

        <div v-if="chapterList && chapterList.length === 0" class="empty-chapter">
          <i class="el-icon-folder-opened" />
          <p>暂无章节</p>
          <el-button type="primary" @click="openChapterDialog">添加第一个章节</el-button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑章节对话框 -->
    <el-dialog
      :title="chapterForm.id ? '编辑章节' : '添加章节'"
      :visible.sync="chapterDialogVisible"
      width="500px">
      <el-form
        ref="chapterForm"
        :model="chapterForm"
        :rules="chapterRules"
        label-width="80px">
        <el-form-item label="章节标题" prop="title">
          <el-input
            v-model="chapterForm.title"
            placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="章节排序" prop="sort">
          <el-input-number
            v-model="chapterForm.sort"
            :min="0"
            style="width: 100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加/编辑课时对话框 -->
    <el-dialog
      :title="videoForm.id ? '编辑课时' : '添加课时'"
      :visible.sync="videoDialogVisible"
      width="600px">
      <el-form
        ref="videoForm"
        :model="videoForm"
        :rules="videoRules"
        label-width="80px">
        <el-form-item label="课时标题" prop="title">
          <el-input
            v-model="videoForm.title"
            placeholder="请输入课时标题" />
        </el-form-item>
        <el-form-item label="课时排序" prop="sort">
          <el-input-number
            v-model="videoForm.sort"
            :min="0"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch
            v-model="videoForm.isFree"
            active-text="免费"
            inactive-text="收费" />
        </el-form-item>
        <el-form-item label="上传视频" prop="videoSourceId">
          <el-upload
            ref="upload"
            :action="BASE_API + '/eduoss/fileoss'"
            :on-success="handleVideoSuccess"
            :on-error="handleVideoError"
            :on-progress="handleVideoProgress"
            :before-upload="beforeVideoUpload"
            :file-list="videoFileList"
            :limit="1"
            :on-exceed="handleVideoExceed"
            accept="video/*"
            drag>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              只能上传mp4/avi/mov等视频文件，文件大小不超过200MB<br>
              支持常见视频格式，上传后会自动处理
            </div>
          </el-upload>
          <div v-if="videoForm.videoOriginalName" class="uploaded-video-info">
            <i class="el-icon-video-camera"></i>
            <span>{{ videoForm.videoOriginalName }}</span>
            <el-button type="text" size="mini" @click="removeVideo">删除</el-button>
          </div>
          <el-progress
            v-if="uploadProgress > 0 && uploadProgress < 100"
            :percentage="uploadProgress"
            :stroke-width="8"
            :text-inside="true"
            :format="formatProgress">
          </el-progress>
        </el-form-item>
        <el-form-item label="视频时长">
          <el-input
            v-model="videoForm.duration"
            placeholder="请输入视频时长（秒）" />
        </el-form-item>
        <el-form-item label="视频简介">
          <el-input
            v-model="videoForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入视频简介" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="videoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveVideo">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import course from '@/api/edu/course'
import chapter from '@/api/edu/chapter'
import video from '@/api/edu/video'

export default {
  data() {
    return {
      courseId: '',
      courseInfo: {},
      chapterList: [],
      chapterDialogVisible: false,
      videoDialogVisible: false,
      BASE_API: process.env.BASE_API, // 接口API地址
      videoFileList: [],
      uploadProgress: 0,
      chapterForm: {
        title: '',
        sort: 0,
        courseId: ''
      },
      videoForm: {
        title: '',
        sort: 0,
        isFree: false,
        duration: '',
        description: '',
        chapterId: '',
        videoSourceId: '',
        videoOriginalName: ''
      },
      chapterRules: {
        title: [
          { required: true, message: '请输入章节标题', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入章节排序', trigger: 'blur' }
        ]
      },
      videoRules: {
        title: [
          { required: true, message: '请输入课时标题', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入课时排序', trigger: 'blur' }
        ],
        videoSourceId: [
          { required: true, message: '请上传视频文件', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    totalVideos() {
      if (!this.chapterList) return 0
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
      this.getCourseInfo()
      this.getChapterList()
    }
  },
  methods: {
    getCourseInfo() {
      course.getCourseInfoById(this.courseId)
        .then(response => {
          this.courseInfo = response.data.courseInfoVo
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程信息失败')
        })
    },
    getChapterList() {
      chapter.getChapterList(this.courseId)
        .then(response => {
          console.log('章节列表接口返回数据:', response.data)
          // 根据实际返回的数据结构调整
          this.chapterList = response.data.allChapterVideo || response.data.list || []
          console.log('设置的章节列表:', this.chapterList)
        })
        .catch(error => {
          console.log(error)
          this.chapterList = []
          this.$message.error('获取章节列表失败')
        })
    },
    openChapterDialog(chapter) {
      this.chapterDialogVisible = true
      if (chapter) {
        this.chapterForm = Object.assign({}, chapter)
        // 确保编辑时也有courseId
        this.chapterForm.courseId = this.courseId
        console.log('编辑章节，章节数据:', this.chapterForm)
      } else {
        this.chapterForm = {
          title: '',
          sort: 0,
          courseId: this.courseId
        }
        console.log('添加章节，课程ID:', this.courseId)
        console.log('章节表单数据:', this.chapterForm)
      }
    },
    openVideoDialog(chapterId, video) {
      this.videoDialogVisible = true
      this.uploadProgress = 0
      this.videoFileList = []

      if (video) {
        // 编辑模式
        this.videoForm = Object.assign({}, video)
        console.log('编辑课时，原始数据:', video)
        console.log('编辑课时，表单数据:', this.videoForm)

        // 确保有chapterId（编辑时可能缺失）
        if (!this.videoForm.chapterId) {
          this.videoForm.chapterId = chapterId
        }

        // 如果有视频文件，显示文件信息
        if (video.videoOriginalName) {
          this.videoFileList = [{
            name: video.videoOriginalName,
            status: 'success'
          }]
          console.log('已有视频文件:', video.videoOriginalName)
        }
      } else {
        // 添加模式
        this.videoForm = {
          title: '',
          sort: 0,
          isFree: false,
          duration: '',
          description: '',
          chapterId: chapterId,
          videoSourceId: '',
          videoOriginalName: ''
        }
        console.log('添加课时，章节ID:', chapterId)
        console.log('添加课时，表单数据:', this.videoForm)
      }
    },
    saveChapter() {
      this.$refs.chapterForm.validate(valid => {
        if (valid) {
          console.log('保存章节，发送的数据:', this.chapterForm)
          const apiMethod = this.chapterForm.id ? chapter.updateChapter : chapter.addChapter
          apiMethod(this.chapterForm)
            .then(response => {
              this.$message.success('操作成功')
              this.chapterDialogVisible = false
              this.getChapterList()
            })
            .catch(error => {
              console.log('保存章节失败:', error)
              this.$message.error('操作失败')
            })
        }
      })
    },
    saveVideo() {
      this.$refs.videoForm.validate(valid => {
        if (valid) {
          const isUpdate = !!this.videoForm.id
          const apiMethod = isUpdate ? video.updateVideo : video.addVideo
          const actionText = isUpdate ? '更新' : '添加'

          console.log(`${actionText}课时，发送的数据:`, this.videoForm)
          console.log(`调用接口: ${isUpdate ? '/eduservice/video/updateVideo' : '/eduservice/video/addVideo'}`)

          apiMethod(this.videoForm)
            .then(response => {
              console.log(`${actionText}课时成功:`, response)
              this.$message.success(`课时${actionText}成功`)
              this.videoDialogVisible = false
              this.getChapterList()
            })
            .catch(error => {
              console.log(`${actionText}课时失败:`, error)
              this.$message.error(`课时${actionText}失败`)
            })
        }
      })
    },
    deleteChapter(id) {
      this.$confirm('删除章节会同时删除该章节下的所有课时，确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        chapter.deleteChapter(id)
          .then(response => {
            this.$message.success('删除成功')
            this.getChapterList()
          })
          .catch(error => {
            console.log(error)
            this.$message.error('删除失败')
          })
      })
    },
    deleteVideo(id) {
      this.$confirm('确定删除这个课时吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        video.deleteVideo(id)
          .then(response => {
            this.$message.success('删除成功')
            this.getChapterList()
          })
          .catch(error => {
            console.log(error)
            this.$message.error('删除失败')
          })
      })
    },
    formatDuration(seconds) {
      if (!seconds) return ''
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    // 视频上传前的检查
    beforeVideoUpload(file) {
      const isVideo = file.type.indexOf('video/') === 0
      const isLt200M = file.size / 1024 / 1024 < 200
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)

      console.log('上传文件信息:', {
        name: file.name,
        type: file.type,
        size: fileSizeMB + 'MB'
      })

      if (!isVideo) {
        this.$message.error('只能上传视频文件!')
        return false
      }

      if (!isLt200M) {
        this.$message({
          message: `文件太大! 当前: ${fileSizeMB}MB，最大支持: 200MB。请选择较小的视频文件。`,
          type: 'warning',
          duration: 5000,
          dangerouslyUseHTMLString: true
        })
        return false
      }

      // 大文件上传提示
      if (fileSizeMB > 100) {
        this.$message({
          message: `正在上传大文件 (${fileSizeMB}MB)，请耐心等待...`,
          type: 'info',
          duration: 3000
        })
      }

      this.uploadProgress = 0
      return true
    },
    // 视频上传成功
    handleVideoSuccess(response, file) {
      console.log('上传成功响应:', response)

      if (response.success) {
        this.videoForm.videoSourceId = response.data.url
        this.videoForm.videoOriginalName = file.name
        this.uploadProgress = 100

        // 显示成功消息
        this.$message({
          message: `视频 "${file.name}" 上传成功！`,
          type: 'success',
          duration: 3000
        })

        // 自动清除验证错误
        this.$refs.videoForm.clearValidate('videoSourceId')
      } else {
        this.$message.error('视频上传失败: ' + (response.message || '未知错误'))
        this.uploadProgress = 0
      }
    },
    // 视频上传失败
    handleVideoError(error, file) {
      console.log('视频上传失败:', error)

      // 检查是否是413错误（文件太大）
      if (error.status === 413 || error.message.includes('413')) {
        this.$message.error('文件太大，请选择小于200MB的视频文件')
      } else if (error.status === 0) {
        this.$message.error('网络连接失败，请检查网络后重试')
      } else if (error.status === 500) {
        this.$message.error('服务器处理失败，请稍后重试')
      } else if (error.status === 504) {
        this.$message.error('上传超时，请检查网络或选择较小的文件')
      } else {
        this.$message.error(`视频上传失败: ${error.message || '未知错误'}`)
      }

      this.uploadProgress = 0
      this.videoFileList = []
    },
    // 视频上传进度
    handleVideoProgress(event, file, fileList) {
      this.uploadProgress = Math.round(event.percent)

      // 大文件上传时的进度提示
      if (this.uploadProgress % 20 === 0 && this.uploadProgress > 0 && this.uploadProgress < 100) {
        console.log(`上传进度: ${this.uploadProgress}%`)
      }
    },
    // 超出文件数量限制
    handleVideoExceed(files, fileList) {
      this.$message.warning('只能上传一个视频文件')
    },
    // 删除视频
    removeVideo() {
      this.videoForm.videoSourceId = ''
      this.videoForm.videoOriginalName = ''
      this.videoFileList = []
      this.uploadProgress = 0
    },
    // 格式化上传进度显示
    formatProgress(percentage) {
      if (percentage === 100) {
        return '上传完成'
      } else if (percentage > 0) {
        return `上传中 ${percentage}%`
      }
      return '0%'
    },
    previous() {
      this.$router.push({ path: `/course/info/${this.courseId}` })
    },
    next() {
      this.$router.push({ path: `/course/publish/${this.courseId}` })
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

/* 课程信息样式 */
.course-info-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-info .course-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-info .course-title i {
  color: #409eff;
  font-size: 24px;
}

.course-meta {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
}

.course-actions {
  display: flex;
  gap: 12px;
}

/* 章节容器样式 */
.chapter-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chapter-header {
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-header i {
  color: #409eff;
  font-size: 20px;
}

.chapter-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

/* 章节列表样式 */
.chapter-list {
  padding: 24px;
}

.chapter-item {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chapter-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chapter-header-item {
  background: #f8f9fa;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chapter-number {
  background: #409eff;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.chapter-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.chapter-sort {
  color: #666;
  font-size: 12px;
}

.chapter-actions {
  display: flex;
  gap: 8px;
}

/* 课时列表样式 */
.video-list {
  padding: 0;
}

.video-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.video-item:hover {
  background-color: #f8f9fa;
}

.video-item:last-child {
  border-bottom: none;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-info i {
  color: #67c23a;
  font-size: 16px;
}

.video-title {
  font-size: 14px;
  color: #2c3e50;
}

.video-duration {
  color: #666;
  font-size: 12px;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.video-actions {
  display: flex;
  gap: 8px;
}

/* 空状态样式 */
.empty-video {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.empty-video i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.empty-chapter {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-chapter i {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
  color: #ddd;
}

.empty-chapter p {
  font-size: 16px;
  margin-bottom: 20px;
}

/* 删除按钮样式 */
.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  background-color: #fef0f0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-info-container {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .course-actions {
    width: 100%;
    justify-content: center;
  }

  .chapter-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .chapter-header-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .video-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 视频上传样式 */
.uploaded-video-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.uploaded-video-info i {
  color: #409eff;
  font-size: 16px;
}

.uploaded-video-info span {
  flex: 1;
  color: #2c3e50;
  font-size: 14px;
}

/* 上传进度条样式 */
.el-progress {
  margin-top: 10px;
}

/* 上传区域样式优化 */
.el-upload-dragger {
  width: 100% !important;
}

.el-upload__tip {
  color: #666;
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.5;
}

.el-upload__tip br {
  margin: 4px 0;
}

/* 动画效果 */
.chapter-container {
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
