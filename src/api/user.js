import request from '@/utils/request'
//注册
export const userRegisterService = (data) => request.post('/api/reg', data)
//登录
export const userLoginService = ({ username, password }) =>
  request.post('api/login', { username, password })
