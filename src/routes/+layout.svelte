<script lang="ts">
	import '../app.less';
	import '@fontsource/inter';

	    import Navbar from '$lib/components/ui/navbar/Navbar.svelte';
	import Transition from '$lib/shared/Transition.svelte';
</script>

<Navbar />
<div class="flex flex-col items-center pt-5 pb-10 px-10">
	<Transition>
		<slot />
	</Transition>
</div>
