<template>
  <!-- 头部区域 -->
  <el-container class="home-container">
    <!-- 页面主体区域 -->
    <el-header>
      <div>
        <img src="~assets/img/ico.gif" />
      </div>

      <span>后台管理系统</span>
      <el-button type="danger" round @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <!-- 动态的根据togglecpe的展开和折叠给宽度 -->
      <el-aside :width="togglecpe ? '64':'200px'">
        <div class="toggle" @click="togglecpe">
          <el-switch
          
 v-model="isCollapse"
 @change="togglecpe"

  active-color="#13ce66"
  inactive-color="#ff4949">
</el-switch>
        </div>
        <!-- 菜单区域 -->
        <el-menu
       
          class="el-menu-vertical-demo"
          background-color="#f0f0f0"
          text-color="#111"
          active-text-color="#bf4800"
          :unique-opened='true'
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
         
        >
          <!-- default-active	当前激活菜单的 index -->
          <!-- 一级菜单   ,:index绑定唯一的值不然会一个展开全部都展开:index="item.id+''"-->
          <el-submenu :index="item.id+''" v-for=" item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icondsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 :index="'/'+subItem.path路由-->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              @click="activeState('/'+subItem.path)"
              :key="subItem.id"
            >
              <template slot="title">
                <i class="el-icon-setting"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      //利用key值绑定的id然后给类名
      icondsObj: {
        "125": "iconfont el-icon-user-solid",
        "103": "iconfont el-icon-s-grid",
        "101": "iconfont el-icon-s-management",
        "102": "iconfont el-icon-s-order",
        "145": "iconfont el-icon-loading",
      },
      //是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath:'',
    
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    
    },
    //菜单的折叠
    togglecpe() {
      this.isCollapse = !this.isCollapse; 
      
    },
    //保存链接的激活状态保存到session
    activeState(activePath){
      this.$router.push(activePath)
      window.sessionStorage.setItem('activePath',activePath)
      
    },
   
  },

  created() {
    // 获取菜单列表
    this.getMenList();
    this.activePath=window.sessionStorage.getItem('activePath')
    
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #444;
  display: flex;
  // 左右贴边对齐
  justify-content: space-between;
  // 按钮居中
  align-items: center;
  color: #f5f5f7;
  font-size: 20px;
  > div {
    width: 4%;
    height: 95%;

    img {
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }
    display: flex;
    align-items: center;
    span {
      margin-left: 10%;
    }
  }
}
.el-aside {
  background-color: #f0f0f0;
  .elmenu {
    border-right: none;
  }
}
.el-main {
  background-color: #fbfbfd;
}
.iconfont {
  margin-left: 10px;
}
.toggle {
  font-size: 30px;
  line-height: 24px;
  text-align: center;
  //鼠标移动变
  cursor: pointer;
}
</style>