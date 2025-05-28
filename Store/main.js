import {
	createStore
} from 'vuex';
import {
	弹窗
} from '../Api/提示.js'

export default createStore({
	state() {
		return {
			提示: {
				show: false,
				msg: '',
				type: ''
			}
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