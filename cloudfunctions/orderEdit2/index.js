// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 订单列表 = db.collection("orders2");
const _ = db.command; // 指令

async function 分页查询(data) {
	// 校验必需字段
	if (!data.pageSize || !data.pageNum) {
		return {
			msg: '缺少参数',
			code: 400
		}
	}
	let conditions = []
	if (data.userId) {
		conditions.push({
			userId: data.userId
		})
	}
	if (data.keyWords?.trim()) {
		conditions.push(_.or([{
				name: db.RegExp({
					regexp: keyWords,
					options: 'i'
				})
			},
			{
				phone: db.RegExp({
					regexp: keyWords,
					options: 'i'
				})
			},
			{
				'pets.name': db.RegExp({
					regexp: keyWords,
					options: 'i'
				})
			}
		]))
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
	return collection.skip((data.pageNum - 1) * data.pageSize).limit(data.pageSize).get().then(({
		data
	}) => ({
		msg: '成功',
		code: 200,
		data
	}))
}

const keys = ['name', 'phone', 'pets']
async function 新增订单(data) {
	// 校验
	for (let key in data) {
		if (!keys.includes(key)) {
			return {
				msg: '缺少参数',
				code: 400
			}
		}
		if (!data[key]?.length) {
			return {
				msg: '创建订单错误',
				code: 400
			}
		}
	}
	let {
		room,
		start,
		end,
		pay,
		status,
		userId,
		name,
		phone,
		pets,
	} = data
	return 订单列表.add({
		data: {
			room,
			start: new Date(start),
			end: new Date(end),
			pay,
			status,
			userId,
			name,
			phone,
			pets,
		}
	}).then(() => ({
		msg: '创建订单成功',
		code: 200
	}))
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
			d[key] = data[key]
		}
	}
	return 订单列表.doc(data._id).update({
		data: d
	}).then(() => ({
		msg: '更新订单成功',
		code: 200
	}))
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