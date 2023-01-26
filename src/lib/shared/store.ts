import { writable } from 'svelte/store';

export const page = writable({ isHome: true, isAbout: false, isContact: false });
export const pageIndex = writable(0);
