import {
	createStore
} from 'vuex';
import {
	弹窗
} from '../Api/提示.js'
import {
	今天,
	明天,
	计算天数,
	一天
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
				规则: [{
						type: '按天数',
						大于: 10,
						折扣: 0.8
					},
					{
						type: '按天数',
						大于: 20,
						折扣: 0.6
					},
					{
						type: '按日期',
						开始日期: '2025/7/1',
						结束日期: '2025/7/1',
						标准间: 50,
						豪华间: 90
					},
					{
						type: '按日期',
						开始日期: '2025/7/20',
						结束日期: '2025/7/23',
						标准间: 100,
						豪华间: 200
					}
				]
			},
			宠物数量: 1,
			用户ID: ''
		};
	},
	mutations: {
		setState(State, args) {
			if (!args?.key) {
				弹窗('传参错误')
				return;
			}
			// (\w+) 是一个捕获组 会提取中括号里的内容（比如 0 或 key）
			// '$1' 代表 第一个捕获组的内容
			let arr = args.key.replace(/\[(\w+)\]/g, '.$1').split('.');
			let current = State;
			try {
				// 注意 得取到最后一级的父级 不然修改对象属性值无效
				for (let i = 0; i < arr.length - 1; i++) {
					let key = arr[i];
					current = current[key];
				}
				let key = arr[arr.length - 1];
				current[key] = args.value;
			} catch (error) {
				弹窗('传参错误')
			}
		},
	},
	getters: {
		折扣总价(state, getters) {
			let total = getters.总天数
			let 最低折扣 = 1
			for (let val of state.费用.规则) {
				if (val.type == '按天数' && total >= val.大于 && 最低折扣 > val.折扣) {
					// 如果达到某一天数界限 且 最低折扣大于该天数对应折扣 则更新最低折扣
					最低折扣 = discount
				}
			}
			let 单天额外费用 = 30 * (state.宠物数量 - 1)
			// 超过天数的按原价乘以折扣 不超过一定天数维持原价的检索特定日期规则
			if (最低折扣 == 1) {
				let 原价天数 = getters.总天数
				let 标准间特价 = 0
				let 豪华间特价 = 0
				for (let val of state.费用.规则) {
					if (val.type == '按日期') {
						let bs = new Date(val.开始日期).getTime()
						let be = new Date(val.开始日期).getTime()
						let start = new Date(state.日期.入住).getTime()
						// 离店日期不算价格
						let end = new Date(state.日期.离店).getTime() - 一天
						let t = 0
						if (start <= bs) {
							if (end >= bs && end < be) {
								t = (end - bs) / 一天 + 1
							} else if (end >= be) {
								t = (be - bs) / 一天 + 1
							}
						} else if (start > bs && start <= be) {
							if (end <= be) {
								t = (end - start) / 一天 + 1
							} else if (end > be) {
								t = (be - start) / 一天 + 1
							}
						}
						t = Math.floor(t)
						原价天数 -= t
						if (原价天数 < 0) {
							原价天数 = 0
						}
						let 额外 = 单天额外费用 * t
						标准间特价 += val.标准间 * t + 额外
						豪华间特价 += val.豪华间 * t + 额外
					}
				}
				let 额外 = 单天额外费用 * 原价天数
				let p1 = state.费用.标准间 * 原价天数
				let p2 = state.费用.豪华间 * 原价天数
				return {
					标准间优惠: Math.floor((p1 + 标准间特价) * 100) / 100,
					豪华间优惠: Math.floor((p2 + 豪华间特价) * 100) / 100,
				}
			} else {
				return {
					标准间优惠: Math.floor((state.费用.标准间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
					豪华间优惠: Math.floor((state.费用.豪华间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
				}
			}
		},
		总天数(state) {
			return 计算天数(state.日期.入住, state.日期.离店)
		}
	}
});