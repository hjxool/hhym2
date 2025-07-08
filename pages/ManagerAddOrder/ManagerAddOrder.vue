<template>
	<view class="page">
		<view class="viewBox colLayout">
			<view class="flexGrow">
				<view class="title">客户</view>
				<view class="button center" @click="弹窗操作('客户')">{{ form.客户?.name || '绑定客户' }}</view>

				<view class="title">宠物</view>
				<view class="button center" @click="弹窗操作('宠物')">{{ form.宠物.join('、') || '绑定宠物' }}</view>

				<view class="rowLayout title" style="display: grid; grid-template-columns: 1fr 1fr">
					<view>入住日期</view>
					<view>离店日期</view>
				</view>
				<view class="rowLayout" style="display: grid; grid-template-columns: 1fr 1fr">
					<view class="button center" @click="弹窗操作('入住日期')" style="margin: 0 0 0 20rpx">{{ form.入住日期 }}</view>
					<view class="button center" @click="弹窗操作('离店日期')" style="margin: 0 0 0 20rpx">{{ form.离店日期 }}</view>
				</view>

				<view class="title">房间</view>
				<view class="button center" @click="弹窗操作('房间')">{{ form.房间 || '选择房间' }}</view>

				<view class="title">订单金额</view>
				<input class="input" v-model="form.金额" type="number" />
			</view>

			<view class="button center noShrink" @click="提交()">提交</view>
		</view>
	</view>

	<van-action-sheet
		:show="弹窗.选项显示"
		:actions="列表[弹窗.当前操作]"
		@close="弹窗.选项显示 = false"
		@select="弹窗操作(弹窗.当前操作, $event)"
		cancel-text="取消"
		@cancel="弹窗操作(弹窗.当前操作, $event)"
	/>

	<van-popup :show="弹窗.可选宠物显示" @close="弹窗.可选宠物显示 = false">
		<view class="petsBox colLayout">
			<view class="font noShrink">选择宠物</view>

			<view class="flexGrow">
				<view style="height: 100%; overflow: auto">
					<view class="rowLayout" v-for="item in 列表.宠物" :key="item.name">
						<view class="flexGrow" @click="弹窗操作('勾选宠物', item)">
							<van-checkbox :value="item.check">{{ item.name }}</van-checkbox>
						</view>

						<view class="center noShrink" @click="弹窗操作('宠物详情', item.detail)" style="height: 100%; width: 100rpx">
							<van-icon name="arrow" color="#4c4e52" size="32rpx" />
						</view>
					</view>
				</view>
			</view>

			<view class="font noShrink" @click="弹窗操作(弹窗.当前操作)">取消</view>
		</view>
	</van-popup>

	<Notify />

	<PetsDetail :show="弹窗.宠物详情显示" @close="弹窗.宠物详情显示 = false" :宠物列表="弹窗.宠物详情" />

	<van-popup :show="弹窗.日期显示" position="bottom" custom-style="height: 684rpx;" @close="弹窗.日期显示 = false">
		<van-datetime-picker :value="弹窗.日期" @confirm="弹窗操作('选择日期', $event)" type="date" :min-date="new Date('2022/7/1').getTime()" @cancel="弹窗.日期显示 = false" />
	</van-popup>
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import { 消息 } from '/Api/提示.js';
import { onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
});

// 属性
const store = useStore();
const 弹窗 = ref({
	选项显示: false,
	当前操作: '',
	宠物详情显示: false,
	宠物详情: [],
	可选宠物显示: false,
	日期显示: false,
	日期: ''
});
const form = ref({
	客户: '',
	房间: '',
	宠物: [],
	入住日期: '',
	离店日期: '',
	金额: ''
});
const 列表 = ref({
	客户: [
		{
			id: '1',
			name: '测试1',
			pets: [
				{
					name: '啊实打实',
					detail: {
						昵称: '测试4',
						年龄: 12,
						性别: 1,
						品种: '梨花',
						性格: '普通',
						是否绝育: 1,
						是否有耳螨: 0,
						是否携带传染病: 1,
						上一次驱虫时间: '',
						上一次疫苗时间: '',
						特殊要求: ''
					}
				},
				{ name: 'sss', detail: {} }
			]
		},
		{
			id: '2',
			name: '测试2',
			pets: [
				{ name: '实打实', detail: {} },
				{ name: 'r日日日', detail: {} }
			]
		}
	],
	房间: [],
	宠物: []
});

