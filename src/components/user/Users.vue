<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getUserlist"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
          </el-input>
          <div class="grid-content bg-purple"></div>
        </el-col>

        <el-col :span="4">
          <el-button @click="Dialogvb=true" style="float: right; padding: 3px 0" type="text">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="userlist" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 布尔值需要：绑定 -->
            <el-tooltip class="item" effect="dark" content="角色分配" placement="top">
              <el-button type="warning" icon="el-icon-star-off" circle @click="giveNpc(scope.row)"></el-button>
            </el-tooltip>

            <el-button type="primary" icon="el-icon-edit" circle @click="editDia(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle @click="deleteById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="Dialogvb" width="50%" @close="addClosed">
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- prop="username"绑定的验证规则 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="Dialogvb = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分页区域 -->
    <!--修改用户的对话框-->
    <el-dialog
      title="修改用户"
      width="50%"
      :visible.sync="editDialogVb"
      :close-on-click-modal="false"
      @close="editClosed"
    >
      <!--内容主体-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部-->
      <span slot="footer">
        <el-button @click="editDialogVb=false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <el-dialog title="分配角色" :visible.sync="giveNpcVb" width="50%" @close="giveNpcVbClosed">
      <p>当前用户：{{userInfo.username}}</p>
      <p>当前角色：{{userInfo.role_name}}</p>
      <p>
        分配角色：
        <el-select v-model="selectrRoleId" placeholder="分配">
          <el-option
            v-for="item in  NpcPower"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="giveNpcVb = false">取 消</el-button>
        <el-button type="primary" @click="FixgiveNpc">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //自定义校验规则
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机号"));
    };
    return {
      //获取用户列表的参数
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // 控制对话框的显示和隐藏
      Dialogvb: false,
      //修改用户的对话框
      editDialogVb: false,
      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //表单验证规则
      addRules: {
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
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },

      //修改用户的表单数据// 查询到的用户信息对象
      editForm: {},
      //修改用户表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //分配角色的对话框
      giveNpcVb: false,
      //分配角色的信息
      userInfo: {},
      //角色权限列表
      NpcPower: [],
      //已经选中的角色id
      selectrRoleId: "",
    };
  },
  created() {
    this.getUserlist();
  },
  methods: {
    giveNpcVbClosed() {
      this.selectrRoleId = "";
      this.userInfo = {};
    },
    async FixgiveNpc() {
      if (!this.selectrRoleId) {
        return this.$message.info("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectrRoleId,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新失败");
      }
      this.$message.success("更新成功");
      this.getUserlist();
      this.giveNpcVb = false;
    },

    async giveNpc(userInfo) {
      this.userInfo = userInfo;
      //获取角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.NpcPower = res.data;
      this.giveNpcVb = true;
    },
    async deleteById(id) {
      //弹框,返回值是promise可以有await进行优化
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //如果用户确认删除，则返回值为字符串conf rm
      //如果用户取消了删除，则返回值为字符串cancel
      // console. log( confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message({
          type: "info",
          message: "取消操作!",
        });
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getUserlist();
    },

    // 监听修改用户的对话框事件
    editClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户并提交
    editUser() {
      // 验证表单
      this.$refs.editFormRef.validate(async (mes) => {
        if (!mes) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );

        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("修改失败");
        }
        this.editDialogVb = false;
        this.getUserlist();
        this.$message.success("修改成功");
      });
    },
    //展示编辑对话框
    async editDia(id) {
      const { data: res } = await this.$http.get("/users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      this.editForm = res.data;
      console.log(this.editForm);
      this.editDialogVb = true;
    },

    addUser() {
      this.$refs.addFormRef.validate(async (mes) => {
        if (!mes) return;
        const { data: res } = await this.$http.post("/users", this.addForm);

        console.log(res);
        if (res.meta.status !== 201) {
          this.$message.error("添加失败");
        }
        this.$message.success("成功");
        this.Dialogvb = false;
        this.getUserlist();
      });
    },
    // 监听添加用户框的关闭事件
    addClosed() {
      this.$refs.addFormRef.resetFields();
    },
    async getUserlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(neweSize) {
      this.queryInfo.pagesize = neweSize;
      this.getUserlist();
    },
    // 监听页码值的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserlist();
    },
    //监听switch开关的改变
    async userState(userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("此次操作失败");
      }
      this.$message.success("操作成功");
    },
  },
};
</script>

<style>
</style>