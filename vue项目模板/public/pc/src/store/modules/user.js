import { getStore, setStore } from "@/utils/store";
import {common} from "@/api";
const user = {
  state: {
    userInfo:
      getStore({
        name: "userInfo"
      }) || []
  },
  actions: {
    async GetUserInfo({commit}){
      const { data } = await common.getUserInfo();
      commit("SET_USER_INFO",data);
    }
  },
  mutations: {
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo;
      setStore({
        name: "userInfo",
        content: state.userInfo
      });
    }
  }
};
export default user;
