import request from '@/utils/request'

export default {
  // 根据课程id获取章节和小节数据列表
  getChapterList(courseId) {
    return request({
      url: `/eduservice/chapter/getChapterVideo/${courseId}`,
      method: 'get'
    })
  },

  // 添加章节
  addChapter(chapter) {
    return request({
      url: `/eduservice/chapter/addChapter`,
      method: 'post',
      data: chapter
    })
  },

  // 根据id获取章节
  getChapter(chapterId) {
    return request({
      url: `/eduservice/chapter/getChapter/${chapterId}`,
      method: 'get'
    })
  },

  // 修改章节
  updateChapter(chapter) {
    return request({
      url: `/eduservice/chapter/updateChapter`,
      method: 'post',
      data: chapter
    })
  },

  // 根据id删除章节
  deleteChapter(chapterId) {
    return request({
      url: `/eduservice/chapter/deleteChapter/${chapterId}`,
      method: 'delete'
    })
  }
}
