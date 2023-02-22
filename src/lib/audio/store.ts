import { writable, get } from 'svelte/store';

export const tracks: any = {
	hover: {
		src: '/sounds/hover.mp3'
	},
	click: {
		src: '/sounds/click.mp3'
	}
};

export const muted = writable(true);

export const playTrack = (track: string) => {
	if (get(muted)) return;
	const audio = new Audio(tracks[track].src);
	audio.play();
};

export const toggleMute = () => {
	const isMuted = get(muted);
	muted.set(!isMuted);
};
