import {
	createStore
} from 'vuex';
import {
	弹窗
} from '../Api/提示.js'
import {
	今天,
	明天,
	计算天数
} from '../Api/时间参数.js'

export default createStore({
	state() {
		return {
			提示: {
				show: false,
				msg: '',
				type: '',
				msgType: ''
			},
			日期: {
				入住: 今天,
				离店: 明天
			},
			费用: {
				标准间: 88,
				豪华间: 118,
				// 自定义折扣规则 key代表天数 value代表折扣系数
				规则: {
					'10': 0.8,
					'20': 0.6
				},
			},
			宠物数量: 1
		};
	},
	mutations: {
		setState(State, args) {
			if (!args?.key) {
				弹窗('传参错误')
				return;
			}
			State[args.key] = args.value;
		},
	},
	getters: {
		折扣总价(state, getters) {
			let total = getters.总天数
			let 最低折扣 = 1
			for (let [day, discount] of Object.entries(state.费用.规则)) {
				if (total >= Number(day) && 最低折扣 > discount) {
					// 如果达到某一天数界限 且 最低折扣大于该天数对应折扣 则更新最低折扣
					最低折扣 = discount
				}
			}
			return {
				标准间优惠: Math.floor((state.费用.标准间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
				豪华间优惠: Math.floor((state.费用.豪华间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
			}
		},
		总天数(state) {
			return 计算天数(state.日期.入住, state.日期.离店)
		}
	}
});