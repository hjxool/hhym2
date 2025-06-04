export function 防抖(fn, delay) {
	let timer = null
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}

export function 节流(fn, delay) {
	let timer = false
	return (...args) => {
		if (timer) return
		timer = true
		fn(...args)
		setTimeout(() => {
			timer = false
		}, delay)
	}
}