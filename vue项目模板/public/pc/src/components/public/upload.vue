<template>
  <div>
    <el-upload
      class="avatar-uploader"
      :action="imgUploadUrl"
      accept=".jpg, .jpeg, .png, .JPG, .JPEG"
      :show-file-list="false"
      :on-success="handleUploadSuccess"
      :before-upload="beforeUpload"
    >
      <img v-if="imageUrl" :src="getImgUrl" class="avatar" />
      <i v-else class="el-icon-picture-outline avatar-uploader-icon"></i>
      <div slot="tip" class="tip">
        <slot name="tip"></slot>
        {{ getTip }}
      </div>
      <div slot="trigger" class="trigger">
        <slot name="upload"></slot>
      </div>
      <div class="preview" v-if="imageUrl">
        <i class="el-icon-zoom-in" @click="imgShow = true"></i>
      </div>
    </el-upload>
    <el-dialog :visible.sync="imgShow">
      <img :src="getImgUrl" class="img" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: ["tip", "imgUrl"],
  data() {
    return {
      imageUrl: "",
      imgShow: false
    };
  },
  watch: {
    imgUrl() {
      this.setImg();
    }
  },
  created() {
    this.setImg();
  },
  filters: {
    formatImg(val) {
      let imgUrl = "";
      if (val.includes("http") || val.includes("https")) {
        imgUrl = val;
      } else {
        imgUrl = this.rootPath + val;
      }
      return imgUrl;
    }
  },
  computed: {
    imgUploadUrl() {
      return this.$store.state.common.uploadUrl;
    },
    imgInfo() {
      return { url: this.imageUrl };
    },
    getImgUrl() {
      let imgUrl = this.imageUrl,
        rootPath = this.$store.state.common.rootPath;
      if (!imgUrl.includes("http") || !imgUrl.includes("https")) {
        imgUrl = rootPath + this.imageUrl;
      }
      return imgUrl;
    },
    getTip() {
      let tip = "";
      if (this.tip) {
        tip = this.tip;
      }
      return tip;
    }
  },
  methods: {
    setImg() {
      this.imageUrl = this.imgUrl;
    },
    // 上传成功
    handleUploadSuccess(res) {
      if (res.code == 200) {
        // this.handleDelImg();
        this.imageUrl = res.data.files;
        this.uploadDone();
      }
      // this.uploadDone();
    },
    // 删除图片
    // handleDelImg() {
    //   this.$axios
    //     .post("/admin/index/delimg", this.$qs.stringify({ imgs: data }))
    //     .then(res => {
    //       this.imageUrl = "";
    //       this.uploadDone();
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // },
    // 判断上传图片类型
    beforeUpload(file) {
      const isImage = file.type.includes("image");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        this.$message.error("只能上传图片格式!");
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过 2MB!");
      }
      return isImage && isLt2M;
    },
    // 更新父组件信息
    uploadDone() {
      this.$emit("done", this.imgInfo);
    }
  }
};
</script>
<style lang="less" scoped>
.avatar-uploader {
  height: 188px;
  width: 108px;
  position: relative;
  .preview {
    display: none;
  }
  &:hover {
    .preview {
      display: block;
      position: absolute;
      height: 108px;
      width: 108px;
      background: rgba(0, 0, 0, 0.4);
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      i {
        font-size: 20px;
        cursor: pointer;
      }
    }
  }
}
.img {
  display: block;
  width: 100%;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #d9d9d9;
  width: 108px;
  height: 108px;
  line-height: 108px;
  text-align: center;
  border: 1px dashed #d9d9d9;
}
.avatar {
  width: 108px;
  height: 108px;
  display: block;
}
.tip {
  position: absolute;
  left: 120px;
  bottom: 20px;
}
/deep/.el-upload {
  border-radius: 6px;
  cursor: pointer;
  position: absolute;
  overflow: hidden;
  height: 168px;
  width: 108px;
}
.trigger {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>
