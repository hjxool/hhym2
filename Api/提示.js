import Store from '/Store/main.js'

export function 弹窗(msg) {
	Store.commit('setState', {
		key: '提示',
		value: {
			show: true,
			msg,
			type:'弹窗'
		}
	})
}