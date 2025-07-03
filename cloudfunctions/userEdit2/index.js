// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 客户列表 = db.collection("customers2");

// 云函数入口函数
exports.main = async (event, context) => {
	const {
		OPENID
	} = cloud.getWXContext();
	let {
		type,
		data
	} = event
	switch (type) {
		case '查询':
			break
		case '新增':
			break
		case '编辑':
			break
		case '删除':
			break
	}
};