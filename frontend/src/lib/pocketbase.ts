import PocketBase from 'pocketbase'

// 根据环境变量或默认值设置 PocketBase URL
const PB_URL = import.meta.env.VITE_PB_URL || ''

// 如果没有设置环境变量，根据当前域名自动判断
const getPBUrl = () => {
  if (PB_URL) return PB_URL
  
  // 生产环境使用相对路径（通过 nginx 代理）
  if (import.meta.env.PROD) return ''
  
  // 开发环境使用代理
  return ''
}

export const pb = new PocketBase(getPBUrl())

// 开发环境关闭自动取消请求
if (import.meta.env.DEV) {
  pb.autoCancellation(false)
}
