<template>
	<view class="page colLayout">
		<view class="flexGrow">
			<view class="title">已添加宠物</view>

			<view v-if="form.宠物列表.length" class="petBox">
				<view class="gap" v-for="(item, index) in form.宠物列表" :key="item.name">
					<Swipe :right="200" :disable="item.选中">
						<view class="pet rowLayout" :class="{ selected: item.选中 }" @click="勾选宠物('单选', item)">🐱 {{ item.name }} - {{ item.breed }}</view>

						<template #right>
							<view class="edit">
								<view class="button center" @click="操作宠物('编辑', index)" style="background: #ffa500">编辑</view>
								<view class="button center" @click="操作宠物('删除', index)" style="background: #ff4500">删除</view>
							</view>
						</template>
					</Swipe>
				</view>
			</view>

			<button class="button center" @click="操作宠物('添加')" style="margin-bottom: 20rpx">添加</button>

			<view class="formBox noShrink">
				<view class="title">日期</view>
				<view class="rowLayout" @click="显示日历 = true" style="justify-self: end">
					<view class="color1">{{ 日期 }}</view>
					<view class="color1" style="margin-left: 20rpx">共 {{ 总天数 }} 天</view>
				</view>
			</view>

			<view class="formBox noShrink" @click="跳转('VR')">
				<view class="title">房间</view>
				<view class="color1" :style="{ color: 房间.disabled ? '#999' : '' }" style="justify-self: end">{{ 房间.name }}{{ 房间.disabled ? '(占用)' : '' }}</view>
			</view>

			<view class="formBox noShrink">
				<view class="title noShrink">联系人</view>
				<input class="input flexGrow" v-model="form.联系人" placeholder="必填" />
			</view>

			<view class="formBox noShrink">
				<view class="title noShrink">联系号</view>
				<input class="input flexGrow" v-model="form.联系号" placeholder="手机号或微信号" />
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
						<view class="color3" @click.stop="跳转('协议')">《服务协议》</view>
					</view>
				</van-checkbox>
			</view>
		</view>

		<van-submit-bar :tip="提示" :price="总价" button-text="提交预约" @submit="提交()">
			<van-checkbox :value="form.全选" @change="勾选宠物('全选', $event)">全选</van-checkbox>
		</van-submit-bar>
	</view>

	<CusCalendar :show="显示日历" @close="显示日历 = false" />

	<Notify @confirm="确认弹窗()" />
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import CusCalendar from '/Components/cusCalendar/cusCalendar.vue';
import Notify from '/Components/notify/notify.vue';
import Swipe from '/Components/swipe/swipe.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { 请求接口 } from '/Api/请求接口.js';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
});

// 属性
const instance = getCurrentInstance().proxy;
const channel = instance.getOpenerEventChannel();
const store = useStore();

