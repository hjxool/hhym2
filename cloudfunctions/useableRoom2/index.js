// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("orders2");
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
		msg: '可用房间查询缺少日期',
		code: 400
	}
	let start = new Date(`${event.start} 00:00:00`)
	let end = new Date(`${event.end} 00:00:00`)
	if (isNaN(start.getTime()) || isNaN(end.getTime())) return {
		msg: '可用房间查询日期格式不正确',
		code: 400
	}
	// 订单查询接口是分页查询 不适合用在这 因此重写一遍查询
	let res = await 订单列表.where({
		start: _.lte(end),
		end: _.gte(start)
	}).get().then(({
		data
	}) => ({
		msg: '可用房间查询成功',
		code: 200,
		data
	})).catch(({
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