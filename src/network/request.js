import axios from 'axios'
import Vue from 'vue'
//进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config=>{
    //进度条的显示
	NProgress.start()
    //拦截器,在请求头里添加一个token,为了正常访问Api
    config.headers.Authorization=window.sessionStorage.getItem('token')
    return config
})

axios.interceptors.response.use(config => {
    // 响应成功
    // 进度条的关闭
	NProgress.done()
	return config
})
Vue.prototype.$http=axios