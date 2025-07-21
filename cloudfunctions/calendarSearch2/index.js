// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("orders2");
const _ = db.command; // 指令

function 用户聚类(source) {
	let users = {}
	// 同一天不同人 算多个，不同日期的同一人算多个
	let count = 0 // 统计用户数
	for (let val of source) {
		// 根据用户ID去重
		if (!users[val.userId]) {
			count++
			users[val.userId] = {
				name: val.name,
				phone: val.phone,
				orders: []
			}
		}
		// 注意订单日期是Date对象 要转换一下
		let item = {
			...val
		}
		let t = new Date(val.start)
		item.start = `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`
		t = new Date(val.end)
		item.end = `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`
		users[val.userId].orders.push(item)
	}
	let list = Object.entries(users).map(([userId, data]) => data)
	return {
		list,
		count
	}
}

// 云函数入口函数
exports.main = async (event, context) => {
	// 校验必要字段
	if (!event.start || !event.end) return {
		msg: '查询缺少日期',
		code: 400
	}
	let start = new Date(`${event.start} 00:00:00`)
	let end = new Date(`${event.end} 00:00:00`)
	if (isNaN(start.getTime()) || isNaN(end.getTime())) return {
		msg: '日期格式不正确',
		code: 400
	}
	// 使用聚合操作
	let res = await 订单列表.aggregate().match({ // 同where条件检索
		// 注意 不能按照订单的查询方式 只查开始时间在范围内的
		start: _.gte(start).and(_.lte(end)),
		status: 0, // 只检索待确认订单
	}).group({
		_id: { // _id为必需字段 不然无法执行
			date: { // 按日期聚类
				$dateToString: { // 日期类型操作符
					format: '%Y/%m/%d', // %Y必须用大写Y 表示4位年份 %m和%d是小写
					date: '$start' // 表示从start字段中取日期
				}
			}
		},
		// 同一日期下的订单放到数组中
		orders: {
			$push: '$$ROOT'
		}
	}).end().then(({
		list
	}) => ({
		code: 200,
		msg: '日期聚类成功',
		data: list
	})).catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
	if (res.code != 200) return res
	try {
		let data = {}
		let total = 0
		for (let val of res.data) {
			// 日期格式为2025/08/01
			let arr = val._id.date.split('/')
			let {
				list,
				count
			} = 用户聚类(val.orders)
			total += count
			data[`${arr[0]}/${Number(arr[1])}/${Number(arr[2])}`] = list
		}
		return {
			code: 200,
			msg: '日历查询成功',
			data: {
				total,
				data
			}
		}
	} catch ({
		message
	}) {
		return {
			code: 400,
			msg: message,
		}
	}
};