// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 管理员列表 = db.collection("manager");
// 云函数入口函数
exports.main = (event, context) => {
	// 查询数据库里是否有对应id
	let {
		OPENID
	} = cloud.getWXContext();
	return 管理员列表.get().then(({
		data
	}) => {
		for (let val of data) {
			if (OPENID === val.openid) {
				return {
					msg: '成功',
					code: 200,
					data: {
						身份: '管理员',
						id: OPENID
					}
				};
			}
		}
		return {
			msg: '成功',
			code: 200,
			data: {
				身份: '用户',
				id: OPENID
			}
		}
	});
};