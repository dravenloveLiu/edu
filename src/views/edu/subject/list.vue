<template>
  <div class="app-container">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addOneSubject">
          添加一级分类
        </el-button>
        <el-button
          type="success"
          icon="el-icon-upload2"
          @click="$router.push('/subject/save')">
          批量添加
        </el-button>
        <el-button
          type="info"
          icon="el-icon-refresh"
          @click="refreshList">
          刷新
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="filterText"
          placeholder="输入关键字搜索分类..."
          prefix-icon="el-icon-search"
          clearable
          class="search-input" />
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="el-icon-folder" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalCategories }}</div>
              <div class="stat-label">总分类数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="el-icon-folder-opened" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ oneSubjectCount }}</div>
              <div class="stat-label">一级分类</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <i class="el-icon-folder-add" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ twoSubjectCount }}</div>
              <div class="stat-label">二级分类</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon info">
              <i class="el-icon-time" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ lastUpdateTime }}</div>
              <div class="stat-label">最后更新</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 分类树形结构 -->
    <div class="tree-container">
      <div class="tree-header">
        <h3>
          <i class="el-icon-s-grid" />
          分类结构
        </h3>
        <div class="tree-actions">
          <el-button-group>
            <el-button
              :type="expandAll ? 'primary' : 'default'"
              size="mini"
              @click="toggleExpandAll">
              {{ expandAll ? '收起全部' : '展开全部' }}
            </el-button>
          </el-button-group>
        </div>
      </div>

      <el-tree
        ref="subjectTree"
        :data="subjectList"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :default-expand-all="false"
        :expand-on-click-node="false"
        class="subject-tree"
        node-key="id">
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <div class="node-content">
            <div class="node-info">
              <i :class="getNodeIcon(data)" class="node-icon" />
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions">
              <el-button
                v-if="data.level === 1"
                type="text"
                size="mini"
                icon="el-icon-plus"
                class="action-btn add-btn"
                @click="() => append(data)">
                添加子分类
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-edit"
                class="action-btn edit-btn"
                @click="() => editSubject(data)">
                编辑
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                class="action-btn delete-btn"
                @click="() => remove(node, data)">
                删除
              </el-button>
            </div>
          </div>
        </span>
      </el-tree>
    </div>

    <!-- 添加分类对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form ref="subjectForm" :model="subject" :rules="rules" label-width="120px">
        <el-form-item label="分类名称" prop="title">
          <el-input v-model="subject.title" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item v-if="subject.parentId !== '0'" label="上级分类">
          <el-input v-model="parentTitle" disabled />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSubject">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import subject from '@/api/edu/subject'

export default {
  data() {
    return {
      filterText: '',
      subjectList: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      dialogVisible: false,
      dialogTitle: '',
      subject: {
        title: '',
        parentId: '0'
      },
      parentTitle: '',
      expandAll: true,
      totalCategories: 0,
      oneSubjectCount: 0,
      twoSubjectCount: 0,
      lastUpdateTime: '刚刚',
      rules: {
        title: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.subjectTree.filter(val)
    }
  },
  created() {
    this.getSubjectList()
  },
  methods: {
    getSubjectList() {
      subject.getSubjectList()
        .then(response => {
          this.subjectList = response.data.list
          this.calculateStats()
          this.updateLastTime()
          // 初始化展开状态
          this.$nextTick(() => {
            if (this.expandAll) {
              this.expandAllNodes()
            }
          })
        })
        .catch(error => {
          console.log(error)
          this.$message.error('获取课程分类失败')
        })
    },
    calculateStats() {
      let oneCount = 0
      let twoCount = 0

      this.subjectList.forEach(item => {
        oneCount++
        if (item.children && item.children.length > 0) {
          twoCount += item.children.length
        }
      })

      this.oneSubjectCount = oneCount
      this.twoSubjectCount = twoCount
      this.totalCategories = oneCount + twoCount
    },
    updateLastTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      this.lastUpdateTime = `${hours}:${minutes}`
    },
    refreshList() {
      this.getSubjectList()
      this.$message.success('刷新成功')
    },
    toggleExpandAll() {
      this.expandAll = !this.expandAll
      this.$nextTick(() => {
        if (this.expandAll) {
          // 展开所有节点
          this.expandAllNodes()
        } else {
          // 收起所有节点
          this.collapseAllNodes()
        }
      })
    },
    expandAllNodes() {
      // 递归展开所有节点
      const expandNode = (data) => {
        data.forEach(node => {
          const treeNode = this.$refs.subjectTree.getNode(node.id)
          if (treeNode) {
            treeNode.expanded = true
          }
          if (node.children && node.children.length > 0) {
            expandNode(node.children)
          }
        })
      }
      if (this.subjectList.length > 0) {
        expandNode(this.subjectList)
      }
    },
    collapseAllNodes() {
      // 递归收起所有节点
      const collapseNode = (data) => {
        data.forEach(node => {
          const treeNode = this.$refs.subjectTree.getNode(node.id)
          if (treeNode) {
            treeNode.expanded = false
          }
          if (node.children && node.children.length > 0) {
            collapseNode(node.children)
          }
        })
      }
      if (this.subjectList.length > 0) {
        collapseNode(this.subjectList)
      }
    },
    getNodeIcon(data) {
      return data.level === 1 ? 'el-icon-folder' : 'el-icon-document'
    },
    editSubject(data) {
      this.$router.push({ path: `/subject/edit/${data.id}` })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.title.indexOf(value) !== -1
    },
    addOneSubject() {
      this.dialogTitle = '添加一级分类'
      this.subject = {
        title: '',
        parentId: '0'
      }
      this.parentTitle = ''
      this.dialogVisible = true
    },
    append(data) {
      this.dialogTitle = '添加二级分类'
      this.subject = {
        title: '',
        parentId: data.id
      }
      this.parentTitle = data.title
      this.dialogVisible = true
    },
    remove(node, data) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        subject.deleteSubject(data.id)
          .then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getSubjectList()
          })
          .catch(error => {
            console.log(error)
            this.$message.error('删除失败')
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    saveSubject() {
      this.$refs.subjectForm.validate(valid => {
        if (valid) {
          subject.addSubject(this.subject)
            .then(response => {
              this.$message({
                type: 'success',
                message: '添加成功!'
              })
              this.dialogVisible = false
              this.getSubjectList()
            })
            .catch(error => {
              console.log(error)
              this.$message.error('添加失败')
            })
        }
      })
    }
  }
}
</script>

<style scoped>
/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  flex: 0 0 300px;
}

.search-input {
  width: 100%;
}

/* 统计卡片样式 */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #666;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

/* 树形容器样式 */
.tree-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tree-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-actions {
  display: flex;
  gap: 12px;
}

/* 树形结构样式 */
.subject-tree {
  padding: 16px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.node-content:hover {
  background-color: #f8f9fa;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  font-size: 16px;
  color: #667eea;
}

.node-label {
  font-weight: 500;
  color: #2c3e50;
}

.node-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #e8f5e8;
  color: #67c23a;
}

.edit-btn:hover {
  background-color: #e6f7ff;
  color: #409eff;
}

.delete-btn:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 对话框样式优化 */
.el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.el-dialog__title {
  color: white;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .toolbar-right {
    flex: 1;
    width: 100%;
  }

  .stats-cards .el-col {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .node-actions {
    opacity: 1;
  }
}

/* 动画效果 */
.el-tree-node {
  transition: all 0.3s ease;
}

.el-tree-node:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

/* 加载动画 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
