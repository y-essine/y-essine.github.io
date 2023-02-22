import { writable, readable, get } from 'svelte/store';

const _links = [
	{
		name: 'yessine',
		href: '/about',
		handle: 'about'
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

export const links = readable(_links);

export const currentPage = writable('home');
export const pageIndex = writable(0);

export const isRight = writable(true);
export const isLeft = writable(false);

export const updatePageIndex = (index: number) => {
	// if (index > get(pageIndex)) setIsRight();
	// else setIsLeft();
	// console.log(index);
	// pageIndex.set(index);
	// currentPage.set(_links[index].handle);
	// console.log(get(currentPage));
};

const setIsRight = () => {
	isRight.set(true);
	isLeft.set(false);
};

const setIsLeft = () => {
	isRight.set(false);
	isLeft.set(true);
};
