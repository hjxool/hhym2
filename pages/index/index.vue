<template>
	<view>
		<Notify />
	</view>
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import { 请求接口 } from '/Api/请求接口.js';
// uni.showLoading()
请求接口('isManager2');
</script>

<style lang="less" scoped></style>
