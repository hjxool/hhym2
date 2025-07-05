// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
	env: "cloud1-0gzy726e39ba4d96",
	traceUser: true
}); // 使用当前云环境
const db = cloud.database();
const 客户列表 = db.collection("customers2");
const _ = db.command; // 指令

async function 分页查询(data) {
	// 校验必需字段
	if (!data.pageSize || !data.pageNum) {
		return {
			msg: '缺少参数',
			code: 400
		}
	}
	if (data.userId) {
		return 客户列表.doc(data.userId).get().then(({
			data
		}) => ({
			msg: '成功',
			code: 200,
			data
		}))
	}
	let collection = 客户列表
	if (data.keyWords?.trim()) {
		collection = 客户列表.where(_.or([{
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
	return collection.skip((data.pageNum - 1) * data.pageSize).limit(data.pageSize).get().then(({
		data
	}) => ({
		msg: '成功',
		code: 200,
		data
	}))
}

const keys = ['userId', 'name', 'phone', 'pets']
async function 新增用户(data) {
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
				msg: '有参数为空',
				code: 400
			}
		}
	}
	let {
		userId,
		name,
		phone,
		pets,
		knowFrom
	} = data
	return 客户列表.add({
		data: {
			_id: userId,
			name,
			phone,
			pets,
			knowFrom: knowFrom || '',
			// 添加初始化字段
			orderCount: 0,
			totalAmount: 0
		}
	}).then(() => ({
		msg: '创建用户成功',
		code: 200
	}))
}

async function 编辑用户(data) {
	if (!data.userId) {
		return {
			msg: '缺少用户ID',
			code: 400
		}
	}
	let d = {}
	for (let key in data) {
		if (key != '_id' && key != 'userId') {
			d[key] = data[key] || ''
		}
	}
	return 客户列表.doc(data.userId).update({
		data: d
	}).then(() => ({
		msg: '更新用户成功',
		code: 200
	}))
}

async function 删除用户(data) {
	if (!data?.length) {
		return {
			msg: '缺少用户ID列表',
			code: 400
		}
	}
	return 客户列表.where({
		_id: _.in(data)
	}).remove().then(() => ({
		msg: '删除用户成功',
		code: 200
	}))
}

// 云函数入口函数
exports.main = async (event, context) => {
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
		case '个人信息':
			p = 客户列表.doc(data.userId).get().then(({
				data
			}) => ({
				msg: '成功',
				code: 200,
				data
			}))
			break
		case '查询':
			p = 分页查询(data)
			break
		case '新增':
			p = 新增用户(data)
			break
		case '编辑':
			p = 编辑用户(data)
			break
		case '删除':
			p = 删除用户(data)
			break
	}
	return p.catch(({
		message
	}) => ({
		msg: message,
		code: 400
	}))
};