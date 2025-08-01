import request from '@/utils/request'

export default {
  // 获取课程列表（分页）
  getCourseList(current, limit, courseQuery) {
    return request({
      url: `/eduservice/coursefront/getFrontCourseList/${current}/${limit}`,
      method: 'post',
      data: courseQuery
    })
  },

  // 根据id删除课程
  deleteCourse(id) {
    return request({
      url: `/eduservice/course/deleteCourse/${id}`,
      method: 'delete'
    })
  },

  // 根据id获取课程信息
  getCourseInfo(id) {
    return request({
      url: `/eduservice/course/getCourse/${id}`,
      method: 'get'
    })
  },

  // 添加课程基本信息
  addCourseInfo(courseInfo) {
    return request({
      url: `/eduservice/course/addCourseInfo`,
      method: 'post',
      data: courseInfo
    })
  },

  // 修改课程基本信息
  updateCourseInfo(courseInfo) {
    return request({
      url: `/eduservice/course/updateCourseInfo`,
      method: 'post',
      data: courseInfo
    })
  },

  // 根据课程id获取课程基本信息
  getCourseInfoById(id) {
    return request({
      url: `/eduservice/course/getCourseInfo/${id}`,
      method: 'get'
    })
  },

  // 根据课程id获取课程发布信息
  getCoursePublishInfo(id) {
    return request({
      url: `/eduservice/course/getPublishCourseInfo/${id}`,
      method: 'get'
    })
  },

  // 课程最终发布
  publishCourse(id) {
    return request({
      url: `/eduservice/course/publishCourse/${id}`,
      method: 'post'
    })
  },

  // 获取所有讲师
  getAllTeacher() {
    return request({
      url: `/eduservice/teacher/findAll`,
      method: 'get'
    })
  }
}
