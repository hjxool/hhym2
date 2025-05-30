<template>
	<view v-show="提示.show">
		<van-dialog v-show="提示.type == '弹窗'" id="van-dialog" />
		<van-notify v-show="提示.type == '消息'" id="van-notify" />
	</view>
</template>

<script setup>
import { computed, watch } from 'vue';
import Dialog from '/wxcomponents/vant/dialog/dialog';
import Notify from '/wxcomponents/vant/notify/notify';
import { useStore } from 'vuex';
import { getCurrentInstance } from 'vue';
const 组件实例 = getCurrentInstance().proxy;

// 属性
const store = useStore();
const 提示 = computed(() => store.state.提示);

watch(
	() => 提示.value.show,
	(newValue) => {
		if (newValue) {
			switch (提示.value.type) {
				case '弹窗':
					Dialog.alert({
						message: 提示.value.msg,
						context: 组件实例
					}).then(() => {
						store.commit('setState', {
							key: '提示',
							value: {
								show: false,
								type: '',
								msg: '',
								msgType:''
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
</script>

<style lang="less" scoped></style>
