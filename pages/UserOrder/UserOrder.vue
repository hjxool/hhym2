<template>
	<view class="page colLayout">
		<view class="flexGrow">
			<view class="title">已添加宠物</view>

			<view class="petBox">
				<view class="pet rowLayout" :class="{ selected: item.选中 }" v-for="item in form.宠物列表" @click="勾选宠物('单选', item)">
					🐱 {{ item.name }} - {{ item.品种 }}
				</view>
			</view>

			<button class="button center" style="margin-bottom: 20rpx">添加</button>

			<view class="formBox noShrink">
				<view class="title">日期</view>
				<view class="rowLayout" @click="显示日历 = true" style="justify-self: end">
					<view class="color1">{{ 日期 }}</view>
					<view class="color1" style="margin-left: 20rpx">共 {{ 总天数 }} 天</view>
				</view>
			</view>

			<view class="formBox noShrink">
				<view class="title">房间</view>
				<view class="color1" style="justify-self: end">{{ 房间 }}</view>
			</view>

			<view class="formBox noShrink">
				<view class="title noShrink">联系人</view>
				<input class="input flexGrow" v-model="form.联系人" placeholder="必填" />
			</view>

			<view class="formBox noShrink">
				<view class="title noShrink">联系号</view>
				<input class="input flexGrow" v-model="form.联系号" placeholder="必填" />
			</view>

			<view class="formBox2 colLayout">
				<view class="title">从何了解到本店</view>
				<textarea class="input" v-model="form.从何"></textarea>
			</view>

			<view class="noticeBox noShrink">
				<view class="title">预定须知</view>
				<view style="margin: 32rpx 40rpx 0">预约后请及时与店长联系</view>
			</view>

			<view class="noShrink" style="margin-left: 20rpx; margin-top: 40rpx">
				<van-checkbox :value="form.阅读协议" @change="勾选协议($event)" shape="square">
					<view class="rowLayout">
						<view class="color2">已阅读并同意</view>
						<view class="color3">《服务协议》</view>
					</view>
				</van-checkbox>
			</view>
		</view>

		<van-submit-bar :tip="提示" :price="总价" button-text="提交预约" @submit="提交()">
			<van-checkbox :value="form.全选" @change="勾选宠物('全选', $event)">全选</van-checkbox>
		</van-submit-bar>
	</view>

	<cusCalendar :show="显示日历" @close="显示日历 = false" />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import cusCalendar from '/Components/cusCalendar/cusCalendar.vue';

// 属性
const store = useStore();
const form = ref({
	宠物列表: [
		{ name: '毛毛', 品种: '英短', 选中: false },
		{ name: '毛毛', 品种: '英短', 选中: false }
	],
	联系人: '',
	联系号: '',
	从何: '',
	阅读协议: false,
	全选: false
});
const 总价 = computed(() => {
	let { 标准间优惠, 豪华间优惠 } = store.getters.折扣总价;
	let t = store.state.房间.substring(0, 3);
	return t == '标准间' ? 标准间优惠 * 100 : 豪华间优惠 * 100;
});
const 提示 = computed(() => {
	let count = form.value.宠物列表.reduce((pre, cur) => {
		return cur.选中 ? pre + 1 : pre;
	}, 0);
	if (count > 1) {
		return '每多一只加30，受折扣影响';
	} else {
		return false;
	}
});
const 总天数 = computed(() => store.getters.总天数);
const 日期 = computed(() => {
	let { 入住, 离店 } = store.state.日期;
	let start = 入住.split('/');
	let end = 离店.split('/');
	return `${start[0]}年${start[1]}月${start[2]}日 ~ ${end[0]}年${end[1]}月${end[2]}日`;
});
const 显示日历 = ref(false);
const 房间 = computed(() => store.state.房间);

// 方法
function 提交() {}
function 勾选宠物(type, args) {
	switch (type) {
		case '单选':
			args.选中 = !args.选中;
			let t = form.value.宠物列表.find((e) => e.选中 == false);
			if (t) {
				form.value.全选 = false;
			} else {
				form.value.全选 = true;
			}
			break;
		case '全选':
			let { detail } = args;
			form.value.全选 = detail;
			form.value.宠物列表.forEach((e) => {
				e.选中 = form.value.全选;
			});
			break;
	}
	let count = form.value.宠物列表.reduce((pre, cur) => {
		return cur.选中 ? pre + 1 : pre;
	}, 0);
	store.commit('setState', {
		key: '宠物数量',
		value: count || 1 // 最少也是1
	});
}
function 勾选协议({ detail }) {
	form.value.阅读协议 = detail;
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.page {
	overflow: hidden;
	font-family: 'Arial', sans-serif;
	> .flexGrow {
		overflow-x: hidden;
		margin-bottom: 168rpx;
		padding-bottom: 80rpx;
		> .title {
			color: #333;
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 36rpx;
		}
		> .petBox {
			// background: #fce5cd;
			background: #fff5e1;
			padding: 30rpx;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			> .pet {
				background: #fff;
				padding: 24rpx;
				border-radius: 16rpx;
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
				font-size: 32rpx;
				font-weight: bold;
				transition: 0.3s;
				&::before {
					content: '🐾';
					font-size: 40rpx;
					margin-right: 16rpx;
					color: #ff8c42;
				}
				& + .pet {
					margin-top: 20rpx;
				}
			}
			> .selected {
				background: #ffe0b2; /* 选中时背景变浅橙色 */
				border: 4rpx solid #ff8c42; /* 高亮边框 */
				box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
			}
		}
		> .button {
			height: 80rpx;
			background-color: #ff8c42;
			color: #fff;
			border: none;
			border-radius: 16rpx;
			margin: 0 40rpx;
		}
		> .formBox {
			display: grid;
			grid-template-columns: 120rpx auto;
			padding: 30rpx;
			border-top: 8rpx solid rgba(128, 128, 128, 0.2);
			overflow: hidden;
			> .title {
				font-size: 28rpx;
				font-weight: bold;
			}
			.color1 {
				font-size: 28rpx;
				color: #66b9dd;
			}
			.input {
				background: transparent;
				border: none;
				text-align: right;
			}
		}
		> .formBox2 {
			padding: 30rpx;
			border-top: 8rpx solid rgba(128, 128, 128, 0.2);
			.input {
				height: 150rpx;
				border-radius: 20rpx;
				background: rgba(211, 211, 211, 0.3);
				width: 100%;
				margin-top: 20rpx;
			}
		}
		> .noticeBox {
			padding: 20rpx;
			> .title {
				color: #333;
				font-size: 36rpx;
				font-weight: bold;
				margin-bottom: 36rpx;
			}
		}
		.color2 {
			font-size: 28rpx;
			color: #808080;
		}
		.color3 {
			font-size: 32rpx;
			color: #66c9e8;
		}
	}
}
</style>
