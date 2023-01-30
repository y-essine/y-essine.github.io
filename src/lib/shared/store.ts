import { writable, get } from 'svelte/store';

const _links = [
	{
		name: '@y-essine',
		href: '/',
		handle: 'home'
	},
	{
		name: 'projects',
		href: '/projects',
		handle: 'projects'
	},
	{
		name: 'contact',
		href: '/contact',
		handle: 'contact'
	}
];

export const links = writable(_links);

export const currentPage = writable('home');
export const pageIndex = writable(0);

export const isRight = writable(true);
export const isLeft = writable(false);

export const updatePageIndex = (index: number) => {
	if (index > get(pageIndex)) setIsRight();
	else setIsLeft();
	pageIndex.set(index);
	currentPage.set(_links[index].handle);
};

const setIsRight = () => {
	isRight.set(true);
	isLeft.set(false);
};

const setIsLeft = () => {
	isRight.set(false);
	isLeft.set(true);
};
