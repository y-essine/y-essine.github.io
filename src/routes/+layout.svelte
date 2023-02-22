<script lang="ts">
	// import '@fontsource/inter';
	import '../app.less';
	import { currentPage } from '@/shared/store';
	import { get } from 'svelte/store';
	import Navbar from '@/components/navbar/Navbar.svelte';
	import Transition from '@/shared/Transition.svelte';

	import MenuItem from '@/components/menu/MenuItem.svelte';
	import MuteButton from '@/audio/MuteButton.svelte';

	$: console.log($currentPage);
</script>

<div class="relative h-screen mx-28 scale-x-125 blur-[.4px]">
	<Navbar />

	<div class="p-16 w-full ">
		<Transition>
			<slot />
		</Transition>
	</div>

	{#if $currentPage === 'home'}
		<div class="absolute bottom-12 right-10">
			<MenuItem item={{ name: 'back', href: '/', handle: 'home' }} />
		</div>
	{/if}

	<div class="absolute bottom-5 right-3">
		<MuteButton />
	</div>
</div>
