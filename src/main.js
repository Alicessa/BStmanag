import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/element.js'
import moment from "moment";
import './assets/css/global.css'
import 'network/request.js'
//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//开发模式的入口文件为min-dev.js
//发布模式的入口文件为mian-prod.js

//  configureWebpack和chainWebpack
// 在vue.config.js导出的配置对象中,新增configureWebpack或chainWebpack节点，来自定义webpack
// 的打包配置。
// 在这里，configureWebpack 和chainWebpack的作用相同，唯- -的区别就是它们修改webpack配置的方
// 式不同:
// ①chainWebpack 通过链式编程的形式，来修改默认的webpack配置
// ②configureWebpack 通过操作对象的形式，来修改默认的webpack配置

Vue.use(VueQuillEditor)
Vue.filter('dateTimefter', function (originVal) {
	const dt = new Date(originVal)
  
	const y = dt.getFullYear()
	const m = (dt.getMonth() + 1 + '').padStart(2, '0')
	const d = (dt.getDate() + '').padStart(2, '0')
  
	const hh = (dt.getHours() + '').padStart(2, '0')
	const mm = (dt.getMinutes() + '').padStart(2, '0')
	const ss = (dt.getSeconds() + '').padStart(2, '0')
  
	return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
