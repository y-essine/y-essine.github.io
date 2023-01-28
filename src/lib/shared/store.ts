import { writable } from 'svelte/store';

const _links = [
	{
		name: '@y-essine',
		href: '/'
	},
	{
		name: 'projects',
		href: '/projects'
	},
	{
		name: 'contact',
		href: '/contact'
	}
];

export const links = writable(_links);

export const currentPage = writable('home');
export const pageIndex = writable(0);
