<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="success">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolelist" stripe>
        <el-table-column type="expand">
          <template v-slot="scoped">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':' ','vcenter']"
              v-for="(item1,i1) in 
        scoped.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removepower(scoped.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-share"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <!-- 通过循环渲染嵌套二级权限 -->

                <el-row
                  :class="['',i2===0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removepower(scoped.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-share"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removepower(scoped.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 三级权限 -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" with="300px">
          <template v-slot="scoped">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-dlete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRigPower(scoped.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="RightdialogVb"
      width="50%"
      @close="PowerDgclosed(defKeys = [])"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 为每一个节点绑定id -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="RightdialogVb = false">取 消</el-button>
        <el-button type="primary" @click="givePower">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolelist: [],
      //分配对话框
      RightdialogVb: false,

      //权限数据
      rightsList: "",
      //树形控件的属性
      treeProps: {
        label: "authName",
        children: "children",
      },
      //当前分配权限的角色id
      roleId: "",
      //默认选中的id
      defKeys: [],
    };
  },
  created() {
    this.getRoleList();
  },

  methods: {
    //分配权限
    async givePower() {
      //getCheckedKeys函数获取已选中的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        //这个是获取半选
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      //  拼接字符串
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败");
      }
      this.$message.success("分配权限成功");
      this.getRoleList();
      this.RightdialogVb = false;
    },
    async showRigPower(role) {
      this.roleId = role.id;
      //获取权限列表的数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      //获取三级节点的id
      this.rightsList = res.data;
      this.getPowerKey(role, this.defKeys);

      this.RightdialogVb = true;
    },

    //获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolelist = res.data;
    },
    async removepower(role, rightId) {
      const conifrmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (conifrmResult !== "confirm") {
        return this.$message.info("取消操作");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        console.log(res.meta);
        return this.$message.error("删除权限失败");
      }
      // 这样会刷新页面
      // this.getRoleList()
      // 重新赋值权限就行、
      role.children = res.data;
      return this.$message.success("删除权限成功");
    },
    getPowerKey(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getPowerKey(item, arr));
    },
    PowerDgclosed() {
      this.defKeys = [];
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>