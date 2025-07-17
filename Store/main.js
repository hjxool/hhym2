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
import {
	请求接口
} from '/Api/请求接口.js';

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
			计价规则: {
				标准间: '',
				豪华间: '',
				折扣规则: [],
				日期规则: []
			},
			宠物数量: 1,
			用户ID: '',
			房间可用状态列表: []
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
			for (let val of state.计价规则.折扣规则) {
				if (total >= val.moreThan && 最低折扣 > val.discount) {
					// 如果达到某一天数界限 且 最低折扣大于该天数对应折扣 则更新最低折扣
					最低折扣 = val.折扣
				}
			}
			let 单天额外费用 = 30 * (state.宠物数量 - 1)
			// 超过天数的按原价乘以折扣 不超过一定天数维持原价的检索特定日期规则
			if (最低折扣 == 1) {
				let 原价天数 = getters.总天数
				let 标准间特价 = 0
				let 豪华间特价 = 0
				let start = new Date(state.日期.入住).getTime()
				// 离店日期不算价格
				let end = new Date(state.日期.离店).getTime() - 一天
				for (let val of state.计价规则.日期规则) {
					let bs = new Date(val.start).getTime()
					let be = new Date(val.end).getTime()
					let 特价天数 = 0
					if (start <= bs) {
						if (end >= bs && end < be) {
							特价天数 = (end - bs) / 一天 + 1
						} else if (end >= be) {
							特价天数 = (be - bs) / 一天 + 1
						}
					} else if (start > bs && start <= be) {
						if (end <= be) {
							特价天数 = (end - start) / 一天 + 1
						} else if (end > be) {
							特价天数 = (be - start) / 一天 + 1
						}
					}
					特价天数 = Math.floor(特价天数)
					原价天数 -= 特价天数
					if (原价天数 < 0) {
						原价天数 = 0
					}
					let 额外 = 单天额外费用 * 特价天数 // 特价期间的多只额外费用
					标准间特价 += (val.price1 * 特价天数 + 额外)
					豪华间特价 += (val.price2 * 特价天数 + 额外)
				}
				let 额外 = 单天额外费用 * 原价天数 // 原价期间的多只额外费用
				let p1 = state.计价规则.标准间 * 原价天数 + 额外
				let p2 = state.计价规则.豪华间 * 原价天数 + 额外
				return {
					标准间优惠: Math.floor((p1 + 标准间特价) * 100) / 100,
					豪华间优惠: Math.floor((p2 + 豪华间特价) * 100) / 100,
				}
			} else {
				return {
					标准间优惠: Math.floor((state.计价规则.标准间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
					豪华间优惠: Math.floor((state.计价规则.豪华间 + 30 * (state.宠物数量 - 1)) * total * 最低折扣 * 100) / 100,
				}
			}
		},
		总天数(state) {
			return 计算天数(state.日期.入住, state.日期.离店)
		}
	},
	actions: {
		async 更新房间可用状态({
			state,
			commit
		}) {
			if (state.日期.入住 && state.日期.离店) {
				let res = await 请求接口('useableRoom2', {
					start: state.日期.入住,
					end: state.日期.离店
				})
				if (res) {
					commit('setState', {
						key: '房间可用状态列表',
						value: res
					})
				}
			}
		},
		async 查询计价规则({
			state,
			commit
		}) {
			let res = await 请求接口('ruleEdit2', {
				type: '查询'
			})
			if (res) {
				let 日期规则 = [...res.datePrices].sort((a, b) => new Date(a.start) - new Date(b.start))
				commit('setState', {
					key: '计价规则',
					value: {
						标准间: res.roomPrice1,
						豪华间: res.roomPrice2,
						折扣规则: res.discounts,
						日期规则
					}
				})
			}
		},
	}
});