<template>
  <div class="img-contain">
    <div class="posting-uploader">
      <van-uploader
        v-model="postData"
        :after-read="onRead"
        accept="'image/*'"
        result-type="file"
        :max-size="10485760"
        :preview-image="false"
        @oversize="oversize"
      >
        <img
          v-if="imgData.url"
          :src="imgData.url"
        >
        <van-icon
          v-else
          name="plus"
        />
      </van-uploader>
    </div>
  </div>
</template>

<script>
import { publicHttpInteractor } from "@/api";
export default {
  props: {
    imageList: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      postData: [],
      imgData: {}
    };
  },
  watch: {
    imageList(value) {
      this.postData = value;
    }
  },
  mounted() {
    this.imgData = this.imageList ? this.imageList : {};
  },
  methods: {
    oversize() {
      this.$notify({ type: "danger", message: "请上传10M以内的图片", duration: 2000 });
    },
    async onRead(file) {
      let formData = new FormData();
      formData.append("file", file.file);
      let { data, code, msg} = await publicHttpInteractor.uploadFile(formData);
      if (code === 200) {
        this.imgData = {
          url: data.rootDir + data.files,
          data: data
        };
        this.$emit("change",this.imgData);
      } else {
        this.$notify({ type: "danger", message: msg, duration: 2000 });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.img-contain {
  margin-top: 10px;
  padding-bottom: 10px;
  background-color: white;
  padding-top: 10px;
  img {
    display: block;
    width: 100%;
  }
  .posting-uploader {
    display: flex;
    flex-direction: row;
    background-color: #efefef;
    margin: 0;
    padding: 0;
    width: 70px;
    height: 70px;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    overflow: hidden;
    .van-uploader,
    /deep/.van-uploader__wrapper,
    /deep/.van-uploader__input-wrapper {
      width: 100%;
      height: 100%;
    }
    /deep/.van-uploader__input-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    i {
      font-size: 20px;
      color: #999;
    }
    .imgPreview {
      width: 70px;
      height: 70px;
    }
  }
}
</style>