// 方法
function 弹窗操作(type, args) {
	switch (type) {
		case '客户':
			弹窗.value.选项显示 = !弹窗.value.选项显示;
			if (弹窗.value.选项显示) {
				// 打开弹窗
				弹窗.value.当前操作 = '客户';
			} else {
				if (args.detail) {
					// 选了客户 则赋值 并取宠物列表
					form.value.客户 = args.detail;
					// 添加勾选属性
					列表.value.宠物 = args.detail.pets.map((e) => ({ check: false, ...e }));
					// 绑定新客户时 清除已选宠物
					form.value.宠物 = [];
				} else {
					// 清空客户 则清除客户信息 并清除宠物列表和所选宠物
					form.value.客户 = '';
					列表.value.宠物 = [];
					form.value.宠物 = [];
				}
			}
			break;
		case '房间':
			if (!列表.value.房间.length) {
				消息('请先选择日期', '失败');
				return;
			}
			弹窗.value.选项显示 = !弹窗.value.选项显示;
			if (弹窗.value.选项显示) {
				// 打开弹窗
				弹窗.value.当前操作 = '房间';
			} else {
				// 选择完毕 或 点击取消
				form.value.房间 = args.detail?.name || '';
			}
			break;
		case '宠物':
			if (!列表.value.宠物.length) {
				消息('请先绑定客户', '失败');
				return;
			}
			弹窗.value.可选宠物显示 = !弹窗.value.可选宠物显示;
			if (弹窗.value.可选宠物显示) {
				// 打开弹窗 回显
				弹窗.value.当前操作 = '宠物';
				for (let val of 列表.value.宠物) {
					val.check = form.value.宠物.includes(val.name);
				}
			} else {
				// 会触发关闭弹窗的只有点取消的时候 清空已选宠物
				form.value.宠物 = [];
			}
			break;
		case '宠物详情':
			弹窗.value.宠物详情显示 = true;
			弹窗.value.宠物详情 = [{ ...args }];
			break;
		case '勾选宠物':
			args.check = !args.check;
			if (args.check) {
				form.value.宠物.push(args.name);
			} else {
				for (var i = 0; i < form.value.宠物.length; i++) {
					if (form.value.宠物[i] == args.name) {
						form.value.宠物.splice(i, 1);
						break;
					}
				}
			}
			break;
		case '入住日期':
		case '离店日期':
			弹窗.value.当前操作 = type;
			弹窗.value.日期显示 = true;
			if (form.value[type]) {
				弹窗.value.日期 = new Date(form.value[type]).getTime();
			} else {
				弹窗.value.日期 = Date.now();
			}
			break;
		case '选择日期':
			let d = new Date(args.detail);
			form.value[弹窗.value.当前操作] = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
			弹窗.value.当前操作 = '';
			弹窗.value.日期显示 = false;
			// 修改了日期后需要清除原有房间列表
			列表.value.房间 = [];
			// 如果开始和结束日期校验正确 则查询房间列表及使用状况
			if (form.value.入住日期 && form.value.离店日期) {
				let s = new Date(form.value.入住日期).getTime();
				let e = new Date(form.value.离店日期).getTime();
				// 离店日期不能跟入住日期同一天
				if (e > s) {
					// 查询日期范围内房间状态
					列表.value.房间 = [
						{ name: '标准间1', disabled: false },
						{ name: '标准间2', disabled: true },
						{ name: '标准间3', disabled: false },
						{ name: '豪华间1', disabled: true }
					];
				}
			}
			break;
	}
}
function 提交() {
	let { 客户, 宠物, 房间, 入住日期, 离店日期, 金额 } = form.value;
	// 校验表单
	if (!客户) {
		消息('未绑定客户', '失败');
		return;
	}
	if (!宠物.length) {
		消息('未绑定宠物', '失败');
		return;
	}
	if (!入住日期 || !离店日期) {
		消息('日期未填写', '失败');
		return;
	}
	let start = new Date(入住日期).getTime();
	let end = new Date(离店日期).getTime();
	if (start >= end) {
		消息('离店日期不能小于入住日期', '失败');
		return;
	}
	if (!房间) {
		消息('未选择房间', '失败');
		return;
	}
	if (!金额) {
		消息('订单金额未填写', '失败');
		return;
	}
	let num = Number(金额);
	if (isNaN(num)) {
		消息('订单金额只能为数字', '失败');
		return;
	}
	// 提交接口
}
</script>

<style lang="less" scoped>
.page {
	overflow: hidden;
	padding: 20rpx 20rpx 60rpx;
	> .viewBox {
		padding: 20rpx;
		padding-right: 0;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		height: 100%;
		> .flexGrow {
			padding-right: 20rpx;
			overflow: auto;
			height: 100%;
			color: #4c4e52;
			font-size: 32rpx;
			.title {
				font-size: 36rpx;
				margin: 40rpx 0 20rpx;
				font-weight: bold;
			}
			.button {
				background: #f2f2f2;
				border-radius: 24rpx;
				// padding: 24rpx 40px;
				height: 80rpx;
				margin: 0 40rpx;
				box-shadow: 8rpx 8rpx 20rpx #d1d1d1, -8rpx -8rpx 20rpx #ffffff;
			}
			.input {
				background: #f2f2f2;
				border-radius: 24rpx;
				padding: 24rpx 40px;
				margin: 0 40rpx;
				box-shadow: inset 4rpx 4rpx 12rpx #d1d1d1, inset -4rpx -4rpx 12rpx #ffffff;
				outline: 0;
				text-align: center;
			}
		}
		> .button {
			background: #4c4e52;
			color: #fff;
			border-radius: 20rpx;
			font-size: 32rpx;
			margin-top: 40rpx;
			padding: 20rpx 40rpx;
		}
	}
}
.petsBox {
	width: 80vw;
	min-height: 20vh;
	max-height: 60vh;
	overflow: hidden;
	color: #4c4e52;
	> .font {
		font-weight: bold;
		font-size: 36rpx;
		align-self: center;
		padding: 40rpx 0;
	}
	> .flexGrow {
		border-top: 2rpx solid #dcdcdc;
		border-bottom: 2rpx solid #dcdcdc;
		overflow: hidden;
		.rowLayout {
			padding: 20rpx;
			justify-content: space-between;
			& + .rowLayout {
				border-top: 2rpx solid #dcdcdc;
			}
		}
	}
}
</style>
