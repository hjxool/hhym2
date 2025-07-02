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
					<view class="button center" style="margin: 0 0 0 20rpx">2025/10/1</view>
					<view class="button center" style="margin: 0 0 0 20rpx">2025/10/3</view>
				</view>

				<view class="title">房间</view>
				<view class="button center" @click="弹窗操作('房间')">{{ form.房间 || '选择房间' }}</view>

				<view class="title">订单金额</view>
				<input class="input" type="number" />
			</view>

			<view class="button center noShrink">提交</view>
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
						<van-checkbox :value="item.check">{{ item.name }}</van-checkbox>

						<view class="center" @click="弹窗操作('宠物详情', item.detail)" style="height: 100%; width: 60rpx">
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
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import { 消息 } from '/Api/提示.js';
import { ref } from 'vue';

// 属性
const 弹窗 = ref({
	选项显示: false,
	当前操作: '',
	宠物详情显示: false,
	宠物详情: [],
	可选宠物显示: false
});
const form = ref({
	客户: '',
	房间: '',
	宠物: []
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
	房间: [
		{ name: '标准间1', disabled: false },
		{ name: '标准间2', disabled: true },
		{ name: '标准间3', disabled: false },
		{ name: '豪华间1', disabled: true }
	],
	宠物: []
});

// 方法
function 弹窗操作(type, args) {
	switch (type) {
		case '客户':
		case '房间':
			弹窗.value.选项显示 = !弹窗.value.选项显示;
			if (弹窗.value.选项显示) {
				// 打开弹窗
				弹窗.value.当前操作 = type;
			} else {
				// 选择完毕关闭弹窗
				if (type == '客户') {
					if (args.detail) {
						// 选了客户 则赋值 并取宠物列表
						form.value[type] = args.detail;
						// 添加勾选属性
						列表.value.宠物 = args.detail.pets.map((e) => ({ check: false, ...e }));
						// 绑定新客户时 清除已选宠物
						form.value.宠物 = [];
					} else {
						// 清空客户 则清除客户信息 并清除宠物列表和所选宠物
						form.value[type] = '';
						form.value.宠物 = [];
						列表.value.宠物 = [];
					}
				} else {
					form.value[type] = args.detail?.name || '';
				}
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
				弹窗.value.当前操作 = type;
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
	}
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
				padding: 24rpx 40px;
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
