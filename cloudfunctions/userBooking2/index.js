// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const _ = db.command; // 指令

// 云函数入口函数
exports.main = async (event, context) => {
	// 先判断用户是否存在
	if (!event.userId) {
		return {
			msg: '缺少用户ID',
			code: 400
		}
	}
	let res1 = await cloud.callFunction({
		name: 'userEdit2',
		data: {
			type: '个人信息',
			userId: event.userId
		}
	}).then(({
		result
	}) => result).catch(({
		errMsg
	}) => ({
		msg: errMsg,
		code: 400
	}))
	if (res1.code != 200) return res1
	if (!res1.data) {
		// 用户不存在 则创建用户记录
		let res2 = await cloud.callFunction({
			name: 'userEdit2',
			data: {
				type: '新增',
				data: {
					_id: event.userId,
					name: event.name,
					phone: event.phone,
					pets: event.pets,
					knowFrom: event.knowFrom
				}
			}
		}).then(({
			result
		}) => result).catch(({
			errMsg
		}) => ({
			msg: errMsg,
			code: 400
		}))
		if (res2.code != 200) return res2
	} else {
		// 用户存在 则更新个人信息
		let res2 = await cloud.callFunction({
			name: 'userEdit2',
			data: {
				type: '编辑',
				data: {
					userId: event.userId,
					name: event.name,
					phone: event.phone,
					knowFrom: event.knowFrom
				}
			}
		}).then(({
			result
		}) => result).catch(({
			errMsg
		}) => ({
			msg: errMsg,
			code: 400
		}))
		if (res2.code != 200) return res2
	}
	// 创建订单
	return cloud.callFunction({
		name: 'orderEdit2',
		data: {
			type: '新增',
			data: {
				room: event.room,
				start: event.start,
				end: event.end,
				pay: event.pay,
				status: 0, // 不同于管理界面手动创建的订单 这里必是待确认订单
				userId: event.userId,
				name: event.name,
				phone: event.phone,
				pets: event.selectedPets, // 注意 这里是所选宠物的快照
			}
		}
	}).then(({
		result
	}) => result).catch(({
		errMsg
	}) => ({
		msg: errMsg,
		code: 400
	}))
};