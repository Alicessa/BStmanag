<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="~assets/img/ico.gif" alt />
      </div>
      <!-- 登录表单,区域绑定规则 ,:rules="loginFormRules"-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login" @keyup.enter.native="logins" >登录</el-button>
          <el-button type="danger" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //验证规则
      loginFormRules: {
        //  trigger: 'blur触发事件为鼠标离开
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 4,
            max: 10,
            message: "长度在 4 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 12,
            message: "长度在 6 到 12 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    logins(){
    this.login()
    },
    login() {
      //  预验证
      // validate对整个表单进行校验的方法，参数为一个回调函数。
      // 该回调函数会在校验结束后被调用，
      // 并传入两个参数：是否校验成功和未通过校验的字段。
      // 若不传入回调函数，则会返回一个 promise
      this.$refs.loginFormRef.validate(async (meg) => {
      
        //    meg验证的信息
        if (!meg) return;
        // 解构赋值拿里面的只需要data
        const { data: res } = await this.$http.post("login", this.loginForm);
        

        if (res.meta.status !== 200) {
          return this.$message.error("登录失败,用户密码错误");
        }
        this.$message.success("登录成功");
        // 1.将登录成功之后的token, 保存到客户端的sessionStorage 中
        // 1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //
        //.2 token 只应在当前网站打开期间生效，所以将token 保存在sessionStorage 中
        // 2.通过编程式导航跳转到后台主页，路由地址是/horife
       
        window.sessionStorage.setItem("token",res.data.token)
        this.$router.push('/home')
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: white;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fbfbfd;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 8px;
    /* 边框阴影 */
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 15%;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>