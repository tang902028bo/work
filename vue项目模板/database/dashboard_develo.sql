/*
 Navicat Premium Data Transfer

 Source Server         : dev
 Source Server Type    : MySQL
 Source Server Version : 50729
 Source Host           : dashboard.mgtx-tech-dev.mgtx.com.cn:3306
 Source Schema         : dashboard_develo

 Target Server Type    : MySQL
 Target Server Version : 50729
 File Encoding         : 65001

 Date: 14/06/2020 22:55:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for a_app_settings
-- ----------------------------
DROP TABLE IF EXISTS `a_app_settings`;
CREATE TABLE `a_app_settings`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `app_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '应用id',
  `app_secret` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'app密钥',
  `app_id` int(11) NULL DEFAULT NULL COMMENT 'app_id',
  `visble_dep_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '可见部门，用，分隔',
  `app_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '唯一app识别码',
  `water` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '水印文字内容',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `app_code`(`app_code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = 'app配置信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_app_settings
-- ----------------------------
INSERT INTO `a_app_settings` VALUES (6, 'wwa0b0b8a275ac94b8', 'KlnH0wrqEoaCB6az8LRg94An8kI-UHPp4ACdjYJlV6Y', 1000072, NULL, 'admin', NULL);
INSERT INTO `a_app_settings` VALUES (8, 'wwa0b0b8a275ac94b8', 'zGeABj-n4lXeZKGolsQbnn85Zpx_17Gk9ZOtxSUwyqQ', 1000078, NULL, 'api', NULL);

-- ----------------------------
-- Table structure for a_company_info
-- ----------------------------
DROP TABLE IF EXISTS `a_company_info`;
CREATE TABLE `a_company_info`  (
  `id` int(11) NOT NULL,
  `corpid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '企业id：corpid',
  `corp_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_company_info
-- ----------------------------
INSERT INTO `a_company_info` VALUES (1, 'wwa0b0b8a275ac94b8', '深圳中物兴华有限公司');

-- ----------------------------
-- Table structure for a_department
-- ----------------------------
DROP TABLE IF EXISTS `a_department`;
CREATE TABLE `a_department`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `wx_depid` int(255) NULL DEFAULT NULL,
  `dep_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `parentid` int(11) NULL DEFAULT NULL,
  `list_order` bigint(20) NULL DEFAULT NULL,
  `soft_delete` int(11) NOT NULL DEFAULT 1,
  `leader` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '部门的直属主管',
  `tags` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '部门所属标签',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_department
-- ----------------------------
INSERT INTO `a_department` VALUES (1, 1, '深圳中物兴华有限公司', 0, 100000000, 1, '', '');
INSERT INTO `a_department` VALUES (2, 2, '总部', 1, 100000000, 1, '15102821500', '');
INSERT INTO `a_department` VALUES (3, 3, '深圳区域', 1, 99999000, 1, '13540145986,13980092748', '');
INSERT INTO `a_department` VALUES (4, 4, '南京区域', 1, 99998000, 1, 'wangkun', '');
INSERT INTO `a_department` VALUES (5, 5, '上海区域', 1, 99997000, 1, '', '');
INSERT INTO `a_department` VALUES (6, 6, '宁波区域', 1, 99996000, 1, '', '');
INSERT INTO `a_department` VALUES (12, 12, '中山区域', 1, 99995000, 1, '', '');
INSERT INTO `a_department` VALUES (13, 13, '佛山区域', 1, 99994000, 1, '19950154526', '');
INSERT INTO `a_department` VALUES (14, 14, '职能', 3, 100000000, 1, '15102821500', '');
INSERT INTO `a_department` VALUES (15, 15, '罗湖店', 3, 99999000, 1, '', '');
INSERT INTO `a_department` VALUES (16, 16, '竹子林店', 3, 99998000, 1, '', '');
INSERT INTO `a_department` VALUES (17, 17, '南山店', 3, 99997000, 1, '', '');
INSERT INTO `a_department` VALUES (18, 18, '宝安店', 3, 99996000, 1, '', '');
INSERT INTO `a_department` VALUES (19, 19, '代煎中心', 3, 99995000, 1, '', '');
INSERT INTO `a_department` VALUES (20, 20, '香竹店', 3, 99994000, 1, '', '');
INSERT INTO `a_department` VALUES (21, 21, '总裁办', 2, 100000000, 1, '', '');
INSERT INTO `a_department` VALUES (22, 22, '客服部', 2, 99999000, 1, '', '');
INSERT INTO `a_department` VALUES (23, 23, '财务部', 2, 99998000, 1, '13980092748', '');
INSERT INTO `a_department` VALUES (24, 24, '法务部', 2, 99997000, 1, '', '');
INSERT INTO `a_department` VALUES (25, 25, '行政部', 2, 99996000, 1, '', '');
INSERT INTO `a_department` VALUES (26, 26, '人力资源部', 2, 99995000, 1, '', '');

-- ----------------------------
-- Table structure for a_option
-- ----------------------------
DROP TABLE IF EXISTS `a_option`;
CREATE TABLE `a_option`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `autoload` tinyint(3) UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否自动加载;1:自动加载;0:不自动加载',
  `option_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '配置名',
  `option_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '配置值',
  `qiniu_value` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '七牛云配置',
  `email_value` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '邮件配置',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `option_name`(`option_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '全站配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_option
-- ----------------------------

-- ----------------------------
-- Table structure for a_power
-- ----------------------------
DROP TABLE IF EXISTS `a_power`;
CREATE TABLE `a_power`  (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限中文',
  `code` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限代码',
  `type` tinyint(2) NOT NULL COMMENT '权限分类,1: 组织架构;2: 角色管理;3:司机管理;4:车辆管理;5:车辆品牌管理;6:车辆类型管理;7:用车管理;8:用车审批;9:数据统计',
  `sort` int(10) NULL DEFAULT 1 COMMENT '排序，从小到大',
  `type_sort` int(11) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '操作权限' ROW_FORMAT = COMPACT;

-- ----------------------------
-- Records of a_power
-- ----------------------------
INSERT INTO `a_power` VALUES (1, '查看', 'dep_user', 1, 1, 1);
INSERT INTO `a_power` VALUES (2, '编辑', 'edit_user', 1, 2, 1);
INSERT INTO `a_power` VALUES (3, '同步组织架构', 'sys', 1, 3, 1);
INSERT INTO `a_power` VALUES (4, '同步标签', 'sys_tags', 1, 4, 1);
INSERT INTO `a_power` VALUES (5, '查看', 'role_manger', 2, 1, 1);
INSERT INTO `a_power` VALUES (7, '新增/编辑角色', 'edit_role', 2, 3, 1);
INSERT INTO `a_power` VALUES (8, '删除角色', 'del_role', 2, 4, 1);
INSERT INTO `a_power` VALUES (9, '角色权限编辑', 'edit_role_limit', 2, 5, 1);
INSERT INTO `a_power` VALUES (10, '查看', 'driver_manger', 3, 1, 1);
INSERT INTO `a_power` VALUES (11, '新增', 'add_driver', 3, 2, 1);
INSERT INTO `a_power` VALUES (12, '编辑', 'edit_driver', 3, 3, 1);
INSERT INTO `a_power` VALUES (13, '删除', 'del_driver', 3, 4, 1);
INSERT INTO `a_power` VALUES (14, '查看', 'car', 4, 1, 1);
INSERT INTO `a_power` VALUES (15, '新增', 'add_car', 4, 2, 1);
INSERT INTO `a_power` VALUES (16, '编辑', 'edit_car', 4, 3, 1);
INSERT INTO `a_power` VALUES (17, '删除', 'del_car', 4, 4, 1);
INSERT INTO `a_power` VALUES (18, '查看', 'car_brand', 5, 1, 1);
INSERT INTO `a_power` VALUES (19, '新增', 'add_car_brand', 5, 2, 1);
INSERT INTO `a_power` VALUES (20, '编辑', 'edit_car_brand', 5, 3, 1);
INSERT INTO `a_power` VALUES (21, '删除', 'del_car_brand', 5, 4, 1);
INSERT INTO `a_power` VALUES (22, '查看', 'car_type', 6, 1, 1);
INSERT INTO `a_power` VALUES (23, '新增', 'add_car_type', 6, 2, 1);
INSERT INTO `a_power` VALUES (24, '编辑', 'edit_car_type', 6, 3, 1);
INSERT INTO `a_power` VALUES (25, '删除', 'del_car_type', 6, 4, 1);
INSERT INTO `a_power` VALUES (26, '申请记录查看', 'apply_car', 7, 1, 1);
INSERT INTO `a_power` VALUES (27, '用车记录查看', 'use_car', 7, 2, 1);
INSERT INTO `a_power` VALUES (28, '车辆出场/回场查看', 'out_car', 7, 3, 1);
INSERT INTO `a_power` VALUES (29, '车辆出场/回场检查', 'out_check_car', 7, 4, 1);
INSERT INTO `a_power` VALUES (30, '查看', 'use_car_apply', 8, 1, 1);
INSERT INTO `a_power` VALUES (31, '查看', 'data_dtatistics', 9, 1, 1);

-- ----------------------------
-- Table structure for a_role
-- ----------------------------
DROP TABLE IF EXISTS `a_role`;
CREATE TABLE `a_role`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_system` int(11) NOT NULL DEFAULT 0 COMMENT '1系统默认',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_role
-- ----------------------------
INSERT INTO `a_role` VALUES (1, '超级管理员', 1);
INSERT INTO `a_role` VALUES (2, '调度人', 1);
INSERT INTO `a_role` VALUES (3, '车队主管', 1);
INSERT INTO `a_role` VALUES (9, '1', 0);
INSERT INTO `a_role` VALUES (10, '协理人', 0);

-- ----------------------------
-- Table structure for a_role_power
-- ----------------------------
DROP TABLE IF EXISTS `a_role_power`;
CREATE TABLE `a_role_power`  (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `role_id` int(10) NOT NULL COMMENT '角色id',
  `code` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限关键词',
  `type` int(2) NOT NULL COMMENT '权限分类',
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '状态 1 为拥有该权限 0为 不曾拥有',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = COMPACT;

-- ----------------------------
-- Records of a_role_power
-- ----------------------------
INSERT INTO `a_role_power` VALUES (1, 10, 'dep_user', 1, 1);
INSERT INTO `a_role_power` VALUES (2, 10, 'edit_user', 1, 1);
INSERT INTO `a_role_power` VALUES (3, 10, 'sys', 1, 1);

-- ----------------------------
-- Table structure for a_tags
-- ----------------------------
DROP TABLE IF EXISTS `a_tags`;
CREATE TABLE `a_tags`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tagid` int(11) NOT NULL COMMENT '企业微信的标签id',
  `tag_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标签名称',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) NOT NULL,
  `parent_id` enum('0') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '0',
  `status` enum('0','1') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '1' COMMENT '状态 0禁用 1启用',
  `sort` int(255) NULL DEFAULT 100,
  `is_ban` int(255) NULL DEFAULT 1 COMMENT '是否禁用 1否  2禁用',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = COMPACT;

-- ----------------------------
-- Records of a_tags
-- ----------------------------
INSERT INTO `a_tags` VALUES (4, 4, '审单会计', 1587892306, 1591242885, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (5, 5, '财务经理', 1587892306, 1591242886, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (6, 6, '财务总监', 1587892306, 1591242886, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (7, 7, 'CFO', 1587892306, 1591242886, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (8, 8, '副总裁', 1587892306, 1591242886, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (9, 9, '董事长', 1587892306, 1591242887, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (10, 10, '做账会计', 1587892306, 1591242887, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (11, 11, '人事经理', 1587892306, 1591242887, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (12, 12, '法务负责人', 1587892306, 1591242887, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (13, 13, '区域财务经理', 1587892306, 1591242887, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (14, 14, '区域总', 1587892306, 1591242888, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (15, 15, '大区总', 1587892306, 1591242888, '0', '1', 100, 1);
INSERT INTO `a_tags` VALUES (16, 16, '区域人事经理', 1587892306, 1591242888, '0', '1', 100, 1);

-- ----------------------------
-- Table structure for a_user
-- ----------------------------
DROP TABLE IF EXISTS `a_user`;
CREATE TABLE `a_user`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户id及企业微信userid',
  `user_login` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录账号',
  `user_pass` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录密码',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '人员名称',
  `department` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '部门多个用,分隔',
  `mobile` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '手机号',
  `position` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '职务',
  `gender` int(11) NULL DEFAULT NULL COMMENT '性别 1男，2女，0表示未定义',
  `email` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '头像',
  `telephone` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '座机',
  `enable` int(11) NULL DEFAULT 1 COMMENT '成员启用状态。1表示启用的成员，0表示被禁用。',
  `status` int(11) NULL DEFAULT NULL COMMENT '激活状态: 1=已激活，2=已禁用，4=未激活 已激活代表已激活企业微信或已关注微工作台（原企业号）。未激活代表既未激活企业微信又未关注微工作台（原企业号）。',
  `qr_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '员工个人二维码',
  `external_position` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '对外职务',
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '地址',
  `soft_delete` int(10) NULL DEFAULT 1,
  `last_login_ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `last_login_time` int(11) NULL DEFAULT NULL,
  `manage_class` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '管理班级',
  `user_status` tinyint(3) NULL DEFAULT 1 COMMENT '用户状态;0:禁用,1:正常,2:未验证',
  `u_roles` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '角色',
  `face_img` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '人脸存档原图  正上左右四个方位的人脸图片',
  `baidu_face_token` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '百度人脸图片的token 唯一 json数组  正上左右四个方位的人脸',
  `face_machine` tinyint(1) NULL DEFAULT 2 COMMENT '是否已把人脸图片存在人脸识别设备中 1为是  2为否',
  `is_leader_in_dept` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `new_user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `u_tags` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '人员所属标签',
  `face_true` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否已完成录入 1是 0否',
  `entry_date` date NULL DEFAULT NULL COMMENT '入职日期',
  `formal_date` date NULL DEFAULT NULL COMMENT '转正时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 366 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of a_user
-- ----------------------------
INSERT INTO `a_user` VALUES (1, 'admin', 'admin', '1303b6eee522d4e5eb8f36e5df8800cb', '超级管理员', '', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 1, '171.221.15.236', 1591982434, NULL, 1, '1', NULL, NULL, 2, NULL, NULL, NULL, 0, NULL, NULL);
INSERT INTO `a_user` VALUES (310, 'ZhangChunTao', 'ZhangChunTao', 'b9f1ac95d5f52c178352529ae8e819f1', '章春涛', '13,1', '18782963285', '', 1, '', 'http://wework.qpic.cn/bizmail/UwuNPIEAyy5UVKMsnP5VWqWe82PgBicFOKxZAibjyRQP1hibMTjiaOooibA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc883830fe0fba0fac', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0,0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (311, 'liucheng', 'liucheng', 'e8e4572b0ec45380dc3698d80475a75c', '章春涛', '5', '18693526479', '科员', 1, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc1ea86a2baf0e0581', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (312, 'wangkun', 'wangkun', 'c5317f146d3d60fc465e5641a5f2b7b5', '王坤', '23,4', '15369864575', '财务总监', 1, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc8570827072ab20d4', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0,1', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (313, 'liaohuarong', 'liaohuarong', '02b7e0485bf2a5b364dc18fa289d0843', '廖华容', '2', '18563214785', '', 0, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc55f4cbc550880266', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (314, 'zhangyongqian', 'zhangyongqian', '4f02fda964d048764484acd6b05b9065', '张永强', '23,4', '18569325612', '财务经理', 1, '', 'http://wework.qpic.cn/bizmail/Ls5lFY9RBFrNDWfUkSRUkwXelEVI5dJBRuSUiaBXbOVMuXaqqJrSTyQ/', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc7bbaae0c03fe7f4a', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0,0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (315, '18180993333', '18180993333', '46769f2ecadca05cad486bd4e49495c5', '刘澄', '2', '18180993333', '', 1, '', 'http://wework.qpic.cn/bizmail/9UXMLYL3DDQOKPcmvVWAw45Bd2ZkaP6bOuJFcPibB1z72LWCW8RrYQw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc0eb505d8b0b0f588', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (316, 'Qiang', 'Qiang', 'fa7457979cddf53322edfa5bc85922dd', '张永强', '1', '13320961146', '', 1, '', 'http://wework.qpic.cn/bizmail/CDz7ePYAg4icF0HMlHpvMB1bzJc7p707ic5mYPZ3ckflSwMGKQ1VYHtA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc6dc9f82ef53e56a5', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (317, '13540145986', '13540145986', 'e066d43dad0c4e6804ff9da4f5c5100a', '彭成雷', '3', '13540145986', '', 1, '', 'http://wework.qpic.cn/bizmail/Z0G0k45AzgWWr0onIEZrFgwly56G1fYBVj3Hsu2dF310QQU3qvdIoQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcd7cc04fea9c60ad2', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '1', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (318, '18200398774', '18200398774', 'dcb0f94cd9c0bd6f5c79a9c79a34d854', '廖梦生', '2', '18200398774', '', 1, '', 'http://wework.qpic.cn/bizmail/b6kWMkKfo9LyInqx1Epb0jD4LJ1iaMTgeXqM3LvmLU3c6dodaCm41MA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc9f89c1b3195b0728', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (319, '13808235693', '13808235693', 'f0ac07dcb450aadc470ec1aecfcca7fc', '刘鸿城', '2,3', '13808235693', '会计 出纳； 财务经理，大区域总。区域总经理,院长', 1, '', 'http://wework.qpic.cn/bizmail/p2cJRjxBjg3DpsU8qrA1icAXHMpRHMic1ibytEhjveo2dUxeX7s4X32AQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc8c9d291219ce96b0', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0,0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (320, 'CongXinSuoYuBuYuJu', 'CongXinSuoYuBuYuJu', '3de524eb25159d4d1558b1e8fd548d91', '都鹏辉', '2', '', '', 1, '', 'http://wework.qpic.cn/bizmail/fZ30L5pCawN7ZGpr4bf0RyTLxoGTq7Hdoj2USScPnkgMeg22qlfflg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc8a72aa1d3513435e', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (321, '18180881992', '18180881992', 'c24f9937e1af8bdb79fcd3fd6b70b207', '章精诚', '3', '18180881992', '', 1, '', 'http://wework.qpic.cn/bizmail/pTQAsOxEZUUeuiaz4d1YAVlYqjoauPGBbXaFKNOSicryxfVhv6UDwFvw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc5113734956380ade', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (322, 'zhy', 'zhy', '9b7d5c84fad3057c85d91fb6dc35643b', '朱海燕', '1', '15884541972', '', 2, '', 'http://wework.qpic.cn/bizmail/uupK5CjMlv4E8WYIgZP3NwW8pN8sJ79Y3iaZdJh43sv8VmhCJ5BATQw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcf5eda5e70dcf0b9a', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (323, '15775701891', '15775701891', '1a093492df5dde514159e23400201dc7', '何俊杰', '1', '15775701891', '', 1, '', 'http://wework.qpic.cn/bizmail/22uWHAlTwyWianXkTT70VEyL3Z5mf1icyhIaGh8grWFKwcynfSYBu2rA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcb10c49e6c0ea4f6c', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (324, 'xiaoxiong', 'xiaoxiong', '84de0b50a337284845604da53de5bac3', '小熊', '1', '18180835930', '', 2, '', 'http://wework.qpic.cn/bizmail/RdECC2WSTJVib7zWSotDxbtsZE3Cw3wOVJ6VWevvHZG8PuNRXao3Sbg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc0e8b7e3532be4be8', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (325, '17608228250', '17608228250', '721d2a23c7dcee10092e2ef510730390', '杨浩', '1', '17608228250', '', 1, '', 'https://wework.qpic.cn/bizmail/cGNlsmrfrGuvkOCEDJAZtSQeXib7BQtE9F0VKsvzAnJ8Z32r7wL6Qfg/0', '', 1, 5, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc6aaa5508d2478fb3', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (326, '18086808207', '18086808207', 'ea76c948b52de4cdbe599f7e5628ad5d', '白旭东', '1', '18086808207', '', 1, '', 'http://wework.qpic.cn/bizmail/g6MlCtribRlIgTrJxku4xF4xDRburd9tjN50XHQu9878CM6EEZaAZuQ/0', '', 1, 5, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vccc4464f4352d642e', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (327, 'zhangli', 'zhangli', '822b3a73c4763e8c5c79340983db663d', '张力', '5', '15815836695', '', 2, '', 'http://wework.qpic.cn/bizmail/ozl3LhZUXH5JJtibDFABLd8vyVSovuAlDdmLwUibMicQoicGN1jPGu2dtg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcc194b40c6a97ce43', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (328, '15102821500', '15102821500', '3a91345ae928c43d48b665e3fe958c3b', '李华涛', '2,14', '15102821500', '区域负责人,人力资源总监,法务部,首席财务官,供应中心总经理,财务总监,副总裁,董事长,各部门负责人,人力资源经理,会计,财务经理,院长,运营中心总经理,区域总经理,大区域总,出纳', 1, '', 'http://wework.qpic.cn/wwhead/duc2TvpEgSSWiaVLaJnssaXUAA031zKrFHI23wuMGWO0iarZZtYeNecEibCtpWawrib367NiaibniaBbm4/0', '', 1, 5, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc6a1d8c4e92239481', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '1,1', NULL, '10', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (329, '18328021082', '18328021082', '2604b1618b1b6a764f3ae38fd410e6b5', '宋雪', '23', '18328021082', '做账会计', 2, '', 'http://wework.qpic.cn/bizmail/0uN2AJLe7EicicAO3QVElMlJXiaAek1wnibibyHEx1iaRwgpBM8pKBwWZuww/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc4ed3e5d7c0e896c5', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (330, 'lhd', 'lhd', '9074d034c6fc7524adb5a06f9ba99ddc', '李华栋', '23', '15198234377', '出纳', 1, '', 'http://wework.qpic.cn/bizmail/vKjr2iamibB3rORA7IgjOvBtez3VOJ3COk5ev899jGD5IxyDnkg2ibBicw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcce60862e63582a6f', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (331, '18384992081', '18384992081', 'a504af65f183bec45c5c1c8b2b60791e', '李浩', '21', '18384992081', '董事长', 1, '', 'http://wework.qpic.cn/bizmail/vz37lQI37e4Cv6DQ3cmaebkVAicVjQBo2c6WqbaEibKI49YSQkOLh5Cg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc1ad95234a614216b', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (332, '13980092748', '13980092748', '9020bd0d4679a0a52073c7077400263e', '汪奇', '23,3', '13980092748', '财务总监,首席财务官,财务经理,运营中心总经理,各部门负责人,副总裁,法务部,人力资源总监,区域负责人', 1, '', 'http://wework.qpic.cn/bizmail/NO0icAf0ckCLzzw6LGHNv9xWsAdCpbIhtBicaWaG3PJ4JWOlmaibQKYsw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc88b4a773618c5294', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '1,1', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (333, '18103215672', '18103215672', '1a7c58cf894cfc06408439e60b46048f', '周书同', '1', '18103215672', '', 1, '', '/static/images/headicon.png', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc2046e86c278e74df', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (334, 'Yuan', 'Yuan', 'b801cc09f40d0db9fce0ae7f165df76a', '赵志远', '1', '15110599777', '', 1, '', 'http://wework.qpic.cn/bizmail/GspGY5x8TYP3STuIL47Mf37Sd7u868RISnBXC5TTaxt6bDias4mr74g/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcc0893118cfac64ea', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (335, 'zhangsn', 'zhangsn', '8190290ee1399649820ea08878f30e13', 'zhangsan', '1', '12345678912', '', 0, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc7015d331e2bf5153', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (336, 'zhangzhaolun', 'zhangzhaolun', '2576e7f88cfcfe8f37b2a76b71a46da4', '\\u5f20\\u5146\\u4f26', '21', '12345678910', '', 0, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vce3d7379a2889d6bd', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (337, 'zhouzhou', 'zhouzhou', 'fc98bd6fe5b5e612f526943534ab859f', '\\u5468\\u5468', '21', '12345678999', '', 0, '', '/static/images/headicon.png', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc94b264718b40e7a0', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (338, '18482103039', '18482103039', 'd912a2a6d3bcd72450346160d54efdf5', '荣洋', '1', '18482103093', '', 1, '', 'https://wework.qpic.cn/bizmail/VR9jAjc4gbEz6CY2iaWpZx06w1H0JvYYonpMibe5ALpoqBBveMaKOx7g/0', '', 1, 5, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcc8b317efc079b935', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (339, '18408244338', '18408244338', '5acc855661621dda09a97f57a5e70b13', '滕恒彬', '1', '18408244338', '', 1, '', 'http://wework.qpic.cn/bizmail/wBbJ109LLo9NLXWDZiaUOv99iaYKByCfh3N1Icw2iba41ML3xmPHQSCaQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vca8faf6e6f61136ca', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (340, '18981819709', '18981819709', 'abe46ab9197462dfa060e54b113e4f24', '沈界', '1', '15228197459', '', 1, '', 'http://wework.qpic.cn/bizmail/8WQmvib9r5nO5otP1znXXQY4ENGicAD2HsUBaPicCQ6TjzuibY9VXCOYUA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc9a7f878546284bb5', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '5', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (341, '17610138067', '17610138067', '604d814afd235adb2c08d28720733ebb', '秦国发', '13,1', '17610138067', '', 1, '', 'http://wework.qpic.cn/bizmail/FGQQwyThQapeR4A1LOJz7xCx7goyia6iaicANG37YZJbPibVml1oEyvlOA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc077f2f5ea725c48a', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0,0', NULL, '5', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (342, '15283829512', '15283829512', 'ee047eebdae9d5816e929854303bd180', '邓春红', '1', '15283829512', '', 2, '', 'http://wework.qpic.cn/bizmail/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc1cdd888503a5e6e1', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (343, '18148136575', '18148136575', 'aa318bb1dc44fcce1e4cc9022e1dfeb7', '高超群', '1', '18148136575', '', 2, '', 'http://wework.qpic.cn/bizmail/1uzk0MdDYaP269dyZruS2xWysclkfPlCFY2cpJDVJwTcdbw4iahqdOw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc41acb13f62284c57', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (344, 'fb2316f492e243eaafbc019448fed6a5', 'fb2316f492e243eaafbc019448fed6a5', '1605b0f0f3ce935d97cf7a461818e595', '郑新', '1', '19983159267', '', 1, '', '/static/images/headicon.png', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcf50cc1c4ac493330', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (345, '19950154526', '19950154526', '5b65c4ac37fe01c20c6f1ee193a219ea', '李刚', '13', '19950154526', '', 1, '', 'https://wework.qpic.cn/wwhead/duc2TvpEgSSWiaVLaJnssaTZBVqkeXflbibmYGun4fL5qEoGedrpB9ptdVSeVUDibWiat1vACicVdMJo/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcf26a4c582d745ea0', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '1', NULL, '5', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (346, '18583969923', '18583969923', '575c30e330f04da717b421449aedd1dc', '郑莉莉', '1', '18583969923', '', 2, '', 'http://wework.qpic.cn/bizmail/LZGUAbkibrkDBUK9Ck0M4Y5aF5Wm4CqeecNC0mjahzaFUULQov0uhibg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcf39f03a6ce35d938', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (347, 'DongJie', 'DongJie', 'a972dbbe1fb4fd0cc6f20a6af88ca679', '董健', '1', '15982432187', '', 1, '', 'http://wework.qpic.cn/bizmail/2ynfK8aXXEsWMvOR1lYrjV2Ia0p3blvia090W5XdKBX5OpFa3ZfWBicw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc6ffed734c7ed8cb0', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (348, 'YiHouYiHou', 'YiHouYiHou', '08908bb9a27101c8ce32a71d6116cf87', '张军', '1', '', '', 1, '', 'http://wework.qpic.cn/bizmail/0kY38fiaqiaParGR27OPnP4kYa7gZOAKXrym1MkvicRbI8jADGCDIb8oQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc235c58c3f3779b0f', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (349, 'NiWang', 'NiWang', '0f8e9fa9f0b061dbf3962177b7bc1418', '郑新', '1', '13880177847', '', 1, '', 'http://wework.qpic.cn/bizmail/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulkn917Vr3tZs1CGRg2nVlBqw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc3f621f082f3cd51c', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (350, '13438908428', '13438908428', '0623fed531072f6c263c9afd86d704e4', '曾焱', '1', '', '', 1, '', 'http://wework.qpic.cn/bizmail/J3XM9JicxhNQv2sibIWlJM137C1DIOXltibpqkCxHm1HcNdVD3wCnvicrA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc73aa761817233e35', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (351, '19949412922', '19949412922', 'ecb4d10780d30e47accea064469dd8cd', '钟世鑫', '1', '19949412922', '', 1, '', 'http://wework.qpic.cn/bizmail/LfoMzzrYE6cZqZKUu5UPYQichKMez6n9SFIChMC6wvsiaqOaaAHHdnwA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc62cb6c8aa6663e9a', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (352, 'robota', 'robota', '6c18b237e634aada9e0c4664d385aa27', 'RobOtA', '1', '', '', 0, '', 'http://wework.qpic.cn/bizmail/LqQLO6JPRlXIkYWWt7YmKKc9eEpfnibPVbLribNJFwicznl52SqSPMr8Q/0', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc8b25bc28010fba95', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (353, '2ba811c6a05b677326fd5a2b8ec6f359', '2ba811c6a05b677326fd5a2b8ec6f359', 'cc13d0c6d6a74aa0c9ecea39b470f8b9', '新&空', '1', '18180490334', '', 1, '', 'https://wework.qpic.cn/bizmail/08VPfMh876YXphlzfib3bsM8mGU5aIwibwhIWQ7Po8dn3GHOBk6ibWgDA/0', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc6fea76c834f235a8', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (354, 'SanRen', 'SanRen', 'c9af1e0185129ef7e5a30b2b84a7997a', '散人', '1', '', '', 1, '', 'http://wework.qpic.cn/bizmail/74g9kibJfyXyZMl5vfuLwyQKyU7qCNULm0uPbxV9VIpjsRjFf0vyVkQ/0', '', 1, 4, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vce290f9b5e638002c', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (355, '15196929525', '15196929525', 'adcf1d5793a4d06b9788f624291fc4ab', '王虹量', '1', '15196929525', '', 1, '', 'http://wework.qpic.cn/bizmail/6eexp3Mg05YLpLg9dhDxIW0MK2YGgCnEGPNgDib4xDukg13OoXibBN0A/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcd068edf8f073bd32', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (356, 'ZhengLuBin', 'ZhengLuBin', '46aa011d9ac5ede5f8868f39b8d7f838', '郑露彬', '1', '13500339148', '', 1, '', 'https://wework.qpic.cn/bizmail/ibYvGe3ZfbVACBfQd6ouwb8hCWtYnl3ssD7uweHfib3zIu3ynmUibxzFw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vca6951a132f758aa8', '', '', 1, '125.84.87.242', 1591264097, NULL, 1, '2', NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (357, '15023637543', '15023637543', 'dba6f2ce436003eee4325f63f23aa290', '唐杨', '1', '15023637543', '', 1, '', 'http://wework.qpic.cn/bizmail/XE7EDUbr7GVZsNdUIKLGy5GOZNBib20ouyiby72ibrGvYlctePtN3qBEw/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc83a04f0bc2ce1b6c', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (358, '18551440806', '18551440806', 'f5e1ea927c2d136f551ba120be0829f8', '王成玉', '1', '18551440806', '', 1, '', 'http://wework.qpic.cn/bizmail/nOWwtSaS8yN3OoOGicPNsOgwwlfVN43icnYHNmHdMuj1DznKAVcO1qvg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc3981435167f81036', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (359, '13551106734', '13551106734', '83d9ac4afd8fadea783afdf6f07f2133', '邱阳', '1', '13551106734', '', 1, '', 'http://wework.qpic.cn/bizmail/xLGRAJ9yLAzRalIsKQVTGRz39POQkbP2cuRcoBNFqCOaU4hZNnXibLA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcb4feb2a958adf307', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (360, '17000006481', '17000006481', '007af2999b48df9f17033c4cc1f2c8d8', '张龙伟', '1', '17000006481', '', 1, '', 'http://wework.qpic.cn/bizmail/4qFD2MiaeiadXH3dhRZFibPIpGmmax7MNqOIxK0Q7S5aysxUK5rng7bTg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcb19e347785285109', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (361, '13648024984', '13648024984', '8959298fc97b3b61aee63136ed57437d', '邓倩', '1', '13648024984', '', 2, '', 'http://wework.qpic.cn/bizmail/uBM2kOwUIl5cGTg6DfZhfIkkkbF9qKzwMhBLh0djQ1JrjzVIeiavfAA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc634647f05608881c', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (362, '13933584688', '13933584688', 'b6f88c9d8cf7cf2a8e9a3656121cc6fc', '崔志远', '1', '13933584688', '', 1, '', 'http://wework.qpic.cn/bizmail/GibxTDJxTe8GTrATnBRt1nUEsctiaoHOphS0HsYicqDMJtgUzovdD1USQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vce53459da11d70e30', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (363, 'ChiLiLi', 'ChiLiLi', '79d71f155127e812e8956aabbe148de6', '陈家乐', '1', '18228144623', '', 1, '', 'http://wework.qpic.cn/bizmail/dPtSw4zk3IK5kkDesjLFeiaXEYmqAUnFzGRD0soP0Xf6eu5Y8PTkiajQ/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc523bb96e6973c8a2', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (364, 'mr__guo', 'mr__guo', '8de4d0c77a1dc19acf2e2511dc1f7920', '郭迎丰', '1', '', '', 1, '', 'https://wework.qpic.cn/bizmail/LTGIwL2X2LHAzHbuV8I6f2BlAANj7iaE3YaVQMCYvibFibURCDLGYFWyA/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vc2a7a32cd943662d7', '', '', 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);
INSERT INTO `a_user` VALUES (365, 'LiuLianBanXia', 'LiuLianBanXia', '0482c32aee7e4144f1dda84fc25ea656', '徐启雄', '1', '17623165710', '', 1, '', 'http://wework.qpic.cn/bizmail/UiblLSCtn8SWoQtLbJOFFH4XlL0KGFqSwRXbppqne14LgQD34YOACicg/0', '', 1, 1, 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vce8b7f98b389dd3ac', '', '', 1, '125.84.85.232', 1591243052, NULL, 1, '10', NULL, NULL, 2, '0', NULL, '', 0, NULL, NULL);

-- ----------------------------
-- Table structure for dc_approval_car
-- ----------------------------
DROP TABLE IF EXISTS `dc_approval_car`;
CREATE TABLE `dc_approval_car`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `approval_sn` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '审批编号',
  `department_id` int(11) NULL DEFAULT NULL COMMENT '用车科室',
  `car_type_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '车类型',
  `car_type_name` text CHARACTER SET utf8 COLLATE utf8_bin NULL COMMENT '车类型名',
  `start_time` int(10) UNSIGNED NOT NULL COMMENT '开始时间',
  `have_driver` tinyint(1) NOT NULL DEFAULT 1 COMMENT '2不需要指派司机 1需要指派司机',
  `all_userid` int(11) NOT NULL COMMENT '乘客人数',
  `from_address` text CHARACTER SET utf8 COLLATE utf8_bin NULL COMMENT '出发地',
  `to_address` text CHARACTER SET utf8 COLLATE utf8_bin NULL COMMENT '目的地',
  `mobile` char(11) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '申请人电话',
  `type` tinyint(1) UNSIGNED NOT NULL COMMENT '1普通用户审批 2车队直接审批',
  `cause` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '用车原因',
  `travel_mileage` decimal(15, 3) NOT NULL COMMENT '出行里程,单位㎞',
  `userid` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用车人企业微信id',
  `driver_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '多个司机userid',
  `car_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '多个车辆id',
  `car_number` text CHARACTER SET utf8 COLLATE utf8_bin NULL COMMENT '车牌号',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审批 1已通过 2已驳回 3申请人撤销 4申请人取消',
  `car_use_status` int(2) NOT NULL DEFAULT 0 COMMENT '1待出行 2用车中 3回程中 4用车结束',
  `date_type` int(2) NULL DEFAULT 1 COMMENT '1工作日2节假日',
  `arrived_time` int(11) NULL DEFAULT 0 COMMENT '到达目的地时间',
  `soft_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
  `copyer_id` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '抄送人id',
  `createtime` int(10) UNSIGNED NOT NULL COMMENT '审批时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 262 CHARACTER SET = utf8 COLLATE = utf8_bin COMMENT = '审批模板' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_approval_car
-- ----------------------------
INSERT INTO `dc_approval_car` VALUES (249, '20200511090136877', 1, '44', '出租车', 1593014400, 1, 12, '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15285555555', 1, '', 5.490, 'fb2316f492e243eaafbc019448fed6a5', 'fb2316f492e243eaafbc019448fed6a5,NiWang', '57,55', '川A00003,川A00005', 3, 0, 2, 0, 1, '', 1589158896);
INSERT INTO `dc_approval_car` VALUES (250, '20200511092122924', 1, '44', '出租车', 1593014400, 1, 12, '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15285555555', 1, '', 5.490, 'fb2316f492e243eaafbc019448fed6a5', 'fb2316f492e243eaafbc019448fed6a5', '57,55', '川A00003,川A00005', 2, 1, 2, 0, 1, '', 1589160082);
INSERT INTO `dc_approval_car` VALUES (251, '20200511095309981', 1, '44', '出租车', 1593014400, 1, 20, '{\"area\":\"北京市 东城区\",\"detail\":\"东城区\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"天津市 和平区\",\"detail\":\"和平区\",\"location\":{\"lat\":39.11712,\"lng\":117.2147},\"data\":[{\"code\":\"120000\",\"name\":\"天津市\"},{\"code\":\"120100\",\"name\":\"天津市\"},{\"code\":\"120101\",\"name\":\"和平区\"}]}', '19985674581', 1, '', 128.386, 'fb2316f492e243eaafbc019448fed6a5', NULL, NULL, NULL, 3, 0, 2, 0, 1, '', 1589161989);
INSERT INTO `dc_approval_car` VALUES (252, '20200512181708838', 1, '44', '出租车', 1589212800, 1, 20, '{\"area\":\"北京市 东城区\",\"detail\":\"东城区\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"内蒙古自治区 呼和浩特市 新城区\",\"detail\":\"西城区\",\"location\":{\"lat\":40.85844,\"lng\":111.66345},\"data\":[{\"code\":\"150000\",\"name\":\"内蒙古自治区\"},{\"code\":\"150100\",\"name\":\"呼和浩特市\"},{\"code\":\"150102\",\"name\":\"新城区\"}]}', '19985632125', 1, '', 488.176, 'NiWang', 'fb2316f492e243eaafbc019448fed6a5', '56,55', '川A00003,川A00004', 1, 1, 1, 0, 1, '', 1589278628);
INSERT INTO `dc_approval_car` VALUES (253, '20200512184925555', 1, '44', '出租车', 1589212800, 1, 20, '{\"area\":\"天津市 和平区\",\"detail\":\"和平桥区\\n\",\"location\":{\"lat\":39.11712,\"lng\":117.2147},\"data\":[{\"code\":\"120000\",\"name\":\"天津市\"},{\"code\":\"120100\",\"name\":\"天津市\"},{\"code\":\"120101\",\"name\":\"和平区\"}]}', '{\"area\":\"山西省 太原市 小店区\",\"detail\":\"小店区\",\"location\":{\"lat\":37.73605,\"lng\":112.56566},\"data\":[{\"code\":\"140000\",\"name\":\"山西省\"},{\"code\":\"140100\",\"name\":\"太原市\"},{\"code\":\"140105\",\"name\":\"小店区\"}]}', '19985632145', 1, '', 530.576, 'NiWang', NULL, NULL, NULL, 2, 1, 1, 0, 1, '', 1589280565);
INSERT INTO `dc_approval_car` VALUES (254, '20200512185417373', 1, '44', '出租车', 1589212800, 1, 10, '{\"area\":\"山西省 太原市 小店区\",\"detail\":\"小店区\",\"location\":{\"lat\":37.73605,\"lng\":112.56566},\"data\":[{\"code\":\"140000\",\"name\":\"山西省\"},{\"code\":\"140100\",\"name\":\"太原市\"},{\"code\":\"140105\",\"name\":\"小店区\"}]}', '{\"area\":\"河北省 石家庄市 长安区\",\"detail\":\"长安区\",\"location\":{\"lat\":38.03647,\"lng\":114.53952},\"data\":[{\"code\":\"130000\",\"name\":\"河北省\"},{\"code\":\"130100\",\"name\":\"石家庄市\"},{\"code\":\"130102\",\"name\":\"长安区\"}]}', '19965231785', 1, '', 239.566, 'NiWang', NULL, NULL, NULL, 2, 0, 1, 0, 1, '', 1589280857);
INSERT INTO `dc_approval_car` VALUES (255, '20200520101753315', 1, '44', '出租车', 1601518560, 1, 20, '{\"area\":\"北京市 东城区\",\"detail\":\"东城区\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 石景山区\",\"detail\":\"石景区\",\"location\":{\"lat\":39.92271,\"lng\":116.189079},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110107\",\"name\":\"石景山区\"}]}', '19985678471', 1, '', 25.981, 'fb2316f492e243eaafbc019448fed6a5', NULL, NULL, NULL, 3, 0, 2, 0, 1, '', 1589941073);
INSERT INTO `dc_approval_car` VALUES (256, '20200520103519988', 1, '43', '轿车', 1589942040, 1, 20, '{\"area\":\"内蒙古自治区 呼和浩特市 新城区\",\"detail\":\"新城区\",\"location\":{\"lat\":40.85844,\"lng\":111.66345},\"data\":[{\"code\":\"150000\",\"name\":\"内蒙古自治区\"},{\"code\":\"150100\",\"name\":\"呼和浩特市\"},{\"code\":\"150102\",\"name\":\"新城区\"}]}', '{\"area\":\"山西省 太原市 小店区\",\"detail\":\"小店区\",\"location\":{\"lat\":37.73605,\"lng\":112.56566},\"data\":[{\"code\":\"140000\",\"name\":\"山西省\"},{\"code\":\"140100\",\"name\":\"太原市\"},{\"code\":\"140105\",\"name\":\"小店区\"}]}', '19985674871', 2, '', 469.061, 'fb2316f492e243eaafbc019448fed6a5', '15283829512', '54', NULL, 1, 1, 1, 0, 1, '', 1589942119);
INSERT INTO `dc_approval_car` VALUES (257, '20200526183951973', 1, '44', '出租车', 1590422400, 2, 1, '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15222222222', 2, '', 5.609, 'NiWang', '0', '57', NULL, 4, 0, 1, 0, 1, '', 1590489591);
INSERT INTO `dc_approval_car` VALUES (258, '20200526184325679', 1, '44', '出租车', 1590422400, 2, 1, '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15222222222', 2, '', 5.609, 'NiWang', '0', '57', NULL, 4, 0, 1, 0, 1, '', 1590489805);
INSERT INTO `dc_approval_car` VALUES (259, '20200526191008629', 1, '44', '出租车', 1590422400, 2, 11, '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15222222222', 2, '', 4.132, 'NiWang', '0', '57', NULL, 4, 0, 1, 0, 1, '', 1590491408);
INSERT INTO `dc_approval_car` VALUES (260, '20200526191234973', 1, '44', '出租车', 1590422400, 2, 1, '{\"area\":\"北京市 东城区\",\"detail\":\"天安门\",\"location\":{\"lat\":39.908821,\"lng\":116.397469},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '{\"area\":\"北京市 东城区\",\"detail\":\"故宫\",\"location\":{\"lat\":39.92855,\"lng\":116.41637},\"data\":[{\"code\":\"110000\",\"name\":\"北京市\"},{\"code\":\"110100\",\"name\":\"北京市\"},{\"code\":\"110101\",\"name\":\"东城区\"}]}', '15222222222', 2, '', 5.609, 'NiWang', '0', '57', NULL, 1, 1, 1, 0, 1, '', 1590491554);
INSERT INTO `dc_approval_car` VALUES (261, '20200602141606844', 1, '44', '出租车', 1591113600, 1, 4, '{\"area\":\"重庆市 渝中区\",\"detail\":\"大坪\",\"location\":{\"lat\":29.541466,\"lng\":106.522263},\"data\":[{\"code\":\"500000\",\"name\":\"重庆市\"},{\"code\":\"500100\",\"name\":\"重庆市\"},{\"code\":\"500103\",\"name\":\"渝中区\"}]}', '{\"area\":\"四川省 成都市 锦江区\",\"detail\":\"132号\",\"location\":{\"lat\":30.662359,\"lng\":104.078758},\"data\":[{\"code\":\"510000\",\"name\":\"四川省\"},{\"code\":\"510100\",\"name\":\"成都市\"},{\"code\":\"510104\",\"name\":\"锦江区\"}]}', '13500000000', 1, '出差', 308.352, 'ZhengLuBin', 'NiWang', '53', '川A00001', 3, 0, 1, 0, 1, '', 1591078566);

-- ----------------------------
-- Table structure for dc_approval_log
-- ----------------------------
DROP TABLE IF EXISTS `dc_approval_log`;
CREATE TABLE `dc_approval_log`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `approval_id` int(10) UNSIGNED NOT NULL COMMENT '审批id',
  `approver_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '操作人userid',
  `approver_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '操作人名字',
  `role_id` int(11) NULL DEFAULT 0 COMMENT '角色id',
  `approver_type` int(1) NULL DEFAULT 1 COMMENT '1上级主管2角色',
  `order` tinyint(1) UNSIGNED NULL DEFAULT NULL COMMENT '几级审批人',
  `is_order_last` tinyint(1) NULL DEFAULT 0 COMMENT '当前层级组后一个1是0不是',
  `is_last` tinyint(1) NULL DEFAULT 0 COMMENT '1最后一个审批0不是最后一个',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '1已通过 2驳回 3申请人撤销 4申请人取消',
  `cause` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '申请人取消原因',
  `create_time` int(11) NOT NULL COMMENT '审批时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 461 CHARACTER SET = utf8 COLLATE = utf8_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_approval_log
-- ----------------------------
INSERT INTO `dc_approval_log` VALUES (442, 249, '15283829512', '邓春红', 2, 2, 1, 1, 1, 1, '', 1589159436);
INSERT INTO `dc_approval_log` VALUES (443, 249, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 0, 1, NULL, 0, 0, 3, NULL, 1589159726);
INSERT INTO `dc_approval_log` VALUES (444, 250, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 2, 2, 1, 1, 1, 1, '', 1589160358);
INSERT INTO `dc_approval_log` VALUES (445, 250, 'NiWang', '郑新', 0, 1, 2, 1, 1, 2, '12', 1589160417);
INSERT INTO `dc_approval_log` VALUES (446, 251, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 0, 1, NULL, 0, 0, 3, NULL, 1589161996);
INSERT INTO `dc_approval_log` VALUES (447, 252, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 2, 2, 1, 0, 0, 1, '', 1589278670);
INSERT INTO `dc_approval_log` VALUES (448, 252, '15283829512', '邓春红', 2, 2, 1, 1, 1, 1, '', 1589278812);
INSERT INTO `dc_approval_log` VALUES (449, 253, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 2, 2, 1, 0, 1, 2, '去', 1589280605);
INSERT INTO `dc_approval_log` VALUES (450, 255, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 0, 1, NULL, 0, 0, 3, NULL, 1589941078);
INSERT INTO `dc_approval_log` VALUES (451, 256, 'fb2316f492e243eaafbc019448fed6a5', '郑新', 2, 2, 1, 0, 1, 1, NULL, 1589942119);
INSERT INTO `dc_approval_log` VALUES (452, 257, '15283829512', '邓春红', 2, 2, 1, 0, 1, 1, NULL, 1590489591);
INSERT INTO `dc_approval_log` VALUES (453, 257, 'NiWang', '郑新', 0, 3, NULL, 0, 0, 4, '哈哈', 1590489731);
INSERT INTO `dc_approval_log` VALUES (454, 258, '15283829512', '邓春红', 2, 2, 1, 0, 1, 1, NULL, 1590489805);
INSERT INTO `dc_approval_log` VALUES (455, 258, 'NiWang', '郑新', 0, 3, NULL, 0, 0, 4, '', 1590491363);
INSERT INTO `dc_approval_log` VALUES (456, 259, '15283829512', '邓春红', 2, 2, 1, 0, 1, 1, NULL, 1590491408);
INSERT INTO `dc_approval_log` VALUES (457, 259, 'NiWang', '郑新', 0, 3, NULL, 0, 0, 4, '', 1590491499);
INSERT INTO `dc_approval_log` VALUES (458, 260, '15283829512', '邓春红', 2, 2, 1, 0, 1, 1, NULL, 1590491554);
INSERT INTO `dc_approval_log` VALUES (459, 261, 'ZhengLuBin', '郑露彬', 3, 2, 1, 0, 0, 1, '', 1591079433);
INSERT INTO `dc_approval_log` VALUES (460, 261, 'ZhengLuBin', '郑露彬', 0, 1, NULL, 0, 0, 3, NULL, 1591079714);

-- ----------------------------
-- Table structure for dc_approval_progress
-- ----------------------------
DROP TABLE IF EXISTS `dc_approval_progress`;
CREATE TABLE `dc_approval_progress`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `approval_id` int(11) NULL DEFAULT NULL,
  `progress` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '流程',
  `car_info` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '车辆信息',
  `order` int(11) NULL DEFAULT NULL COMMENT '层级',
  `status` int(11) NULL DEFAULT NULL COMMENT '状态',
  `create_time` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 153 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '审批审核已处理完的流程' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_approval_progress
-- ----------------------------
INSERT INTO `dc_approval_progress` VALUES (138, 249, '[{\"id\":233,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":2,\"type\":2,\"update_time\":1589015407,\"soft_delete\":1,\"create_time\":1589015407,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1589159436,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1},{\"id\":234,\"approver_order\":2,\"approver_type\":1,\"role_id\":\"\",\"date_type\":2,\"type\":2,\"update_time\":1589015407,\"soft_delete\":1,\"create_time\":1589015407,\"dep_name\":\"\\u6df1\\u5733\\u4e2d\\u7269\\u5174\\u534e\\u6709\\u9650\\u516c\\u53f8\",\"leader_arr\":[{\"userid\":\"NiWang\",\"name\":\"\\u90d1\\u65b0\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulk0H2vx7SwMAfHDETPBDMBHA\\/0\",\"is_approval\":0,\"is_approval_time\":0}],\"role_user_arr\":[],\"is_deal_approval\":0,\"approval_role\":[],\"last_approval_status\":null}]', NULL, NULL, 3, 1589159726);
INSERT INTO `dc_approval_progress` VALUES (139, 250, '[{\"id\":233,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":2,\"type\":2,\"update_time\":1589015407,\"soft_delete\":1,\"create_time\":1589015407,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1589160358,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1},{\"id\":234,\"approver_order\":2,\"approver_type\":1,\"role_id\":\"\",\"date_type\":2,\"type\":2,\"update_time\":1589015407,\"soft_delete\":1,\"create_time\":1589015407,\"dep_name\":\"\\u6df1\\u5733\\u4e2d\\u7269\\u5174\\u534e\\u6709\\u9650\\u516c\\u53f8\",\"leader_arr\":[{\"userid\":\"NiWang\",\"name\":\"\\u90d1\\u65b0\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulk0H2vx7SwMAfHDETPBDMBHA\\/0\",\"is_approval\":2,\"is_approval_time\":1589160417}],\"role_user_arr\":[],\"is_deal_approval\":1,\"approval_role\":[],\"last_approval_status\":2}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00005\",\"type_name\":\"\\u51fa\\u79df\\u8f66\",\"total_travel_mileage\":0},{\"drive_km\":100,\"car_number\":\"\\u5dddA00003\",\"type_name\":\"\\u8f7f\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 2, 1589160419);
INSERT INTO `dc_approval_progress` VALUES (140, 251, '[{\"id\":236,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":2,\"type\":1,\"update_time\":1589160641,\"soft_delete\":1,\"create_time\":1589160641,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"is_deal_approval\":0,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":null},{\"id\":237,\"approver_order\":2,\"approver_type\":1,\"role_id\":\"\",\"date_type\":2,\"type\":1,\"update_time\":1589160641,\"soft_delete\":1,\"create_time\":1589160641,\"dep_name\":\"\\u6df1\\u5733\\u4e2d\\u7269\\u5174\\u534e\\u6709\\u9650\\u516c\\u53f8\",\"leader_arr\":[{\"userid\":\"NiWang\",\"name\":\"\\u90d1\\u65b0\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulk0H2vx7SwMAfHDETPBDMBHA\\/0\",\"is_approval\":0,\"is_approval_time\":0}],\"role_user_arr\":[],\"is_deal_approval\":0,\"approval_role\":[],\"last_approval_status\":null}]', NULL, NULL, 3, 1589161996);
INSERT INTO `dc_approval_progress` VALUES (141, 252, '[{\"id\":235,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":1,\"type\":1,\"update_time\":1589160641,\"soft_delete\":1,\"create_time\":1589160641,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1589278812,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"},{\"is_approval\":1,\"is_approval_time\":1589278670,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00004\",\"type_name\":\"\\u8f7f\\u8f66\",\"total_travel_mileage\":0},{\"drive_km\":100,\"car_number\":\"\\u5dddA00003\",\"type_name\":\"\\u8f7f\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1589278814);
INSERT INTO `dc_approval_progress` VALUES (142, 253, '[{\"id\":235,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":1,\"type\":1,\"update_time\":1589160641,\"soft_delete\":1,\"create_time\":1589160641,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":2,\"is_approval_time\":1589280605,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":null}]', '{\"car_info\":[{\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 2, 1589280606);
INSERT INTO `dc_approval_progress` VALUES (143, 255, '[{\"id\":247,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":2,\"type\":1,\"update_time\":1589446183,\"soft_delete\":1,\"create_time\":1589446183,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"is_deal_approval\":0,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":null},{\"id\":248,\"approver_order\":2,\"approver_type\":1,\"role_id\":\"\",\"date_type\":2,\"type\":1,\"update_time\":1589446183,\"soft_delete\":1,\"create_time\":1589446183,\"dep_name\":\"\\u6df1\\u5733\\u4e2d\\u7269\\u5174\\u534e\\u6709\\u9650\\u516c\\u53f8\",\"leader_arr\":[{\"userid\":\"NiWang\",\"name\":\"\\u90d1\\u65b0\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulk0H2vx7SwMAfHDETPBDMBHA\\/0\",\"is_approval\":0,\"is_approval_time\":0}],\"role_user_arr\":[],\"is_deal_approval\":0,\"approval_role\":[],\"last_approval_status\":null}]', NULL, NULL, 3, 1589941078);
INSERT INTO `dc_approval_progress` VALUES (144, 256, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1589942119,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":100,\"car_number\":\"\\u5dddA00002\",\"type_name\":\"\\u8f7f\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1589942121);
INSERT INTO `dc_approval_progress` VALUES (145, 257, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590489591,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00005\",\"type_name\":\"\\u51fa\\u79df\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1590489593);
INSERT INTO `dc_approval_progress` VALUES (146, 257, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590489591,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', NULL, NULL, 1, 1590489731);
INSERT INTO `dc_approval_progress` VALUES (147, 258, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590489805,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00005\",\"type_name\":\"\\u51fa\\u79df\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1590489807);
INSERT INTO `dc_approval_progress` VALUES (148, 258, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590489805,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', NULL, NULL, 1, 1590491363);
INSERT INTO `dc_approval_progress` VALUES (149, 259, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590491408,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00005\",\"type_name\":\"\\u51fa\\u79df\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1590491410);
INSERT INTO `dc_approval_progress` VALUES (150, 259, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590491408,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', NULL, NULL, 1, 1590491500);
INSERT INTO `dc_approval_progress` VALUES (151, 260, '[{\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1590491554,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"}],\"leader_arr\":[],\"is_deal_approval\":1,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":1}]', '{\"car_info\":[{\"drive_km\":11,\"car_number\":\"\\u5dddA00005\",\"type_name\":\"\\u51fa\\u79df\\u8f66\",\"total_travel_mileage\":0}],\"out_check_info\":null,\"return_check_info\":null}', NULL, 1, 1590491556);
INSERT INTO `dc_approval_progress` VALUES (152, 261, '[{\"id\":245,\"approver_order\":1,\"approver_type\":2,\"role_id\":\"3\",\"date_type\":1,\"type\":1,\"update_time\":1589446183,\"soft_delete\":1,\"create_time\":1589446183,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":1,\"is_approval_time\":1591079433,\"name\":\"\\u90d1\\u9732\\u5f6c\",\"role_name\":\"\\u8f66\\u961f\\u4e3b\\u7ba1\",\"avatar\":\"https:\\/\\/wework.qpic.cn\\/bizmail\\/ibYvGe3ZfbVACBfQd6ouwb8hCWtYnl3ssD7uweHfib3zIu3ynmUibxzFw\\/0\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8f66\\u961f\\u4e3b\\u7ba1\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/42iamsqMNMteu3ibLeDib1xnLp1m2DBkulkn917Vr3tZs1CGRg2nVlBqw\\/0\"}],\"is_deal_approval\":1,\"approval_role\":[{\"id\":3,\"role_name\":\"\\u8f66\\u961f\\u4e3b\\u7ba1\"}],\"last_approval_status\":null},{\"id\":246,\"approver_order\":2,\"approver_type\":2,\"role_id\":\"2\",\"date_type\":1,\"type\":2,\"update_time\":1589446183,\"soft_delete\":1,\"create_time\":1589446183,\"leader_arr\":[],\"role_user_arr\":[{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u9093\\u6625\\u7ea2\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"http:\\/\\/wework.qpic.cn\\/bizmail\\/wOTzOCAxZpGfPoTTe6cbMo465ia8rj8U4X8iaU8vgRaAeb0I9umpHBsw\\/0\"},{\"is_approval\":0,\"is_approval_time\":0,\"name\":\"\\u90d1\\u65b0\",\"role_name\":\"\\u8c03\\u5ea6\\u4eba\",\"avatar\":\"\"}],\"is_deal_approval\":0,\"approval_role\":[{\"id\":2,\"role_name\":\"\\u8c03\\u5ea6\\u4eba\"}],\"last_approval_status\":null}]', NULL, NULL, 3, 1591079714);

-- ----------------------------
-- Table structure for dc_approval_setting
-- ----------------------------
DROP TABLE IF EXISTS `dc_approval_setting`;
CREATE TABLE `dc_approval_setting`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `approver_order` int(11) NOT NULL DEFAULT 1 COMMENT '审批层级',
  `approver_type` int(11) NOT NULL DEFAULT 1 COMMENT '1上级主管2角色',
  `role_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '角色对应的角色id',
  `date_type` int(2) NULL DEFAULT 1 COMMENT '1工作日2节假日',
  `type` int(11) NOT NULL DEFAULT 1 COMMENT '1会签2或签',
  `update_time` int(11) NOT NULL,
  `soft_delete` int(11) NOT NULL DEFAULT 1,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 249 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '审批流程设置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_approval_setting
-- ----------------------------
INSERT INTO `dc_approval_setting` VALUES (212, 1, 2, '3', 1, 2, 1588900842, 1589446183, 1588900842);
INSERT INTO `dc_approval_setting` VALUES (213, 2, 1, '', 1, 2, 1588900842, 1589446183, 1588900842);
INSERT INTO `dc_approval_setting` VALUES (214, 1, 2, '2,3', 2, 2, 1588900842, 1589446183, 1588900842);
INSERT INTO `dc_approval_setting` VALUES (215, 1, 2, '3', 1, 2, 1588900842, 1589446183, 1588900842);
INSERT INTO `dc_approval_setting` VALUES (216, 2, 1, '', 1, 2, 1588900842, 1589446183, 1588900842);
INSERT INTO `dc_approval_setting` VALUES (217, 1, 2, '2,3', 2, 2, 1588900843, 1589446183, 1588900843);
INSERT INTO `dc_approval_setting` VALUES (218, 1, 2, '3', 1, 2, 1588916721, 1589446183, 1588916721);
INSERT INTO `dc_approval_setting` VALUES (219, 2, 1, '', 1, 2, 1588916721, 1589446183, 1588916721);
INSERT INTO `dc_approval_setting` VALUES (220, 1, 2, '3', 2, 2, 1588916721, 1589446183, 1588916721);
INSERT INTO `dc_approval_setting` VALUES (221, 2, 1, '', 2, 2, 1588916721, 1589446183, 1588916721);
INSERT INTO `dc_approval_setting` VALUES (222, 1, 2, '3', 1, 2, 1588916821, 1589446183, 1588916821);
INSERT INTO `dc_approval_setting` VALUES (223, 2, 1, '', 1, 2, 1588916821, 1589446183, 1588916821);
INSERT INTO `dc_approval_setting` VALUES (224, 1, 2, '2', 2, 2, 1588916821, 1589446183, 1588916821);
INSERT INTO `dc_approval_setting` VALUES (225, 2, 1, '', 2, 2, 1588916821, 1589446183, 1588916821);
INSERT INTO `dc_approval_setting` VALUES (226, 1, 2, '3', 1, 2, 1589005992, 1589446183, 1589005992);
INSERT INTO `dc_approval_setting` VALUES (227, 1, 2, '2', 2, 2, 1589005992, 1589446183, 1589005992);
INSERT INTO `dc_approval_setting` VALUES (228, 2, 1, '', 2, 2, 1589005992, 1589446183, 1589005992);
INSERT INTO `dc_approval_setting` VALUES (229, 1, 2, '3,2', 1, 2, 1589015289, 1589446183, 1589015289);
INSERT INTO `dc_approval_setting` VALUES (230, 1, 2, '2', 2, 2, 1589015289, 1589446183, 1589015289);
INSERT INTO `dc_approval_setting` VALUES (231, 2, 1, '', 2, 2, 1589015289, 1589446183, 1589015289);
INSERT INTO `dc_approval_setting` VALUES (232, 1, 2, '2', 1, 2, 1589015407, 1589446183, 1589015407);
INSERT INTO `dc_approval_setting` VALUES (233, 1, 2, '2', 2, 2, 1589015407, 1589446183, 1589015407);
INSERT INTO `dc_approval_setting` VALUES (234, 2, 1, '', 2, 2, 1589015407, 1589446183, 1589015407);
INSERT INTO `dc_approval_setting` VALUES (235, 1, 2, '2', 1, 1, 1589160641, 1589446183, 1589160641);
INSERT INTO `dc_approval_setting` VALUES (236, 1, 2, '2', 2, 1, 1589160641, 1589446183, 1589160641);
INSERT INTO `dc_approval_setting` VALUES (237, 2, 1, '', 2, 1, 1589160641, 1589446183, 1589160641);
INSERT INTO `dc_approval_setting` VALUES (238, 1, 2, '3', 1, 2, 1589280673, 1589446183, 1589280673);
INSERT INTO `dc_approval_setting` VALUES (239, 1, 2, '2', 2, 1, 1589280674, 1589446183, 1589280674);
INSERT INTO `dc_approval_setting` VALUES (240, 2, 1, '', 2, 1, 1589280674, 1589446183, 1589280674);
INSERT INTO `dc_approval_setting` VALUES (241, 1, 2, '3', 1, 2, 1589446138, 1589446183, 1589446138);
INSERT INTO `dc_approval_setting` VALUES (242, 2, 2, '2', 1, 2, 1589446139, 1589446183, 1589446139);
INSERT INTO `dc_approval_setting` VALUES (243, 1, 2, '2', 2, 1, 1589446139, 1589446183, 1589446139);
INSERT INTO `dc_approval_setting` VALUES (244, 2, 1, '', 2, 1, 1589446139, 1589446183, 1589446139);
INSERT INTO `dc_approval_setting` VALUES (245, 1, 2, '3', 1, 1, 1589446183, 1, 1589446183);
INSERT INTO `dc_approval_setting` VALUES (246, 2, 2, '2', 1, 2, 1589446183, 1, 1589446183);
INSERT INTO `dc_approval_setting` VALUES (247, 1, 2, '2', 2, 1, 1589446183, 1, 1589446183);
INSERT INTO `dc_approval_setting` VALUES (248, 2, 1, '', 2, 1, 1589446183, 1, 1589446183);

-- ----------------------------
-- Table structure for dc_car
-- ----------------------------
DROP TABLE IF EXISTS `dc_car`;
CREATE TABLE `dc_car`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `car_number` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '车牌号',
  `type_id` int(11) NULL DEFAULT NULL COMMENT '类型id',
  `car_model` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '车辆型号',
  `seats_number` tinyint(3) NULL DEFAULT NULL COMMENT '座位个数',
  `prompt` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '备注',
  `drive_km` float(10, 2) UNSIGNED NULL DEFAULT 0.00 COMMENT '行驶公里，里程表',
  `use_num` int(10) UNSIGNED NOT NULL COMMENT '使用次数',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '1正常 0已下架',
  `car_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 使用中 0未使用',
  `createtime` int(10) UNSIGNED NOT NULL COMMENT '上架时间',
  `soft_delete` int(11) NULL DEFAULT NULL COMMENT '软删除，1-正常',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 58 CHARACTER SET = utf8 COLLATE = utf8_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_car
-- ----------------------------
INSERT INTO `dc_car` VALUES (52, '川A20000', 43, NULL, 2, '', 11.00, 0, 1, 0, 1588210642, 1);
INSERT INTO `dc_car` VALUES (53, '川A00001', 44, NULL, 2, '', 100.00, 0, 1, 0, 1588231900, 1);
INSERT INTO `dc_car` VALUES (54, '川A00002', 43, NULL, 2, '', 100.00, 0, 1, 1, 1588231924, 1);
INSERT INTO `dc_car` VALUES (55, '川A00003', 43, NULL, 2, '', 100.00, 0, 1, 1, 1588231934, 1);
INSERT INTO `dc_car` VALUES (56, '川A00004', 43, NULL, 2, '', 11.00, 0, 1, 1, 1588231941, 1);
INSERT INTO `dc_car` VALUES (57, '川A00005', 44, NULL, 2, 'dd', 11.00, 0, 1, 1, 1588231948, 1);

-- ----------------------------
-- Table structure for dc_car_check
-- ----------------------------
DROP TABLE IF EXISTS `dc_car_check`;
CREATE TABLE `dc_car_check`  (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `approval_id` int(10) NOT NULL DEFAULT 0 COMMENT '审批id',
  `type` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1出场 2回场',
  `drive_km` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '出场/回场历程表',
  `prompt` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  `check_time` int(11) NOT NULL COMMENT '检查时间',
  `create_time` int(11) NOT NULL COMMENT '添加时间',
  `check_user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL COMMENT '检查人id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_bin COMMENT = '车辆出入场' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_car_check
-- ----------------------------

-- ----------------------------
-- Table structure for dc_car_type
-- ----------------------------
DROP TABLE IF EXISTS `dc_car_type`;
CREATE TABLE `dc_car_type`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '类型名称',
  `create_time` int(11) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` int(11) NULL DEFAULT NULL COMMENT '修改时间',
  `soft_delete` int(11) NULL DEFAULT NULL COMMENT '软删除，1-为正常',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '车辆类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_car_type
-- ----------------------------
INSERT INTO `dc_car_type` VALUES (43, '轿车', 1588210626, 0, 1);
INSERT INTO `dc_car_type` VALUES (44, '出租车', 1589009068, 0, 1);

-- ----------------------------
-- Table structure for dc_driver
-- ----------------------------
DROP TABLE IF EXISTS `dc_driver`;
CREATE TABLE `dc_driver`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
  `realname` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '真实姓名',
  `mobile` char(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '手机号码',
  `gender` tinyint(1) NULL DEFAULT NULL COMMENT '性别1-男，2-女',
  `work_num` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '出车次数',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '0空闲中 1派车中',
  `userid` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户id',
  `soft_delete` int(11) NOT NULL DEFAULT 1,
  `create_time` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8 COLLATE = utf8_bin COMMENT = '司机详情表\r\n' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_driver
-- ----------------------------
INSERT INTO `dc_driver` VALUES (45, '邓春红（深圳中物兴华有限公司）', '15222222222', 1, 0, 1, '15283829512', 1, 1588210665);
INSERT INTO `dc_driver` VALUES (46, '郑新', '19985674871', 1, 0, 0, 'NiWang', 1, 1588230637);
INSERT INTO `dc_driver` VALUES (47, '郑新', '19985674872', 1, 0, 1, 'fb2316f492e243eaafbc019448fed6a5', 1, 1588230724);
INSERT INTO `dc_driver` VALUES (48, '郑露彬（深圳中物兴华有限公司）', '13500339148', 1, 0, 0, 'ZhengLuBin', 1591078203, 1591077992);

-- ----------------------------
-- Table structure for dc_payment_setting
-- ----------------------------
DROP TABLE IF EXISTS `dc_payment_setting`;
CREATE TABLE `dc_payment_setting`  (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `config` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_online` int(1) NOT NULL DEFAULT 0 COMMENT '是否线上支付0否1是',
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '支付设置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_payment_setting
-- ----------------------------
INSERT INTO `dc_payment_setting` VALUES (0, 'WxPay', '{\"mch_id\":\"1\",\"api_key\":\"2\",\"appid\":\"3\"}', 0, 0);

-- ----------------------------
-- Table structure for dc_send_msg
-- ----------------------------
DROP TABLE IF EXISTS `dc_send_msg`;
CREATE TABLE `dc_send_msg`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `approval_id` int(11) NOT NULL,
  `name` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `start_time` int(11) NOT NULL,
  `cause` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `userid` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `type` int(11) NOT NULL DEFAULT 1 COMMENT '1申请人 2催办 3司机',
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 415 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '推送表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_send_msg
-- ----------------------------
INSERT INTO `dc_send_msg` VALUES (399, 250, '你的用车申请已驳回', 1593014400, '', 'fb2316f492e243eaafbc019448fed6a5', 1, 1589160419);
INSERT INTO `dc_send_msg` VALUES (400, 252, '郑新的用车申请已审批通过', 1589212800, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,YiHouYiHou,NiWang', 4, 1589278813);
INSERT INTO `dc_send_msg` VALUES (401, 252, '你的用车申请已审批通过', 1589212800, '', 'NiWang', 1, 1589278813);
INSERT INTO `dc_send_msg` VALUES (402, 252, '派给我的接车任务', 1589212800, '', 'fb2316f492e243eaafbc019448fed6a5', 3, 1589278814);
INSERT INTO `dc_send_msg` VALUES (403, 253, '你的用车申请已驳回', 1589212800, '', 'NiWang', 1, 1589280606);
INSERT INTO `dc_send_msg` VALUES (404, 256, '郑新的用车申请已审批通过', 1589942040, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,NiWang', 4, 1589942120);
INSERT INTO `dc_send_msg` VALUES (405, 256, '你的用车申请已审批通过', 1589942040, '', 'fb2316f492e243eaafbc019448fed6a5', 1, 1589942120);
INSERT INTO `dc_send_msg` VALUES (406, 256, '派给我的接车任务', 1589942040, '', '15283829512', 3, 1589942121);
INSERT INTO `dc_send_msg` VALUES (407, 257, '郑新的用车申请已审批通过', 1590422400, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,NiWang', 4, 1590489591);
INSERT INTO `dc_send_msg` VALUES (408, 257, '你的用车申请已审批通过', 1590422400, '', 'NiWang', 1, 1590489592);
INSERT INTO `dc_send_msg` VALUES (409, 258, '郑新的用车申请已审批通过', 1590422400, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,NiWang', 4, 1590489806);
INSERT INTO `dc_send_msg` VALUES (410, 258, '你的用车申请已审批通过', 1590422400, '', 'NiWang', 1, 1590489806);
INSERT INTO `dc_send_msg` VALUES (411, 259, '郑新的用车申请已审批通过', 1590422400, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,NiWang', 4, 1590491409);
INSERT INTO `dc_send_msg` VALUES (412, 259, '你的用车申请已审批通过', 1590422400, '', 'NiWang', 1, 1590491409);
INSERT INTO `dc_send_msg` VALUES (413, 260, '郑新的用车申请已审批通过', 1590422400, '', '15283829512,fb2316f492e243eaafbc019448fed6a5,NiWang', 4, 1590491555);
INSERT INTO `dc_send_msg` VALUES (414, 260, '你的用车申请已审批通过', 1590422400, '', 'NiWang', 1, 1590491555);

-- ----------------------------
-- Table structure for dc_test
-- ----------------------------
DROP TABLE IF EXISTS `dc_test`;
CREATE TABLE `dc_test`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `xml` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dc_test
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
