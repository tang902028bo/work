<template>
  <el-dialog
    title="请选择人员"
    :visible.sync="_show"
    width="550px"
    class="pickUserBox"
  >
    <div v-loading="loading">
      <el-row>
        <el-col :span="12" class="left-box" style="position:relative;">
          <el-row>
            <el-col :span="18" height>
              <el-input
                style="width:100%;"
                clearable
                v-model="keyword"
                @clear="btnSearch"
                @keyup.enter.native="btnSearch"
                placeholder="搜索部门、成员"
                size="small"
              ></el-input>
            </el-col>
            <el-col :span="5" style="margin-left:4px;">
              <el-button
                icon="el-icon-search"
                size="small"
                @click="btnSearch"
              ></el-button>
            </el-col>
          </el-row>
          <div class="searchBox box" v-if="searchShow">
            <span v-if="!searchList.length && !loading"
              >没有搜索到相关内容</span
            >
            <div
              v-for="item in searchList"
              :key="item.id"
              @click="checkChange(item)"
            >
              <i :class="item.isuser ? 'el-icon-user' : 'el-icon-folder'"></i>
              {{ item.label }}
            </div>
          </div>
          <div v-if="isLoad" class="box" v-show="!searchShow">
            <el-tree
              lazy
              node-key="id"
              ref="treeDom"
              :default-expanded-keys="['D0']"
              :check-strictly="true"
              :check-on-click-node="true"
              :expand-on-click-node="false"
              :props="{ isLeaf: data => Boolean(data.isuser) }"
              :load="loadNode"
              @check="checkChange"
              v-if="_show"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                  <i
                    :class="data.isuser ? 'el-icon-user' : 'el-icon-folder'"
                  ></i>
                  {{ node.label }}
                </span>
              </span>
            </el-tree>
          </div>
        </el-col>
        <el-col :span="12" class="right-box">
          <div class="selectedNum">
            已选中（
            {{
              Object.keys(checkedList.user).length +
                Object.keys(checkedList.dep).length
            }}
            ）
            <input
              type="text"
              v-model="checkedList.filter"
              placeholder="按名称筛选"
            />
          </div>

          <div class="checkedBox">
            <!-- 已选部门 -->
            <div v-for="(value, key) in checkedList.dep" :key="key">
              <div
                :key="key"
                v-show="
                  !checkedList.filter ||
                    (checkedList.filter &&
                      value.indexOf(checkedList.filter) > -1)
                "
              >
                <i class="el-icon-folder"></i>
                {{ value }}
                <i
                  class="el-icon-close fr handle"
                  @click="delChecked('dep', key)"
                ></i>
              </div>
            </div>
            <!-- 已选用户 -->
            <div v-for="(value, key) in checkedList.user" :key="key">
              <div
                :key="key"
                v-show="
                  !checkedList.filter ||
                    (checkedList.filter &&
                      value.indexOf(checkedList.filter) > -1)
                "
              >
                <i class="el-icon-user"></i>
                {{ value }}
                <i
                  class="el-icon-close fr handle"
                  @click="delChecked('user', key)"
                ></i>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer alignR pd20">
        <el-button @click="_show = false" size="small">取 消</el-button>
        <el-button type="primary" @click="btnSave" size="small"
          >确 定</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "pickUser",
  //是否显示; 已选用户; 已选部门; 是否单选; 类型:默认部门.keshi按照科室查询; 只显示同级并不包含自己; 不将部门转换为用户; 是否为问诊; 是否开启查询类型切换
  props: [
    "show",
    "selectedUser",
    "selectedDep",
    "radio",
    "type",
    "onlyShowSiblings",
    "noConversionDep",
    "noGroupUser",
    "diag",
    "isChangeType"
  ],
  computed: {
    _show: {
      get: function() {
        return this.show;
      },
      set: function(val) {
        this.$emit("update:show", val);
      }
    },
    _selectedUser: {
      get: function() {
        return this.selectedUser || {};
      },
      set: function(val) {
        this.$emit("update:selectedUser", val);
      }
    },
    _selectedDep: {
      get: function() {
        return this.selectedDep || {};
      },
      set: function(val) {
        this.$emit("update:selectedDep", val);
      }
    }
  },
  watch: {
    _show(isShow) {
      //打开时初始化数据
      if (isShow) {
        this.keyword = "";
        this.searchShow = false;
        this.loading = true;
        this.isLoad = true;
        if (JSON.stringify(this._selectedDep) === '{"":""}')
          this.checkedList.dep = {};
        else
          this.checkedList.dep = JSON.parse(JSON.stringify(this._selectedDep));

        if (JSON.stringify(this._selectedUser) === '{"":""}')
          this.checkedList.user = {};
        else
          this.checkedList.user = JSON.parse(
            JSON.stringify(this._selectedUser)
          );

        // this.$nextTick().then(e => {
        //   //更新选中状态到Tree组件
        //   // this.$refs['treeDom'].setCheckedKeys( Object.keys(this._selectedUser) );
        // });
      }
    }
  },
  data() {
    return {
      loading: true,
      keyword: "",
      checkedList: { user: {}, dep: {}, filter: "" },
      userParentId: {},
      searchShow: false,
      searchList: [],
      activeName: "",
      dataType: "",
      isLoad: true
      // currentDepart:{
      //     parentId: this.$store.state.user.d_info.parent_id,
      //     departmentName: this.$store.state.user.d_info.d_name
      // }
    };
  },
  methods: {
    /**动态加载 */
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.$axios
          .post("/structure/Query/getNodeInit")
          .then(res => {
            let { data } = res;
            let departData = data;
            return resolve(departData);
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.$axios
          .post("/structure/Query/getNodeChild", { parentId: node["key"] })
          .then(res => {
            return resolve(res.data);
          });
      }
    },
    /**tree 选中状态改变 */
    checkChange(data) {
      let list = this.checkedList[data.isuser ? "user" : "dep"];
      let isChecked = !list[data["id"]];

      //单选模式
      if (this.radio) {
        if (!data.isuser) {
          event.target.tagName == "SPAN" &&
            event.target.parentNode.previousElementSibling.click();
          event.target.className == "el-tree-node__content" &&
            event.target.firstElementChild.click();
          return;
        } else {
          let key = Object.keys(list)[0];
          this.$delete(list, key);
          //更新选中状态到Tree组件
          // this.$refs['treeDom'].setChecked(key+"",false);
        }
      }
      if (isChecked) this.$set(list, data["id"], data["label"]);
      else this.$delete(list, data["id"]);
    },
    /** 删除选中的项 */
    delChecked(type, key) {
      this.$delete(this.checkedList[type], key);

      //更新选中状态到Tree组件
      // this.$refs['treeDom'].setChecked(key+"",false);
    },
    btnSave: function() {
      this.$emit("done", this.checkedList);
      let selectedDepId = Object.keys(this.checkedList.dep).map(id =>
        id.substr(1)
      );
      let selectedDepName = Object.values(this.checkedList.dep);
      if (!this.noGroupUser && selectedDepId.length) {
        this.loading = true;
        this.$axios
          .post("/structure/Query/getNodeUser", {
            dep: selectedDepId.join(),
            type: this.type
          })
          .then(res => {
            this._show = false;
            console.log(res);
            //清空部门选择,并加入到人员选择
            this.checkedList.dep = {};
            res.data.forEach(item => {
              this.checkedList.user[item["id"]] = item["label"];
            });

            //传递到主页面
            this._selectedUser = JSON.parse(
              JSON.stringify(this.checkedList.user)
            );
            console.log(this._selectedUser, "us");
            this.$emit("done", {
              id: Object.keys(this.checkedList.user),
              name: Object.values(this.checkedList.user),
              list: this.checkedList.user
            });
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this._show = false;
        //传递到主页面
        this._selectedUser = JSON.parse(JSON.stringify(this.checkedList.user));
        console.log(this.checkedList.user);
        console.log(this._selectedUser);
        let userId = Object.keys(this.checkedList.user);
        let emitData = {
          id: userId,
          name: Object.values(this.checkedList.user),
          list: this.checkedList.user
        };
        //科室需要所属部门
        if (this.type == "keshi" && !this.noGroupUser) {
          console.log(this.userParentId);
          emitData["parentId"] = userId.map(val =>
            this.userParentId[val].substr(1)
          );
          console.log(emitData);
        }
        if (selectedDepId) {
          emitData["depId"] = selectedDepId;
          emitData["depName"] = selectedDepName;
        }
        this.$emit("done", emitData);
      }
    },
    btnSearch: function() {
      this.searchShow = Boolean(this.keyword);
      if (this.searchShow) {
        this.loading = true;
        this.$axios
          .post("/structure/Query/getNodeSearch", {
            type: this.type,
            keyword: this.keyword
          })
          .then(res => {
            this.searchList = res.data;
          })
          .finally(() => {
            this.loading = false;
          });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.pickUserBox {
  .el-input {
    .el-input__inner {
      width: 100%;
    }
  }
  .searchBox div {
    line-height: 20px;
    padding: 4px 8px;
    div:hover {
      background: #f5f7fa;
    }
  }
  /deep/.el-dialog__body {
    padding: 20px;
  }
  .box {
    height: 300px;
    overflow: auto;
    margin-top: 10px;
  }
  .left-box {
    border-right: 1px solid #ededed;
  }
  .right-box {
    padding-left: 20px;
    .el-icon-close {
      float: right;
      cursor: pointer;
    }
    .selectedNum {
      overflow: hidden;
      position: relative;
      padding-top: 2px;
      border-bottom: 1px solid #ededed;
      padding-bottom: 10px;
      color: #959595;
      input {
        position: absolute;
        border: 0;
        text-align: right;
        width: 50%;
        right: 0;
        outline: none;
        line-height: 17px;
      }
    }
  }
  input::-webkit-input-placeholder {
    color: #c5c5c5;
  }
  .checkedBox {
    margin-top: 10px;
    line-height: 24px;
    & > div {
      transition: 0.2s;
      &:hover {
        background: #f8f8f8;
      }
    }
    i {
      margin-top: 6px;
    }
  }
  .dialog-footer {
    text-align: right;
    padding-top: 20px;
  }
}
</style>
