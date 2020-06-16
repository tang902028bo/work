<template>
  <div
    v-if="_show"
    class="picker-address"
  >
    <van-field
      readonly
      clickable
      name="area"
      :value="area"
      label="所在地区"
      placeholder="请选择所在地区"
      input-align="right"
      right-icon="arrow"
      @click="showPicker = true;"
    />
    <van-field
      v-model="detail"
      clickable
      name="area"
      class="detail"
    >
      <template #input>
        <textarea
          v-model="detail"
          placeholder="详细地址：如道路"
        />
      </template>
    </van-field>
    <van-popup
      v-model="showPicker"
      position="bottom"
    >
      <van-area
        :area-list="areaList"
        :value="areaCode"
        @confirm="handlePickerConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
    <div class="foot">
      <van-button
        size="large"
        @click="handleCancel"
      >
        取消
      </van-button>
      <van-button
        size="large"
        type="info"
        color="#2F7DCD"
        native-type="button"
        :loading="button.loading"
        :loading-text="button.loadingTxt"
        @click="handleConfirm"
      >
        保存
      </van-button>
    </div>
  </div>
</template>
<script>
import { qqMaps } from "@/plugin";
import AreaList from "@/assets/js/area";
export default {
  name: "PickerAddress",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showPicker: false,
      areaList: AreaList,
      area: "",
      detail: "",
      areaData: "",
      areaCode: "",
      button: {
        loading: false,
        loadingTxt: "保存中"
      }
    };
  },
  computed: {
    _show: {
      get: function() {
        return this.show;
      },
      set: function(val) {
        this.$emit("update:show", val);
      }
    }
  },
  watch: {
    data: {
      handler(val) {
        this.area = val.area ? val.area : "";
        this.detail = val.detail ? val.detail : "";
        this.areaCode = val.data
          ? val.data.map(item => item.code).join(",")
          : "";
      }
    },
    deep: true
  },
  methods: {
    async handlePickerConfirm(values) {
      let names = values.map(item => item.name);
      this.area =
        names[0] === names[1]
          ? `${names[1]} ${names[2]}`
          : (names = names.join(" "));
      this.showPicker = false;
      this.areaData = values;
      this.areaCode = values.map(item => item.code).join(",");
    },
    async handleConfirm() {
      if (this.area === "") {
        this.$notify({ type: "danger", message: "请选择地区", duration: 1000 });
        return false;
      }
      if (this.detail == "") {
        this.$notify({
          type: "danger",
          message: "请输入详情地址",
          duration: 1000
        });
        return false;
      }
      this.button.loading = true;
      const location = await qqMaps.geocoder(this.area + this.detail);
      this.button.loading = false;
      let info = {
        area: this.area,
        detail: this.detail,
        location: location,
        data: this.areaData
      };
      this.$emit("done", info);
      this._show = false;
    },
    handleCancel() {
      this._show = false;
      this.button.loading = false;
    }
  }
};
</script>
<style lang="less" scoped>
.picker-address {
  position: fixed;
  height: 100%;
  width: 100%;
  background: #f5f5f5;
  overflow: auto;
  top: 0;
  left: 0;
  z-index: 999;
  .van-cell {
    padding: 20px;
    background: #fff;
  }
  .detail {
    border-top: 1px solid #e8e8e8;
    textarea {
      box-sizing: border-box;
      width: 100%;
      display: block;
      border: none;
      min-height: 100px;
    }
  }
  .foot {
    background: #ffffff;
    position: fixed;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    bottom: 0;
    .van-button {
      margin: 0 5px;
    }
  }
}
</style>