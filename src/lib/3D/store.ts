import { writable } from 'svelte/store';

export const fetchStatus = writable(false);

export const setIsFetched = (value: boolean) => {
	fetchStatus.set(value);
};
