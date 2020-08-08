

//别名文件。执行时会做合并
module.exports = {
    configureWebpack: {//准备
        resolve: {
            alias: {
                //配置别名
                // 系统已经设置@为src
                'assets': '@/assets',
                'common': '@/common',
                'components': '@/components',
                'network': '@/network',
                'views': '@/views',
                'pluginunit':'@/pluginunit'
            }
        }
    },
    devServer: {
        host: 'localhost',  //本机电脑 ip 地址
        port: 8080,  //端口号
        
    },
    //修改打包入口文件//发布模式
//     chainWebPack: config=>{
//      config.when(process.env.NOOE_ENV==='produciton',config=>{
//          config.entry('app').clear().add('./src/main-prod.js')
//     })
//   开发模式
//     config.when(process.env.NOOE_ENV==='developmet',config=>{
//         config.entry('app').clear().add('./src/main-dev.js')
//    })
//    }
   
}