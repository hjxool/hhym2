export const 一天 = 24 * 60 * 60 * 1000

export function 计算天数(start, end){
	start = start.replaceAll('-', '/');
	end = end.replaceAll('-', '/');
	return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 一天);
}