<script lang="ts">
	// import '@fontsource/inter';
	import '../app.less';
	import Navbar from '@/components/navbar/Navbar.svelte';
	import Transition from '@/shared/Transition.svelte';

	import MenuItem from '@/components/menu/MenuItem.svelte';
	import MuteButton from '@/audio/MuteButton.svelte';
</script>

<div class="relative h-screen blur-[.4px] w-[75%] m-auto scale-x-[1.33]">
	<Navbar />

	<div class="p-16 pl-[10%] w-full ">
		<Transition>
			<slot />
		</Transition>
	</div>

	{#if true}
		<div class="absolute bottom-12 right-[12%]">
			<MenuItem item={{ name: 'back', href: '/', handle: 'home' }} />
		</div>
	{/if}

	<div class="absolute bottom-5 right-3">
		<MuteButton />
	</div>
</div>
