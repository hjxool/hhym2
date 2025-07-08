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
			console.log(`${name}接口返回数据`, msg, data)
			if (code == 200) {
				// 返回的数据有时为空 但页面又需要判断是否继续执行 所以不能传undefined
				return data || true
			} else {
				消息(msg, '失败')
				return false
			}
		})
		.catch(({
			errMsg
		}) => {
			console.log(`${name}接口异常`, errMsg)
			弹窗(errMsg)
			return false
		})
}