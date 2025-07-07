import {
	弹窗,
	消息
} from './提示.js'

export async function 请求接口(name, data) {
	let options = {
		name
	}
	if (data) {
		options['data'] = data
	}
	console.log(`${name}接口请求参数`, data)
	return wx.cloud.callFunction(options)
		.then(({
			result: {
				code,
				msg,
				data
			}
		}) => {
			console.log(`${name}接口返回数据`, data)
			if (code == 200) {
				return data
			} else {
				消息(msg, '失败')
				return false
			}
		})
		.catch(({
			errMsg
		}) => {
			console.log(`${name}接口请求异常`, errmsg)
			弹窗(errMsg)
			return false
		})
}