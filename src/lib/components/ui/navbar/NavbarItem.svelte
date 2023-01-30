<script lang="ts">
	import { updatePageIndex } from '@shared/store';

	export let index: number = 0;
	export let handle: string;
	export let name: string;
	export let href: string;
	export let isActive: boolean = false;

	$: handleChange(isActive);

	const handleChange = (isActive: boolean) => {
		if (isActive) {
			updatePageIndex(index);
		}
	};
</script>

<a
	{href}
	class="hover:bg-zinc-800/70 duration-200 transition-colors px-2 rounded-md h-10 items-center w-20  sm:w-32 lg:w-40 flex justify-center"
	class:active={isActive}
	id="navbar-{handle}"
>
	<span class="text-sm sm:text-xl lg:text-2xl font-semibold">{name}</span>
</a>
