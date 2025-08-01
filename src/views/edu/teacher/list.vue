<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item>
        <el-input v-model="teacherQuery.name" placeholder="讲师名" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="teacherQuery.level" clearable placeholder="讲师头衔">
          <el-option :value="1" label="高级讲师" />
          <el-option :value="2" label="首席讲师" />
        </el-select>
      </el-form-item>
      <el-form-item label="添加时间">
        <el-date-picker
          v-model="teacherQuery.begin"
          type="datetime"
          placeholder="选择开始时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="teacherQuery.end"
          type="datetime"
          placeholder="选择截止时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
        />
      </el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="getList()">查询</el-button>
      <el-button type="default" @click="resetData()">清空</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="$router.push('/teacher/save')">添加讲师</el-button>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="数据加载中"
      border
      fit
      highlight-current-row>

      <el-table-column
        align="center"
        label="序号"
        width="70">
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="名称" width="110" align="center" prop="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column label="头衔" width="110" align="center" prop="level">
        <template slot-scope="scope">
          {{ scope.row.level===1?'高级讲师':'首席讲师' }}
        </template>
      </el-table-column>

      <el-table-column label="资历" width="110" align="center" prop="career">
        <template slot-scope="scope">
          {{ scope.row.career }}
        </template>
      </el-table-column>

      <el-table-column label="讲师简介" prop="intro">
        <template slot-scope="scope">
          {{ scope.row.intro }}
        </template>
      </el-table-column>

      <el-table-column label="添加时间" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.gmtCreate }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <router-link :to="'/teacher/edit/'+scope.row.id">
            <el-button type="primary" size="mini" icon="el-icon-edit">修改</el-button>
          </router-link>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeDataById(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="page"
      :page-size="limit"
      :total="total"
      style="padding: 30px 0; text-align: center;"
      layout="total, prev, pager, next, jumper"
      @current-change="getList"
    />
  </div>
</template>

<script>
import teacher from '@/api/edu/teacher'

export default {
  data() {
    return {
      list: null,
      listLoading: true,
      page: 1,
      limit: 10,
      total: 0,
      teacherQuery: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(page = 1) {
      this.page = page
      this.listLoading = true
      teacher.getTeacherList(this.page, this.limit, this.teacherQuery)
        .then(response => {
          this.list = response.data.rows
          this.total = response.data.total
          this.listLoading = false
        }).catch(error => {
          console.log(error)
          this.listLoading = false
        })
    },

    removeDataById(id) {
      this.$confirm('此操作将永久删除该讲师, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用删除的方法
        teacher.removeTeacher(id).then(response => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          // 回到列表页面
          this.getList(1)
        })
      })
    },

    resetData() {
      this.teacherQuery = {}
      this.getList()
    }
  }
}

</script>
