import request from '@/utils/request'

export default {
  // 添加小节
  addVideo(video) {
    return request({
      url: `/eduservice/video/addVideo`,
      method: 'post',
      data: video
    })
  },

  // 根据id获取小节
  getVideo(videoId) {
    return request({
      url: `/eduservice/video/getVideo/${videoId}`,
      method: 'get'
    })
  },

  // 修改小节
  updateVideo(video) {
    return request({
      url: `/eduservice/video/updateVideo`,
      method: 'post',
      data: video
    })
  },

  // 根据id删除小节
  deleteVideo(videoId) {
    return request({
      url: `/eduservice/video/deleteVideo/${videoId}`,
      method: 'delete'
    })
  }
}
