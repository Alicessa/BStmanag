<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="警告这允许为第三级分类设置相关参数" type="warning" effect="dark"></el-alert>
      <!-- 商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类</span>
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader
            @change="selectChange"
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            :clearable="true"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs type="border-card" v-model="activeName" @tab-click="tabsClick">
        <el-tab-pane label="动态属性" name="many">
          <el-button type="primary" :disabled="isBtn" @click="addVb=true">添加属性</el-button>
          <el-table :data="manyTableData" stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 新参数 </el-button>
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="removerTag(i,scope.row)">{{item}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  circle
                  @click="editParms(scope.row.attr_id)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeParms(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtn" @click="addVb=true">添加参数</el-button>
          <el-table :data="onlyTableData" stripe>
              <el-table-column type="expand">
              <template slot-scope="scope">
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 新参数 </el-button>
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="removerTag(i,scope.row)">{{item}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  circle
                  @click="editParms(scope.row.attr_id)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeParms(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog :title="'添加'+title" :visible.sync="addVb" width="50%" @close="addVbClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- prop="username"绑定的验证规则 -->
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVb = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="'修改'+title" :visible.sync="editVb" width="50%" @close="editVbClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- prop="username"绑定的验证规则 -->
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVb = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      //商品分类列表
      cateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // inputVisible: false,
      // inputValue:'',
      //级联选择框选中的数组
      selectedKeys: [],
      //被激活的tab名称
      activeName: "many",
      //动态参数数据列表
      manyTableData: [],
      //静态属性数据列表
      onlyTableData: [],
      //添加属性对话框显示状态
      addVb: false,
      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      editVb: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    removerTag(i,row){
      row.attr_vals.splice(i,1)
        this.saveAttvals(row)
    },
    showInput(row) {
      row.inputVisible = true;
      //自动获取焦点
      // $nextTick方法作用。就是当页面上元素重新被渲染之后，才会指定回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
  async  handleInputConfirm(row) {
   
       if (row.inputValue.trim().length === 0) {
        row.inputValue = " ";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = " ";
      row.inputVisible = false;
  this.saveAttvals(row)

    },
    async saveAttvals(row){
        //发起请求
 const{data:res}=await  this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
   {attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(' ')})
 if (res.meta.status !== 200) {
        return this.$message.error("修改失败");
      }
      this.$message.success("修改成功");
    },
    async removeParms(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消操作");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getParamsData();
    },

    async editParms(attr_id) {
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取参数数据失败");
      }
      this.editForm = res.data;

      this.editVb = true;
    },
    addVbClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
    },
    selectChange() {
      this.getParamsData();
    },
    //获取列表数据
    async getParamsData() {
      //判断是否为3机分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }
      //根据选的id和面板获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}
	 /attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //  控制文本框的显示和隐藏
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      }
      this.onlyTableData = res.data;
    },
    // tab标签点击事件
    tabsClick() {
      this.getParamsData();
    },
    addParams() {
      this.$refs.addFormRef.validate(async (mes) => {
        if (!mes) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          this.$message.error("添加成功");
        }
        this.$message.success("添加成功");
        this.addVb = false;
        this.getParamsData();
      });
    },
    editVbClosed() {
      this.$refs.editFormRef.resetFields();
    },
    editParams() {
      this.$refs.editFormRef.validate(async (mes) => {
        if (!mes) return;
        const {
          data: res,
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          this.$message.error("修改失败");
        }
        this.$message.success("修改成功");
        this.getParamsData();
        this.editVb = false;
      });
    },
  },
  computed: {
    //按钮需要禁用，
    isBtn() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        return true;
      }
      return false;
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    title() {
      if (this.activeName == "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
  margin-top: 3%;
}

.el-button {
  margin-right: 10px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}

.button-new-tag {
  width: 120px;
}
</style>