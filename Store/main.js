import {
	createStore
} from 'vuex';
import {
	弹窗
} from '../Api/提示.js'
import {
	今天,
	明天
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
			入住日期: 今天,
			离店日期: 明天
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
});