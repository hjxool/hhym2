// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("orders2");
const _ = db.command; // 指令
const 一天 = 1000 * 60 * 60 * 24

function 查询日期范围内订单(start, end) {
	return 订单列表.where({
		start: _.lte(end),
		end: _.gte(start),
		status: 1 // 只统计已确认订单
	}).get().then(({
		data
	}) => ({
		code: 200,
		data
	})).catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
}

async function 统计某年收入(data) {
	if (!data.year) return {
		msg: '统计未指定年',
		code: 400
	}
	if (isNaN(Number(data.year))) return {
		msg: '日期格式错误',
		code: 400
	}
	let start = `${data.year}/1/1 00:00:00`
	start = new Date(start)
	// 离店那天不算钱 因此要往后推一天
	let end = `${Number(data.year) + 1}/1/1 00:00:00`
	end = new Date(end)
	let res = await 查询日期范围内订单(start, end)
	if (res.code != 200) return res
	let result = {}
	// 构造一年中的月
	for (let i = 1; i <= 12; i++) {
		result[`${i}`] = 0
	}
	for (let order of res.data) {
		let 每日费用 = order.pay / ((order.end - order.start) / 一天)
		// 计算重叠部分的起止日期
		let start2 = Math.max(order.start.getTime(), start.getTime())
		let end2 = Math.min(order.end.getTime(), end.getTime())
		// 将日期重叠部分累加到对应月份
		// 注意 离店那天不算钱
		for (let i = start2; i < end2; i += 一天) {
			// 转换成月 累加到对应月
			let month = new Date(i).getMonth() + 1
			result[month] = result[month] + 每日费用
		}
	}
	let labels = Object.keys(result)
	let values = labels.map(e => result[e])
	return {
		code: 200,
		msg: '按年统计成功',
		data: {
			labels,
			values
		}
	}
}

async function 统计某月收入(data) {
	if (!data.year || !data.month) return {
		msg: '统计未指定年月',
		code: 400
	}
	if (isNaN(Number(data.year)) || isNaN(Number(data.month))) return {
		msg: '日期格式错误',
		code: 400
	}
	let start = `${data.year}/${data.month}/1 00:00:00`
	start = new Date(start)
	let end
	if (data.month == 12) {
		end = `${Number(data.year) + 1}/1/1 00:00:00`
	} else {
		end = `${data.year}/${Number(data.month) + 1}/1 00:00:00`
	}
	end = new Date(end)
	let res = await 查询日期范围内订单(start, end)
	if (res.code != 200) return res
	let result = {}
	// 构造一月中每天
	let total = new Date(data.year, data.month, 0).getDate()
	for (let i = 1; i <= total; i++) {
		result[`${i}`] = 0
	}
	for (let order of res.data) {
		let 每日费用 = order.pay / ((order.end - order.start) / 一天)
		let start2 = Math.max(order.start.getTime(), start.getTime())
		let end2 = Math.min(order.end.getTime(), end.getTime())
		for (let i = start2; i < end2; i += 一天) {
			// 转换成天 累加到对应天
			let day = new Date(i).getDate()
			result[day] = result[day] + 每日费用
		}
	}
	let labels = Object.keys(result)
	let values = labels.map(e => result[e])
	return {
		code: 200,
		msg: '按月统计成功',
		data: {
			labels,
			values
		}
	}
}

async function 统计自定义范围内收入(data) {
	if (!data.start || !data.end) return {
		msg: '统计未指定范围',
		code: 400
	}
	let start = new Date(`${data.start} 00:00:00`)
	let end = new Date(`${data.end} 00:00:00`)
	if (isNaN(start.getTime()) || isNaN(end.getTime())) return {
		msg: '日期格式不正确',
		code: 400
	}
	// 这里要把自定义日期末尾往后推一天
	end.setDate(end.getDate() + 1)
	let res = await 查询日期范围内订单(start, end)
	if (res.code != 200) return res
	let result = {}
	// 构造自定义范围内每天
	for (let i = start.getTime(); i <= end.getTime(); i += 一天) {
		let t = new Date(i)
		result[`${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`] = 0
	}
	for (let order of res.data) {
		let 每日费用 = order.pay / ((order.end - order.start) / 一天)
		let start2 = Math.max(order.start.getTime(), start.getTime())
		let end2 = Math.min(order.end.getTime(), end.getTime())
		for (let i = start2; i < end2; i += 一天) {
			// 转换成日期 累加到对应日期
			let t = new Date(i)
			let date = `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`
			result[date] = result[date] + 每日费用
		}
	}
	let labels = Object.keys(result)
	let values = labels.map(e => result[e])
	return {
		code: 200,
		msg: '自定义范围统计成功',
		data: {
			labels,
			values
		}
	}
}

// 云函数入口函数
exports.main = async (event, context) => {
	// 校验必要字段
	let {
		type,
		data
	} = event
	if (!type) return {
		msg: '未指定统计类型',
		code: 400
	}
	let p
	switch (type) {
		case '按年':
			p = 统计某年收入(data)
			break
		case '按月':
			p = 统计某月收入(data)
			break
		case '自定义':
			p = 统计自定义范围内收入(data)
			break
	}
	return p.catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
};