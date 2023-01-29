<script lang="ts">
	import { pageIndex } from '$shared/store';

	export let index: number = 0;
	export let name: string;
	export let href: string;
	export let icon: any = false;
	export let isActive: boolean = false;

	$: handleChange(isActive);

	const handleChange = (isActive: boolean) => {
		if (isActive) {
			pageIndex.set(index);
		}
	};
</script>

<a
	{href}
	class="hover:bg-zinc-800/70 duration-200 transition-colors px-2 rounded-md h-[35px] w-18 sm:w-32 lg:w-40 flex justify-center"
	class:active={isActive}
>
	<span class="text-sm sm:text-xl lg:text-2xl font-semibold">{name}</span>
</a>

<style>
	.active {
		/* @apply bg-zinc-800; */
	}
</style>
