<template>
	<view class="page colLayout">
		<view class="flexGrow">
			<view v-for="item in 表单" class="gap" :class="{ rowLayout: item.type != 'textarea' && item.属性 != '传染病' }" :key="item.label">
				<view class="noShrink" :style="{ marginBottom: item.type === 'textarea' || item.属性 === '传染病' ? '20rpx' : '' }">{{ item.label }}</view>

				<input v-if="item.type == 'input'" class="input flexGrow" v-model="form[item.属性]" :placeholder="item.placeholder || ''" type="text" />

				<view v-else-if="item.type == 'button'" class="rowLayout">
					<view class="button center" :class="[form[item.属性] ? 'color2' : 'color1']" @click="form[item.属性] = 0">{{ item.value0 }}</view>
					<view class="button center" :class="[form[item.属性] ? 'color1' : 'color2']" @click="form[item.属性] = 1">{{ item.value1 }}</view>
				</view>

				<textarea v-else class="input flexGrow" v-model="form[item.属性]" style="min-height: 100rpx" auto-height />
			</view>
		</view>

		<view class="footer rowLayout noShrink">
			<view v-if="操作类型 == '编辑'" class="button center flexGrow color1" @click="操作('编辑')">修改</view>
			<view v-if="操作类型 == '编辑'" class="button center flexGrow color2" @click="操作('删除')">删除</view>
			<view v-if="操作类型 == '添加'" class="button center flexGrow color1" @click="操作('添加')">添加</view>
		</view>
	</view>

	<Notify />
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import { ref, getCurrentInstance } from 'vue';
import { 消息 } from '/Api/提示.js';

// 属性
const instance = getCurrentInstance().proxy;
const channel = instance.getOpenerEventChannel();

const 表单 = ref([
	{ label: '昵称', type: 'input', 属性: 'name', placeholder: '必填' },
	{ label: '年龄', type: 'input', 属性: 'age', placeholder: '必填' },
	{ label: '性别', type: 'button', 属性: '性别', value0: '母', value1: '公' },
	{ label: '品种', type: 'input', 属性: '品种', placeholder: '必填' },
	{ label: '性格', type: 'input', 属性: '性格' },
	{ label: '是否绝育', type: 'button', 属性: '绝育', value0: '否', value1: '是' },
	{ label: '是否有耳螨', type: 'button', 属性: '耳螨', value0: '否', value1: '是' },
	{ label: '是否携带猫藓、猫瘟、鼻支等传染病', type: 'button', 属性: '传染病', value0: '否', value1: '是' },
	{ label: '上一次驱虫时间', type: 'input', 属性: '驱虫' },
	{ label: '上一次疫苗时间', type: 'input', 属性: '疫苗', placeholder: '低于八月龄小猫需抗体检测记录' },
	{ label: '特殊要求(喂药、生骨肉等)', type: 'textarea', 属性: '要求' }
]);
const form = ref({
	name: '',
	age: '',
	性别: 0,
	品种: '',
	性格: '',
	绝育: 0,
	耳螨: 0,
	传染病: 0,
	驱虫: '',
	疫苗: '',
	要求: ''
});
const 操作类型 = ref('');

channel.on('操作类型', (type) => {
	操作类型.value = type;
});
channel.on('数据', (data) => {
	form.value = { ...data };
});

// 方法
function 操作(type) {
	// 只要不是删除都要校验
	if (type != '删除') {
		let reg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
		if (!reg.test(form.value.name)) {
			消息('昵称 不能为空', '失败');
			return;
		}
		if (!reg.test(form.value.品种)) {
			消息('品种 不能为空', '失败');
			return;
		}
		if (isNaN(Number(form.value.age))) {
			消息('岁数 必须为数字', '失败');
			return;
		}
	}
	channel.emit('数据', {
		type,
		data: form.value
	});
	uni.navigateBack();
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';

/* 隐藏滚动条 */
::-webkit-scrollbar {
	display: none;
}
.placeholder {
	color: rgba(0, 0, 0, 0.6);
}
.page {
	overflow: hidden;
	> .flexGrow {
		overflow-x: hidden;
		padding: 40rpx 20rpx;
		.gap + .gap {
			margin-top: 20rpx;
		}
		.input {
			background: rgba(230, 230, 230, 0.5);
			border-radius: 20rpx;
			padding: 20rpx;
			margin-left: 30rpx;
		}
		.button {
			font-size: 24rpx;
			border-radius: 400rpx;
			width: 200rpx;
			height: 60rpx;
			margin: 20rpx 0;
			margin-left: 30rpx;
		}
		.color1 {
			background: rgba(255, 0, 0, 0.04);
			box-shadow: 0 1px rgba(255, 0, 0, 0.4);
			color: red;
		}
		.color2 {
			box-shadow: 0 1px rgba(128, 128, 128, 0.4);
			color: rgba(0, 0, 0, 0.6);
		}
	}
	> .footer {
		padding: 10rpx 40rpx 60rpx;
		border-top: 2rpx solid rgba(128, 128, 128, 0.2);
		overflow: hidden;
		> .button {
			border-radius: 20rpx;
			font-size: 36rpx;
			padding: 20rpx 0;
			& + .button {
				margin-left: 40rpx;
			}
		}
		> .color1 {
			background: rgba(255, 165, 0, 0.8);
			color: #fff;
		}
		> .color2 {
			background: rgba(235, 235, 235, 1);
			color: rgba(255, 165, 0, 0.8);
		}
	}
}
</style>
