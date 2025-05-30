import Store from '/Store/main.js'

export function 弹窗(msg) {
	Store.commit('setState', {
		key: '提示',
		value: {
			show: true,
			msg,
			type: '弹窗',
			msgType: ''
		}
	})
}

const 消息类型 = {
	'成功': 'success',
	'失败': 'warning'
}
export function 消息(msg, type = '成功') {
	Store.commit('setState', {
		key: '提示',
		value: {
			show: true,
			msg,
			type: '消息',
			msgType: 消息类型[type],
		}
	})
}