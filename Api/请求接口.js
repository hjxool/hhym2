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
	return wx.cloud.callFunction(options)
		.then(({
			result: {
				code,
				msg,
				data
			}
		}) => {
			if (code == 200) {
				return data
			} else {
				消息(msg, '失败')
				return false
			}
		})
		.catch(err => {
			弹窗(err)
			return false
		})
}