<script lang="ts">
	import { updatePageIndex } from '@shared/store';

	type Item = {
		handle: string;
		name: string;
		href: string;
	};
	export let item: Item;
	export let index: number = 0;
	export let isActive: boolean = false;

	$: handleChange(isActive);

	const handleChange = (isActive: boolean) => {
		if (isActive) {
			updatePageIndex(index);
		}
	};

	let showArrow = false;
	const toggleArrow = () => {
		showArrow = !showArrow;
	};
</script>

<a
	href={item.href}
	class="hover:!text-t-pri rounded-md h-10 items-center w-20 sm:w-32 lg:w-40 flex justify-center"
	class:active={!isActive}
	id="navbar-{item.handle}"
	on:mouseenter={toggleArrow}
	on:mouseleave={toggleArrow}
>
	<div class="mr-2 rotate-180 translate-y-1">
		<span class="block w-6" class:arrow={showArrow}>&nbsp;</span>
	</div>
	<span class="text-sm sm:text-xl lg:text-2xl font-bank">{item.name}</span>
</a>

<style>
	.active {
		@apply text-t-sec;
	}
	.arrow {
		background-image: url('/arrow.png');
		background-size: 100% 100%;
	}
</style>
