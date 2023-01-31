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
</script>

<a
	href={item.href}
	class="hover:bg-zinc-800 duration-200 transition-colors rounded-md h-10 items-center w-20 sm:w-32 lg:w-40 flex justify-center"
	class:active={!isActive}
	id="navbar-{item.handle}"
>
	<span class="text-sm sm:text-xl lg:text-2xl font-semibold">{item.name}</span>
</a>

<style>
	.active {
		@apply text-zinc-500;
	}
</style>
