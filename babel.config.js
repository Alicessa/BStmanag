//项目发布阶段使用的babel插件,清楚console.log
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
	prodPlugins.push('transform-remove-console')
}

module.exports = {
	"presets": [
		"@vue/cli-plugin-babel/preset"
	],
	'plugins': [
		//发布产品的时候的插件数组
		...prodPlugins
	]
}