const form = ref({
	宠物列表: [],
	联系人: '',
	联系号: '',
	从何: '',
	阅读协议: false,
	全选: false
});
const 总价 = computed(() => {
	if (!form.value.宠物列表.length) return 0;
	let { 标准间优惠, 豪华间优惠 } = store.getters.折扣总价;
	let t = 房间.value.name.substring(0, 3);
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
const 房间 = ref({
	name: '标准间1',
	disabled: false
});
const 房间最大数量 = {
	标准间: 2,
	豪华间: 4
};
let 当前操作;
const 重新预约宠物数据 = ref([]);

channel.on('数据', (data) => {
	if (data) {
		store.commit('setState', {
			key: '日期',
			value: {
				入住: data.start.replaceAll('-', '/'),
				离店: data.end.replaceAll('-', '/')
			}
		});

		房间.value.name = data.room;
		// 因为每次都是新打开预约界面 因此会自动调用查询用户信息 不需要手动再调
		// 注意 这里因为页面初始就会执行 此时还没有数据 要等数据回来了再执行
		重新预约宠物数据.value = data.pets;
	}
});
channel.on('房间', (data) => {
	// 能跳转过来的 肯定是可用房间
	房间.value.name = data;
	房间.value.disabled = false;
});

// 如果重选了日期 则房间可用状态也会变
// 因此需要在房间可用状态改变时 重新判断当前房间是否可用
watch(
	() => store.state.更新房间可用状态,
	(value) => {
		let find = value.find((e) => e.name == 房间.value.name);
		房间.value.disabled = find.disabled;
	}
);
// 滞后查询试试
let 是否为新用户;
查询用户();

// 方法
async function 提交() {
	let reg = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
	if (!reg.test(form.value.联系人)) {
		消息('联系人 只能用中英文以及数字', '失败');
		return;
	}
	let phone = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
	let 微信号 = /^[a-zA-Z][a-zA-Z\d_-]{5,19}$/;
	if (!phone.test(form.value.联系号) && !微信号.test(form.value.联系号)) {
		消息('联系号 请填写手机号或微信号', '失败');
		return;
	}
	if (!form.value.阅读协议) {
		消息('请阅读并勾选服务协议', '失败');
		return;
	}
	let count = 0;
	for (let val of form.value.宠物列表) {
		if (val.选中) {
			count++;
		}
	}
	if (!count) {
		消息('请至少勾选一个宠物', '失败');
		return;
	} else {
		let max = 房间最大数量[房间.value.name.substring(0, 3)];
		if (count > max) {
			消息(`当前房间类型不允许超过 ${max} 只`, '失败');
			return;
		}
	}
	if (房间.value.disabled) {
		消息('所选房间在当前时段不可用', '失败');
		return;
	}
	uni.showLoading({
		title: '预约中...',
		mask: true
	});
	let selectedPets = [];
	let pets = [];
	for (let val of form.value.宠物列表) {
		let t = {};
		for (let [key, value] of Object.entries(val)) {
			if (key != '选中') {
				t[key] = value;
			}
		}
		pets.push(t);
		if (val.选中) {
			selectedPets.push(t);
		}
	}
	let data = {
		userId: store.state.用户ID,
		name: form.value.联系人,
		phone: form.value.联系号,
		knowFrom: form.value.从何,
		room: 房间.value.name,
		start: store.state.日期.入住,
		end: store.state.日期.离店,
		pay: 总价.value / 100,
		selectedPets
	};
	// 如果是新用户 则携带所有创建的宠物 以及勾选的宠物
	// 注册过的用户 则只携带勾选的宠物
	if (是否为新用户) {
		data['pets'] = pets;
	}
	let res = await 请求接口('userBooking2', data);
	uni.hideLoading();
	if (!res) return;
	消息('预约成功');
	uni.$emit('未读消息', '新增');
	setTimeout(() => {
		uni.navigateBack({ delta: 3 });
	}, 1000);
}
function 勾选宠物(type, args) {
	switch (type) {
		case '单选':
			args.选中 = !args.选中;
			break;
		case '全选':
			let { detail } = args;
			form.value.全选 = detail;
			form.value.宠物列表.forEach((e) => {
				e.选中 = form.value.全选;
			});
			break;
	}
	// 记录勾选宠物数量 实时计算总价
	let count = form.value.宠物列表.reduce((pre, cur) => {
		return cur.选中 ? pre + 1 : pre;
	}, 0);
	store.commit('setState', {
		key: '宠物数量',
		value: count || 1 // 最少也是1
	});
	// 看是否全选
	let t = form.value.宠物列表.find((e) => e.选中 == false);
	if (t) {
		form.value.全选 = false;
	} else {
		form.value.全选 = true;
	}
}
function 勾选协议({ detail }) {
	form.value.阅读协议 = detail;
}
function 操作宠物(type, index) {
	if (type == '删除') {
		弹窗(`确定删除 ${form.value.宠物列表[index].name} 的信息？`, '确认');
		当前操作 = index;
	} else {
		uni.navigateTo({
			url: '/pages/UserPetInfo/UserPetInfo',
			success(res) {
				res.eventChannel.emit('操作类型', type);
				type == '编辑' && res.eventChannel.emit('数据', form.value.宠物列表[index]);
			},
			events: {
				async 数据(res) {
					switch (res.type) {
						case '添加':
							// 宠物名作为唯一ID 需要验证
							if (form.value.宠物列表.find((e) => e.name == res.data.name)) {
								消息('昵称重复了哦', '失败');
								return;
							}
							// 不是新用户 需要发请求
							if (!是否为新用户) {
								uni.showLoading({
									title: '',
									mask: true
								});
								let d = await 请求接口('petEdit2', {
									type: '新增',
									data: { ...res.data }
								});
								uni.hideLoading();
								if (!d) return;
							}
							form.value.宠物列表.push({ ...res.data, 选中: false });
							消息(`添加 ${res.data.name} 成功`);
							break;
						case '编辑':
							// 除了自身查看是否有同名
							for (let i = 0; i < form.value.宠物列表.length; i++) {
								if (i != index && form.value.宠物列表[i].name == res.data.name) {
									消息('昵称重复了哦', '失败');
									return;
								}
							}
							if (!是否为新用户) {
								// 注意 要把表单中的选中属性去除
								let data = {};
								for (let key in res.data) {
									if (key != '选中') {
										data[key] = res.data[key];
									}
								}
								uni.showLoading({
									title: '',
									mask: true
								});
								let d = await 请求接口('petEdit2', {
									type: '编辑',
									data
								});
								uni.hideLoading();
								if (!d) return;
							}
							消息(`修改 ${res.data.name} 信息成功`);
							// 发送到宠物表单时 已经将选中属性携带过去了 不需要再次添加
							form.value.宠物列表.splice(index, 1, res.data);
							break;
						case '删除':
							if (!是否为新用户) {
								uni.showLoading({
									title: '',
									mask: true
								});
								let d = await 请求接口('petEdit2', {
									type: '删除',
									data: res.data.name
								});
								uni.hideLoading();
								if (!d) return;
							}
							form.value.宠物列表.splice(index, 1);
							消息(`删除 ${res.data.name} 信息成功`);
							break;
					}
				}
			}
		});
	}
}
function 跳转(type) {
	switch (type) {
		case '协议':
			uni.navigateTo({
				url: '/pages/UserAgree/UserAgree'
			});
			break;
		case 'VR':
			uni.navigateTo({
				url: '/pages/UserVR/UserVR',
				success(res) {
					res.eventChannel.emit('前一页', '预约');
				},
				events: {
					房间(data) {
						// 能跳转回来的肯定是可用房间
						房间.value.name = data;
						房间.value.disabled = false;
					}
				}
			});
			break;
	}
}
async function 查询用户() {
	uni.showLoading({
		title: '',
		mask: true
	});
	let res = await 请求接口('userEdit2', {
		type: '个人信息',
		data: {
			userId: store.state.用户ID
		}
	});
	uni.hideLoading();
	是否为新用户 = true;
	if (res) {
		是否为新用户 = false;
		form.value.联系人 = res.name;
		form.value.联系号 = res.phone;
		form.value.宠物列表 = res.pets.map((e) => ({ 选中: false, ...e }));
		form.value.从何 = res.knowFrom;
		for (let val of form.value.宠物列表) {
			if (重新预约宠物数据.value.find((e) => e.name == val.name)) {
				val.选中 = true;
			}
		}
		勾选宠物();
	}
}
async function 确认弹窗() {
	let name = form.value.宠物列表[当前操作].name;
	if (!是否为新用户) {
		uni.showLoading({
			title: '',
			mask: true
		});
		let res = await 请求接口('petEdit2', {
			type: '删除',
			data: name
		});
		uni.hideLoading();
		if (!res) return;
	}
	form.value.宠物列表.splice(当前操作, 1);
	// 确认弹窗和消息提示时间重叠 导致消息无法显示 需要延迟显示
	setTimeout(() => {
		消息(`删除 ${name} 信息成功`);
	}, 500);
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
			.gap + .gap {
				margin-top: 20rpx;
			}
			.pet {
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
			}
			.selected {
				background: #ffe0b2; /* 选中时背景变浅橙色 */
				border: 4rpx solid #ff8c42; /* 高亮边框 */
				box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
			}
			.edit {
				display: grid;
				grid-template-columns: 1fr 1fr;
				> .center {
					color: #fff;
				}
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
