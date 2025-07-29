<template>
	<view class="page" @touchstart="控制('touchstart', $event)" @touchmove="控制('touchmove', $event)" @touchend="控制('touchend', $event)">
		<canvas id="threeScene" type="webgl"></canvas>
		<!-- 热点 -->
		<view class="hotspot textEllipsis" v-for="item in 房间[当前区域].hotspots" :style="热点显示(item)">
			<view v-if="item.type == '区域'" class="area center" @click="切换区域(item)">
				<div class="icon center">
					<view class="dot"></view>
					<view class="pulse"></view>
					<view class="pulse"></view>
					<view class="pulse"></view>
				</div>
			</view>
			<view v-if="item.type == '房间'" class="room" @click="选择房间(item)">{{ item.label }}{{ item.disabled ? '(占用)' : '' }}</view>
		</view>
		<!-- 小地图 -->
		<view class="minimap">
			<!-- 必须用px -->
			<view class="indicator center" :style="{ transform: `translate(${小地图定位.x}px, ${小地图定位.y}px)` }">
				<view class="rotate center" :style="{ transform: `rotate(${小地图定位.deg}deg)` }">
					<view class="direction"></view>
					<view class="dot"></view>
				</view>
			</view>
		</view>
		<!-- 模糊过渡效果 -->
		<view v-show="模糊过渡" class="transition"></view>
		<!-- 加载遮罩 -->
		<view v-show="loading" class="loading"></view>
	</view>

	<Notify @confirm="选择房间('确认')" @cancel="选择房间('取消')" />
</template>

<script setup>
import { createScopedThreejs } from 'threejs-miniprogram';
import Controller from '/Api/threeJS控制器.js';
import { getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue';
import { 弹窗 } from '/Api/提示.js';
import Notify from '/Components/notify/notify.vue';
import { useStore } from 'vuex';

// 属性
const instance = getCurrentInstance().proxy;
const channel = instance.getOpenerEventChannel();
let 前一页;
channel.on('前一页', (data) => {
	前一页 = data;
});
const store = useStore();

let THREE;
let canvas节点;
let renderId;
let textureLoader;
const VR = {
	场景: null,
	摄像头: null,
	渲染器: null,
	控制器: null,
	几何体: null
};
// 小程序没有document 而是调用API创建query选择器 来获取容器节点
const query = uni.createSelectorQuery();
query.select('#threeScene').node().exec(初始化);
const 当前区域 = ref('门口');
const 房间 = ref({
	// 得弄一些空数据 不然会报错
	门口: {},
	左侧: {}
});
const 小地图定位 = ref({
	x: '',
	y: '',
	deg: ''
});
const loading = ref(true);
const 模糊过渡 = ref(false);

let 所选房间;
let 指向视角中心的箭头;

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
	// 页面关闭时卸载渲染任务 否则会一直执行
	canvas节点.cancelAnimationFrame(renderId);
	// 避免多个控制器
	// VR.控制器 && VR.控制器.dispose();
});

