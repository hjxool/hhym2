export const 一天 = 24 * 60 * 60 * 1000

export function 计算天数(start, end) {
	start = start.replaceAll('-', '/');
	end = end.replaceAll('-', '/');
	return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 一天);
}

let today = new Date()
export const 今天 = `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`
const 今天_时间戳 = new Date(今天).getTime()
let tomorrow = new Date(今天_时间戳 + 一天)
export const 明天 = `${tomorrow.getFullYear()}/${tomorrow.getMonth()+1}/${tomorrow.getDate()}`
const 明天_时间戳 = tomorrow.getTime()
const 后天 = new Date(明天_时间戳 + 一天).getTime()
const 大后天 = new Date(后天 + 一天).getTime()
export function 判断是哪一天(date) {
	date = date.replaceAll('-', '/');
	date = new Date(date)
	if (date >= 今天_时间戳 && date < 明天_时间戳) {
		return '今天'
	} else if (date >= 明天 && date < 后天) {
		return '明天'
	} else if (date >= 后天 && date < 大后天) {
		return '后天'
	} else {
		// 超出后天开始计算是周几
		let w = date.getDay()
		switch (w) {
			case 0:
				return "周日";
			case 1:
				return "周一";
			case 2:
				return "周二";
			case 3:
				return "周三";
			case 4:
				return "周四";
			case 5:
				return "周五";
			case 6:
				return "周六";
		}
	}
}