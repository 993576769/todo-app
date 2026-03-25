import PocketBase from 'pocketbase'

// 根据环境变量或默认值设置 PocketBase URL
const PB_URL = import.meta.env.VITE_PB_URL || ''

// 如果没有设置环境变量，使用根路径（确保 API 请求相对于域名根，而非当前页面路径）
const getPBUrl = () => {
  if (PB_URL) return PB_URL
  // 返回 '/' 确保请求发送到 /api/... 而非 /当前路径/api/...
  return '/'
}

export const pb = new PocketBase(getPBUrl())

// 开发环境关闭自动取消请求
if (import.meta.env.DEV) {
  pb.autoCancellation(false)
}