// 方法
function 初始化(res) {
	uni.showLoading({
		title: '加载中...',
		mask: true
	});
	// 获取元素节点 但是不同于浏览器环境 所以不能直接用
	canvas节点 = res[0].node;
	// threejs常规版本需要 appendchild addEventListener 而这些小程序框架中都没有
	// 因此使用 createScopedThreejs 与canvas容器进行关联 得到THREE对象
	THREE = createScopedThreejs(canvas节点);
	textureLoader = new THREE.TextureLoader();

	VR.场景 = new THREE.Scene();
	VR.摄像头 = new THREE.PerspectiveCamera(75, canvas节点.width / canvas节点.height, 0.1, 1000);
	// 将相机放在球体中心
	VR.摄像头.position.set(0, 0.1, 0.1);
	// 配置项 antialias抗锯齿
	VR.渲染器 = new THREE.WebGLRenderer({ antialias: true });
	// 设置 WebGL 渲染器的像素比 使其在高分辨率时 自动调整分辨率
	VR.渲染器.setPixelRatio(uni.getSystemInfoSync().pixelRatio);
	// 设置渲染范围
	// 注意！小程序版 没有 innerWidth 等属性
	VR.渲染器.setSize(canvas节点.width, canvas节点.height);
	// 伽马校正 使图像看起来更加真实和自然
	VR.渲染器.gammaOutput = true;
	// 伽马校正因子 调整输出图像的亮度和对比度
	VR.渲染器.gammaFactor = 2.2;
	// 注意！小程序版本控制器是个函数
	// 必须先传入THREE对象 再结构返回值得到控制器对象
	const { OrbitControls } = Controller(THREE);
	VR.控制器 = new OrbitControls(VR.摄像头, VR.渲染器.domElement);
	// VR.控制器.enableDamping = true; // 添加惯性
	// VR.控制器.dampingFactor = 0.05; // 阻尼系数（越小越平滑）
	// 注意手动设置了初始朝向后相机位置会发生些微改变 导致更新热点相对视窗位置异常
	// 因此需要将热点与相机间距拉远才能正常显示
	VR.控制器.target.set(-0.614, -0.209, -0.76); // 初始朝向
	VR.控制器.enableRotate = true; // 允许旋转
	VR.控制器.rotateSpeed = 6; // 调整旋转速度
	// 限制垂直视角范围
	VR.控制器.minPolarAngle = Math.PI / 6; // 30度
	VR.控制器.maxPolarAngle = (Math.PI * 5) / 6; // 150度
	// 控制旋转
	VR.控制器.addEventListener('change', () => {
		// 获取相机朝向向量
		const direction = new THREE.Vector3();
		VR.摄像头.getWorldDirection(direction);
		// 调试用 旋转时打印相机三维坐标
		console.log('相机朝向:', direction);
		console.log('箭头 3D 坐标:', 指向视角中心的箭头.position);
		// 计算角度 0-360度
		// 注意！Three.js 使用的是 右手坐标系 因此需要反转x或z轴
		let angle = -Math.atan2(direction.x, direction.z) * (180 / Math.PI);
		// angle = Math.floor((angle + 360) % 360);
		小地图定位.value.deg = Math.floor((angle - 房间.value[当前区域.value].相机与雷达偏移角度) * 10) / 10;
		// 调试用 旋转时打印小地图deg角度
		console.log('小地图角度', `${小地图定位.value.deg}°`);
		console.log('热点相对视窗定位', 房间.value[当前区域.value].hotspots[0].screenPosition);
	});
	// 调试用 创建始终指向视角中心的箭头
	指向视角中心的箭头 = new THREE.ArrowHelper(
		new THREE.Vector3(0, 0, -1), // 初始方向
		new THREE.Vector3(0, 0, 0), // 原点
		1, // 长度
		0xff0000, // 颜色
		0.2, // 头部长度
		0.1 // 头部宽度
	);
	VR.场景.add(指向视角中心的箭头);

	// 初始化后才有的THREE
	添加房间信息();
	场景内添加几何体();

	渲染();
}
function 添加房间信息() {
	房间.value = {
		门口: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/VR/%E9%97%A8%E5%8F%A3.jpg?sign=cd6d9f079a8a5856d7bbf56ea9218478&t=1753755124',
			hotspots: [
				{
					label: '门口左侧',
					position: new THREE.Vector3(-7.655979991426508, -0.5500735701280619, 4.67022926751504),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '区域'
				},
				{
					label: '标准间3',
					position: new THREE.Vector3(-7.560448743381736, -1.5107909827065207, -6.167901013386097),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间4',
					position: new THREE.Vector3(-8.677956297697623, -0.6984211452474096, -4.491793007265494),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间7',
					position: new THREE.Vector3(-8.483187845746931, -1.8646771020982549, 3.051537650293428),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间9',
					position: new THREE.Vector3(-6.133688729168389, -1.2654632327871225, 6.140009061481621),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				}
			],
			mapPosition: { x: 37, y: 50, deg: 0 },
			相机与雷达偏移角度: 144.4, // 相机朝向与小地图扇形偏差角度
			初始朝向: [-0.614, -0.209, -0.76] // 注意手动设置朝向 必须用 相机朝向 不能用箭头坐标 否则坐标不会发生变化
		},
		门口左侧: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/VR/%E9%97%A8%E5%8F%A3%E5%B7%A6%E4%BE%A7.jpg?sign=0c5e9334f267540cd38ad8ee5ae35c48&t=1753773732',
			hotspots: [
				{
					label: '门口',
					position: new THREE.Vector3(9.249762182591223, -0.9117713062512167, 1.0442603553017726),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '区域'
				},
				{
					label: '标准间7',
					position: new THREE.Vector3(5.907511171442972, -2.709289692066462, -6.938781961142837),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间6',
					position: new THREE.Vector3(-2.435637042094622, -0.7977184659153715, -8.160941223711285),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间5',
					position: new THREE.Vector3(-7.2071413942127105, -1.2449293783028315, -3.4072902698944976),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间8',
					position: new THREE.Vector3(-4.500557677775003, -2.227137072597032, 6.9338910097124185),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				},
				{
					label: '标准间9',
					position: new THREE.Vector3(4.3485107237224945, -2.1298821588746355, 8.218994297028864),
					opacity: 0,
					screenPosition: { x: 0, y: 0 },
					type: '房间',
					disabled: false
				}
			],
			mapPosition: { x: 20, y: 50, deg: 90 },
			相机与雷达偏移角度: -173.3,
			初始朝向: [0.9834072950292505, -0.13020920798994637, 0.126315692761761]
		}
	};
	// 房间可用状态改变 则更新热点信息
	watch(
		() => store.state.房间可用状态列表,
		(value) => {
			for (let [, val] of Object.entries(房间.value)) {
				for (let val2 of val.hotspots) {
					if (val2.type == '房间') {
						let find = value.find((e) => e.name == val2.label);
						find && (val2.disabled = find.disabled);
					}
				}
			}
		},
		{ immediate: true }
	);
}
function 场景内添加几何体() {
	const geometry = new THREE.SphereGeometry(50, 60, 40);
	// 反转几何体使贴图在内部
	geometry.scale(-1, 1, 1);
	textureLoader.load(房间.value[当前区域.value].img, (newTexture) => {
		const material = new THREE.MeshBasicMaterial({ map: newTexture });
		VR.几何体 = new THREE.Mesh(geometry, material);
		VR.场景.add(VR.几何体);
		setTimeout(() => {
			loading.value = false;
			uni.hideLoading();
		}, 200);
	});
	let { x, y, deg } = 房间.value[当前区域.value].mapPosition;
	小地图定位.value.x = x;
	小地图定位.value.y = y;
	小地图定位.value.deg = deg;
}
function 渲染() {
	renderId = canvas节点.requestAnimationFrame(渲染);
	// 调试用 更新视角中心箭头位置
	const 与相机的距离 = 10;
	const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(VR.摄像头.quaternion);
	指向视角中心的箭头.position.copy(VR.摄像头.position).add(direction.multiplyScalar(与相机的距离));
	// 箭头始终指向相机朝向
	指向视角中心的箭头.setDirection(direction.normalize());

	// 如果开启了enableDamping(阻尼惯性)则必须在添加这句
	VR.控制器.update();
	更新热点数据();
	VR.渲染器.render(VR.场景, VR.摄像头);
}
function 控制(type, e) {
	canvas节点.dispatchTouchEvent({ type, ...e });
}
function 热点显示(spot) {
	return {
		left: `${spot.screenPosition.x}%`,
		top: `${spot.screenPosition.y}%`,
		opacity: spot.opacity
	};
}
function 更新热点数据() {
	if (!房间.value[当前区域.value]?.hotspots) return;
	for (let spot of 房间.value[当前区域.value].hotspots) {
		// 计算热点在屏幕上的位置
		const vector = spot.position.clone().project(VR.摄像头);
		const x = Math.round((vector.x * 0.5 + 0.5) * 1000) / 10;
		// 乘以-0.5是为了翻转结果值 因为vector的值为-1到1 而y的值是反的 即-11表示屏幕顶部
		const y = Math.round((vector.y * -0.5 + 0.5) * 1000) / 10;
		// 计算热点与相机方向的夹角
		const cameraDirection = new THREE.Vector3();
		VR.摄像头.getWorldDirection(cameraDirection);
		const hotspotDirection = spot.position.clone().normalize();
		const angle = cameraDirection.angleTo(hotspotDirection); // 弧度 所以要跟Math.PI的值进行比较
		// 根据夹角计算透明度 (0-10度完全可见，10-30度渐变消失)
		let opacity = 1;
		if (angle > Math.PI / 18) {
			opacity = Math.max(0, 1 - (angle - Math.PI / 18) / (Math.PI / 6));
		}
		// 更新热点状态
		spot.screenPosition = { x, y };
		spot.opacity = Math.floor(opacity * 100) / 100;
	}
}
function 切换区域(spot) {
	模糊过渡.value = true;
	uni.showLoading({
		title: '加载中...',
		mask: true
	});

	当前区域.value = spot.label;
	// 重置新区域数据
	for (let spot of 房间.value[当前区域.value].hotspots) {
		spot.opacity = 0;
	}
	// 切换贴图
	textureLoader.load(
		房间.value[当前区域.value].img,
		// 加载图片回调
		(newTexture) => {
			let { x, y, deg } = 房间.value[当前区域.value].mapPosition;
			小地图定位.value.x = x;
			小地图定位.value.y = y;
			// 切换区域后 小地图 及 相机视角 的初始朝向
			小地图定位.value.deg = deg;
			VR.控制器.target.set(...房间.value[当前区域.value].初始朝向);
			VR.摄像头.position.set(0, 0.1, 0.1); // 试试强制固定相机位置

			newTexture.encoding = THREE.sRGBEncoding; // 确保色彩正确
			VR.几何体.material.map = newTexture;
			setTimeout(() => {
				模糊过渡.value = false;
				uni.hideLoading();
			}, 200);
		}
	);
}
function 选择房间(value) {
	switch (value) {
		case '确认':
			if (前一页 == '首页') {
				uni.navigateTo({
					url: '/pages/UserOrder/UserOrder',
					success(res) {
						res.eventChannel.emit('房间', 所选房间);
					}
				});
			} else if (前一页 == '预约') {
				channel.emit('房间', 所选房间);
				uni.navigateBack();
			}
			break;
		case '取消':
			所选房间 = '';
			break;
		default:
			if (value.disabled) return;
			所选房间 = value.label;
			弹窗(`确认选择 ${所选房间} ？`, '确认');
			break;
	}
}
</script>

