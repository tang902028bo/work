const baseURL = process.env.NODE_ENV === "development" ? "/api" : "";
const common = {
  state: {
    uploadUrl: baseURL + "/admin/index/img_upload",
    rootPath: ""
  },
  mutations: {
    SET_ROOT_PATH: (state, path) => {
      state.rootPath = path;
    }
  }
};
export default common;
