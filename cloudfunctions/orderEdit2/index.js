// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("orders2");
const _ = db.command; // 指令

function 更新用户费用(userId) {
	return cloud.callFunction({
		name: 'countUserPay2',
		data: {
			userId,
		}
	}).then(({
		result
	}) => result).catch(({
		errMsg
	}) => ({
		msg: errMsg,
		code: 400
	}))
}

async function 分页查询(data) {
	// 校验必需字段
	if (!data.pageSize || !data.pageNum) {
		return {
			msg: '订单查询参数缺失',
			code: 400
		}
	}
	let conditions = []
	// 根据用户查询
	if (data.userId) {
		conditions.push({
			userId: data.userId
		})
	}
	// 关键字查询
	if (data.keyWords && data.keyWords?.trim()) {
		conditions.push(_.or([{
				name: db.RegExp({
					regexp: data.keyWords,
					options: 'i'
				})
			},
			{
				phone: db.RegExp({
					regexp: data.keyWords,
					options: 'i'
				})
			},
			{
				'pets.name': db.RegExp({
					regexp: data.keyWords,
					options: 'i'
				})
			}
		]))
	}
	// 根据时间查询 时间不能直接赋值
	if (data.start) {
		// 开始时间之后的订单
		let t = new Date(`${data.start} 00:00:00`)
		if (isNaN(t.getTime())) return {
			msg: '日期格式不正确',
			code: 400
		}
		conditions.push({
			end: _.gte(t)
		})
	}
	if (data.end) {
		let t = new Date(`${data.end} 00:00:00`)
		if (isNaN(t.getTime())) return {
			msg: '日期格式不正确',
			code: 400
		}
		conditions.push({
			start: _.lte(t)
		})
	}
	// 根据订单状态查询
	if (data.status !== undefined) {
		conditions.push({
			status: data.status
		})
	}
	let collection
	switch (conditions.length) {
		case 0:
			collection = 订单列表
			break
		case 1:
			collection = 订单列表.where(conditions[0])
			break
		default:
			// 多个条件用and连接
			collection = 订单列表.where(_.and(conditions))
			break
	}
	return Promise.all([
		collection.count(), // 应该按查询条件统计
		// 注意订单应当倒序查找
		collection.skip((data.pageNum - 1) * data.pageSize).limit(data.pageSize).orderBy('start', 'desc')
		.get().then(({
			data
		}) => data)
	]).then(([totalRes, dataRes]) => ({
		msg: '成功',
		code: 200,
		data: {
			total: totalRes.total || 0,
			data: dataRes.map(e => {
				let d = {
					...e
				}
				// 注意 订单时间是Date对象 查询回来的结果会转成 ISO 8601 格式的字符串
				// 因此要单独处理下
				let t = new Date(e.start)
				d.start = `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`
				t = new Date(e.end)
				d.end = `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`
				return d
			}),
		}
	}))
}

const keys = ['room', 'start', 'end', 'pay', 'status', 'userId', 'name', 'phone', 'pets']
async function 新增订单(data) {
	// 校验
	for (let key in data) {
		if (!keys.includes(key)) {
			return {
				msg: '新增订单参数不符',
				code: 400
			}
		}
		if ((key != 'status' && key != 'pay') && !data[key]?.length) {
			return {
				msg: '订单参数为空',
				code: 400
			}
		}
	}
	return 订单列表.add({
		data: {
			room: data.room,
			start: new Date(`${data.start} 00:00:00`),
			end: new Date(`${data.end} 00:00:00`),
			pay: data.pay,
			status: data.status,
			userId: data.userId,
			name: data.name,
			phone: data.phone,
			pets: data.pets,
		}
	}).then(async ({
		_id
	}) => {
		// add成功后会返回新创建记录的文档ID
		if (data.status == 1) {
			// 添加的是已完成订单 则更新用户信息
			let res = await 更新用户费用(data.userId)
			if (res.code != 200) {
				// 回滚删除订单
				return 订单列表.doc(_id).remove().then(() => ({
					msg: '更新用户费用失败回滚订单成功',
					code: 400
				})).catch(() => ({
					msg: '更新用户费用失败回滚订单失败',
					code: 400
				}))
			}
			return res
		} else {
			return {
				msg: '创建订单成功',
				code: 200
			}
		}
	})
}

async function 编辑订单(data) {
	if (!data._id) {
		return {
			msg: '缺少订单ID',
			code: 400
		}
	}
	let d = {}
	for (let key in data) {
		if (key != '_id') {
			if (key == 'start' || key == 'end') {
				let t = new Date(`${data[key]} 00:00:00`)
				if (isNaN(t.getTime())) return {
					msg: '日期格式错误',
					code: 400
				}
				d[key] = t
			} else {
				d[key] = data[key]
			}
		}
	}
	return 订单列表.doc(data._id).update({
		data: d
	}).then(async () => {
		if (data.status == 1) {
			let res = await 更新用户费用(data.userId)
			if (res.code != 200) {
				return 订单列表.doc(data._id).update({
					// 正常应该先存原始数据 此处还原 但是偷懒一下
					// 因为使用场景只存在单独更新订单状态的情况
					status: 0
				}).then(() => ({
					msg: '更新用户费用失败回滚订单成功',
					code: 400
				})).catch(() => ({
					msg: '更新用户费用失败回滚订单失败',
					code: 400
				}))
			}
			return res
		} else {
			return {
				msg: '更新订单成功',
				code: 200
			}
		}
	})
}

async function 删除订单(data) {
	if (!data?.length) {
		return {
			msg: '缺少订单ID列表',
			code: 400
		}
	}
	return 订单列表.where({
		_id: _.in(data)
	}).remove().then(() => ({
		msg: '删除订单成功',
		code: 200
	}))
}

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
	let p
	switch (type) {
		case '查询':
			p = 分页查询(data)
			break
		case '新增':
			p = 新增订单(data)
			break
		case '编辑':
			p = 编辑订单(data)
			break
		case '删除':
			p = 删除订单(data)
			break
	}
	return p.catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
};