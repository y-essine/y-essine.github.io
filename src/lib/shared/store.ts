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

export const currentPage = writable('home');

export const updateCurrentPage = (page: string) => {
	currentPage.set(page);
};

export const links = readable(_links);
