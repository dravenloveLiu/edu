import request from '@/utils/request'

export default {
  // 获取课程分类列表（树形结构）
  getSubjectList() {
    return request({
      url: `/eduservice/subject/getAllSubject`,
      method: 'get'
    })
  },

  // 获取一级分类列表
  getOneSubjectList() {
    return request({
      url: `/eduservice/subject/getOneSubject`,
      method: 'get'
    })
  },

  // 根据一级分类id获取二级分类
  getTwoSubject(parentId) {
    return request({
      url: `/eduservice/subject/getTwoSubject/${parentId}`,
      method: 'get'
    })
  },

  // 添加课程分类
  addSubject(subject) {
    return request({
      url: `/eduservice/subject/addSubject`,
      method: 'post',
      data: subject
    })
  },

  // 根据id删除课程分类
  deleteSubject(id) {
    return request({
      url: `/eduservice/subject/deleteSubject/${id}`,
      method: 'delete'
    })
  },

  // 根据id获取课程分类信息
  getSubjectInfo(id) {
    return request({
      url: `/eduservice/subject/getSubject/${id}`,
      method: 'get'
    })
  },

  // 修改课程分类
  updateSubject(subject) {
    return request({
      url: `/eduservice/subject/updateSubject`,
      method: 'post',
      data: subject
    })
  },

  // Excel导入课程分类
  importSubject(file) {
    return request({
      url: `/eduservice/subject/addSubject`,
      method: 'post',
      data: file,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
