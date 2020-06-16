const getters = {
  userInfo: state => state.user.userInfo,
  rootPath: state => state.common.rootPath,
  uploadUrl: state => state.common.uploadUrl
};
export default getters;
