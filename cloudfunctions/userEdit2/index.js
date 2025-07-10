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
			msg: '查询用户参数缺失',
			code: 400
		}
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
	return Promise.all([
		客户列表.count(),
		collection.skip((data.pageNum - 1) * data.pageSize).limit(data.pageSize).get().then(({
			data
		}) => data)
	]).then(([totalRes, dataRes]) => ({
		msg: '成功',
		code: 200,
		data: {
			total: totalRes.total || 0,
			data: dataRes
		}
	}))
}

const keys = ['userId', 'name', 'phone', 'pets']
async function 新增用户(data) {
	// 用户校验不同于订单 并不需要严格匹配对应参数 但是要确保必要参数
	let count = 0
	for (let key in data) {
		if (keys.includes(key)) {
			count++
			// 值判断必要参数不能为空
			if (!data[key]?.length) {
				return {
					msg: '新增用户有参数为空',
					code: 400
				}
			}
		}
	}
	if (count != keys.length) return {
		msg: '新增用户缺少必要参数',
		code: 400
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
		// 这类字段不允许更新
		if (key != '_id' && key != 'userId') {
			if (typeof data[key] == 'number') {
				d[key] = data[key]
			} else {
				d[key] = data[key] || ''
			}
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
			if (!data.userId) return {
				msg: '个人信息缺少ID',
				code: 400
			}
			// 这里不能用doc(data.userId) 因为查询并不一定要求非得有数据
			// 有数据就回显 没数据就作为标识 但doc查询不到对应id会报错
			p = 客户列表.where({
				_id: data.userId
			}).get().then(({
				data
			}) => ({
				msg: '成功',
				code: 200,
				data: data[0]
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