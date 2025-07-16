// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 相册 = db.collection("storePhoto2");

// 云函数入口函数
exports.main = async (event, context) => {
	// 校验必要字段
	let {
		type,
		data
	} = event
	if (!type) return {
		msg: '未指定图片操作类型',
		code: 400
	}
	let p
	switch (type) {
		case '查询':
			p = 相册.get().then(({
				data
			}) => ({
				code: 200,
				msg: '查询相册成功',
				data
			}))
			break
		case '新增':
			if (!data) return {
				code: 400,
				msg: '未传图片云端地址'
			}
			p = 相册.add({
				data: {
					cloudPath: data
				}
			}).then(() => ({
				code: 200,
				msg: '相册上传成功',
			}))
			break
		case '更新':
			if (!data._id) return {
				code: 400,
				msg: '缺少图片id'
			}
			if (!data.cloudPath) return {
				code: 400,
				msg: '缺少更新地址'
			}
			相册.doc(data._id).update({
				data: {
					cloudPath: data.cloudPath
				}
			}).then(() => ({
				code: 200,
				msg: '更新相册成功'
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