// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 规则配置 = db.collection("priceRule2");

// 云函数入口函数
exports.main = async (event, context) => {
	// 校验必要字段
	let {
		type,
		data
	} = event
	if (!type) return {
		msg: '未指定操作类型',
		code: 400
	}
	let p
	switch (type) {
		case '查询':
			p = 规则配置.get().then(({
				data
			}) => ({
				code: 200,
				msg: '查询规则配置成功',
				data: data[0]
			}))
			break
		case '编辑':
			if (!data._id) return {
				code: 400,
				msg: '缺少规则配置id'
			}
			let d = {}
			for (let key in data) {
				if (key != '_id') {
					d[key] = data[key]
				}
			}
			p = 规则配置.doc(data._id).update({
				data: d
			}).then(() => ({
				msg: '更新规则配置成功',
				code: 200
			}))
			break
	}
	return p.catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
};