<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <!-- activeIndex-0字符变字符串 -->
        <el-alert title="添加商品信息" type="info" effect="dark"></el-alert>
        <el-steps :active="activeIndex-0" finish-status="success" simple style="margin-top: 20px">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
        
        </el-steps>
        <!-- 注意嵌套关系 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          label-position="top"
          class="addshop"
        >
          <el-tabs
            :before-leave="bfactive"
            :tab-position="'left'"
            style="height: 100%;"
            v-model="activeIndex"
            @tab-click="tabClick"
          >
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item prop="goods_cat">
                <!-- props指定配置对象 -->
                <el-cascader
                  style="width: 50%;"
                  @change="selectChange"
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="cateProps"
                  :clearable="true"
                ></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="item  in manTabData" :key="item.attr_id">
                <div style="margin-top: 20px">
                  <el-checkbox-group v-model="item.attr_vals" size="small">
                    <el-checkbox border v-for="(cb,i) in item.attr_vals" :label="cb" :key="i">{{cb}}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- action上传地址 /由于没有携带token的原因所以手动加了headers请秋头-->
              <el-upload
                class="upload-demo"
                :action="uploadurl"
                list-type="picture"
                :on-preview="picPreview"
                :on-remove="picRemove"
                :headers="headerObj"
                :on-success="picsuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <el-button type="primary" @click="butAdd">添加</el-button>
            </el-tab-pane>
       
          </el-tabs>
        </el-form>
        <el-col></el-col>
      </el-row>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="picVb" width="50%" class="previmg">
      <img :src="picviewPath" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      picVb: false,
      picviewPath: "",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      uploadurl: "http://127.0.0.1:8888/api/private/v1/upload",
      cateList: [],
      activeIndex: "0",
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //动态参数列表
      manTabData: {},
      onlyTabData: {},

      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: " ",
        goods_number: " ",
        goods_cat: [],
        //图片的数组
        pics: [],
        goods_introduce: "",
        // 即将要提交的保存数组
       attrs:[]
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
  
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品类型", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    butAdd() {
      this.$refs.addFormRef.validate(async(meg) => {
        if (!meg) {
          return this.$message.error("填写必要的表单项");
        }
        //ldash 深拷贝 cloneDeep(obj)因为绑定的处理数据不同直接修改会报错
        const form=_.cloneDeep(this.addForm)
        form.goods_cat =form.goods_cat.join(",");
        
        //处理动态
        this.manTabData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
        this.addForm.attrs.push(newInfo)
        })
          
        //处理静态
        this.onlyTabData.forEach(item=>{
        const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })
        form.attrs=this.addForm.attrs
       const { data: res } = await this.$http.post(
         'goods',form );
       
        if (res.meta.status !== 201) {
           console.log(res.data)
          return this.$message.error("添加失败");
        }
         this.$message.success("添加成功");
         this.$router.push('/goods')
      });
    },
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.cateList = res.data;
    },
    selectChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return true;
      }
      return false;
    },
    bfactive(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("选择商品分类");
        return false;
      }
    },
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取失败");
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manTabData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取失败");
        }
        this.onlyTabData = res.data;
        // res.data.forEach((item) => {
        //   item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // });
        // this.manTabData = res.data;
      }
    },
    picPreview(file) {
      this.picviewPath = file.response.data.url;
      this.picVb = true;
    },
    picRemove(file) {
      const filePath = file.response.data.tmp_path;
      const picindex = this.addForm.pics.findIndex((db) => db.pic === filePath);
      this.addForm.pics.splice(picindex, 1);
      console.log(this.addForm);
    },
    picsuccess(res) {
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
     
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.previmg img {
  width: 100%;
}
</style>
