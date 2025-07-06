// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("customers2");
const _ = db.command; // 指令

// 云函数入口函数
exports.main = async (event, context) => {
	let {
		userId
	} = event
	if (!userId) return {
		msg: '缺少用户ID',
		code: 400
	}
	let res = await 订单列表.where({
		userId,
		status: 1 // 只统计已确认订单
	}).get().then(({
		data
	}) => data).catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
	if (res.code != 200) {
		return res
	}
	let totalAmount = res.data.reduce((pre, cur) => pre + cur.pay, 0)
	// 更新客户信息
	return cloud.callFunction({
		name: 'userEdit2',
		data: {
			type: '编辑',
			data: {
				userId,
				orderCount: res.data.length,
				totalAmount,
			}
		}
	}).then(({
		result
	}) => result).catch(({
		errMsg
	}) => ({
		msg: errMsg,
		code: 400,
	}))
};