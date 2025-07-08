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
	if (!type) return {
		msg: '缺少type',
		code: 400
	}
	// 先判断是否有该用户 如果没有则不能增删改宠物信息
	let user = await 客户列表.doc(OPENID).get().then(({
		data
	}) => data).catch(err => false)
	if (!user) return {
		msg: '用户不存在',
		code: 400
	}
	try {
		switch (type) {
			case '新增':
				user.pets.push(data)
				break
			case '删除':
				user.pets = user.pets.filter(e => e.name != data)
				break
			case '编辑':
				// 在原位置直接覆盖
				for (let i = 0; i < user.pets.length; i++) {
					if (user.pets[i].name == data.name) {
						user.pets.splice(i, 1, data)
						break
					}
				}
				break
		}
		return 客户列表.doc(OPENID).update({
			data: {
				pets: user.pets
			}
		}).then(() => ({
			msg: '成功',
			code: 200
		})).catch(err => ({
			msg: err.message,
			code: 400
		}))
	} catch (err) {
		return {
			msg: err.message,
			code: 400
		}
	}
};