<style lang="less" scoped>
.page {
	overflow: hidden;
	touch-action: none; /* 禁用浏览器默认触摸行为 */
	-webkit-user-drag: none; /* 禁止拖拽（部分iOS有效） */
	user-select: none; /* 防止长按选中 */
}
#threeScene {
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 0;
	overflow: hidden;
	touch-action: none; /* 禁用浏览器默认触摸行为 */
	-webkit-user-drag: none; /* 禁止拖拽（部分iOS有效） */
	user-select: none; /* 防止长按选中 */
}
@keyframes pulse {
	0% {
		transform: scale(0.5);
		opacity: 0;
	}
	50% {
		opacity: 0.7;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}
.hotspot {
	position: absolute;
	transform: translate(-50%, -50%);
	transition: opacity 0.3s ease;
	z-index: 10;
	> .area {
		// padding: 10rpx 20rpx;
		// font-size: 24rpx;
		background: rgba(0, 0, 0, 0.3);
		// color: #fff;
		overflow: hidden;
		// border-radius: 20rpx;
		border-radius: 50%;
		width: 60rpx;
		height: 60rpx;
		> .icon {
			width: 40rpx;
			height: 40rpx;
			position: relative;
			> .dot {
				position: absolute;
				width: 16rpx;
				height: 16rpx;
				background-color: white;
				border-radius: 50%;
				z-index: 2;
			}
			> .pulse {
				position: absolute;
				width: 40rpx;
				height: 40rpx;
				border: 4rpx solid white;
				border-radius: 50%;
				opacity: 0;
				z-index: 1;
				animation: pulse 2s infinite;
				&:nth-child(2) {
					animation-delay: 0.5s;
				}
				&:nth-child(3) {
					animation-delay: 1s;
				}
			}
		}
	}
	> .room {
		padding: 10rpx 20rpx;
		background: linear-gradient(to right, #ff9966, #ff6600); /* 调整为更深的暖色 */
		border-radius: 10rpx;
		font-size: 24rpx;
		font-weight: bold;
		color: #ffffff; /* 仍然是白色字体，但增加阴影 */
		text-shadow: 4rpx 4rpx 8rpx rgba(0, 0, 0, 0.6); /* 增加文字阴影，提高可读性 */
		box-shadow: 4rpx 4rpx 10rpx rgba(255, 153, 102, 0.5);
	}
}
.minimap {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 150rpx;
	height: 150rpx;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 8rpx;
	overflow: hidden;
	z-index: 20;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.2);
	> .indicator {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
		width: 0;
		height: 0;
		transform-origin: center;
		transition: all 1s ease;
		.dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background-color: #eee;
			position: absolute;
		}
		.direction {
			position: absolute;
			z-index: -1;
			// transform: rotateZ(180deg); // 视角默认就是180度 与图形方向相反
			width: 30px;
			height: 30px;
			background: radial-gradient(circle, rgba(59, 142, 244, 1) 0%, rgba(59, 142, 244, 0) 100%);
			clip-path: path('M15,15 L7.5,2.5 A15,15 0 0,1 22.5,2.5 Z');
		}
		.rotate {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10;
			width: 0;
			height: 0;
		}
	}
}
.loading {
	position: fixed;
	left: 0%;
	top: 0%;
	width: 100%;
	height: 100%;
	z-index: 990;
	background: #fff;
}
.transition {
	position: fixed;
	left: 0%;
	top: 0%;
	width: 100%;
	height: 100%;
	z-index: 990;
	background-color: rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10px); /* 磨砂效果关键属性 */
	-webkit-backdrop-filter: blur(10px); /* Safari 支持 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
