import {
	弹窗
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
				弹窗('成功')
				return data
			} else {
				弹窗('请求失败')
				return false
			}
		})
		.catch(err => {
			弹窗(err)
			return false
		})
}