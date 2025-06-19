<template>
	<view v-show="提示.show">
		<van-dialog v-show="提示.type == '弹窗'" id="van-dialog" @confirm="点击('confirm')" @cancel="点击('cancel')" :confirm-button-color="'#ee0a24'" />
		<van-notify v-show="提示.type == '消息'" id="van-notify" />
	</view>
</template>

<script setup>
import { computed, watch } from 'vue';
import Dialog from '/wxcomponents/vant/dialog/dialog.js';
import Notify from '/wxcomponents/vant/notify/notify.js';
import { useStore } from 'vuex';
import { getCurrentInstance } from 'vue';

// 属性
const 组件实例 = getCurrentInstance().proxy;
const store = useStore();
const emit = defineEmits(['confirm', 'cancel']);
const 提示 = computed(() => store.state.提示);

watch(
	() => 提示.value,
	({ show }) => {
		if (show) {
			switch (提示.value.type) {
				case '弹窗':
					Dialog[提示.value.msgType]({
						message: 提示.value.msg,
						confirmButtonColor: 'red',
						context: 组件实例
					}).then(() => {
						store.commit('setState', {
							key: '提示',
							value: {
								show: false,
								type: '',
								msg: '',
								msgType: ''
							}
						});
					});
					break;
				case '消息':
					Notify({
						type: 提示.value.msgType,
						message: 提示.value.msg,
						context: 组件实例
					});
					break;
			}
		}
	}
);

// 方法
function 点击(type) {
	emit(type);
	store.commit('setState', {
		key: '提示',
		value: {
			show: false,
			type: '',
			msg: '',
			msgType: ''
		}
	});
}
</script>

<style lang="less" scoped></style>
