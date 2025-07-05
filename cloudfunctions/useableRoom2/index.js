// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 客户列表 = db.collection("customers2");
const _ = db.command; // 指令

const 房间 = []
for (let i = 1; i <= 11; i++) {
	房间.push(`标准间${i}`)
}
for (var i = 1; i <= 2; i++) {
	房间.push(`豪华间${i}`)
}

// 云函数入口函数
exports.main = async (event, context) => {
	// 校验必要字段
	if (!event.start || !event.end) return {
		msg: '缺少日期',
		code: 400
	}
	let start = new Date(event.start)
	let end = new Date(event.end)
	if (isNaN(start.getTime()) || isNaN(end.getTime())) return {
		msg: '日期格式不正确',
		code: 400
	}
	let res = await cloud.callFunction({
		name: 'orderEdit2',
		data: {
			type: '查询',
			data: {
				start: event.start,
				end: event.end
			}
		}
	}).then(({
		result
	}) => result).catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
	if (res.code != 200) return res
	// 房间名去重
	let 被占用房间 = [...new Set(res.data.map(e => e.room))]
	let result = []
	for (let val of 房间) {
		if (被占用房间.includes(val)) {
			result.push({
				name: val,
				disabled: true
			})
		} else {
			result.push({
				name: val,
				disabled: false
			})
		}
	}
	return {
		msg: '成功',
		code: 200,
		data: result
	}
};