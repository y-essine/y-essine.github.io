<script lang="ts">
	import { playTrack } from '@/audio/store';

	type Item = {
		handle: string;
		name: string;
		href: string;
	};
	export let item: Item;

	let showArrow = false;

	const handleEnter = () => {
		playTrack('hover');
		showArrow = true;
	};
	const toggleLeave = () => {
		showArrow = false;
	};
</script>

<a
	href={item.href}
	class="text-t-sec hover:text-t-pri rounded-md h-10 items-center flex relative"
	on:mouseenter={handleEnter}
	on:mouseleave={toggleLeave}
	on:click={() => playTrack('click')}
>
	<div class="absolute -left-10 translate-y-4 scale-x-150 scale-y-[2.3]">
		<span class="block w-6" class:arrow={showArrow}>&nbsp;</span>
	</div>
	<h3 class="text-3xl font-bank">{item.name}</h3>
</a>

<style>
	.arrow {
		background-image: url('/hud/arrow.png');
		background-size: 100% 100%;
	}
</style>
