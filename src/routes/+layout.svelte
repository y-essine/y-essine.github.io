<script>
	import '../app.less';
	import '@fontsource/inter';

	import { page } from '$app/stores';
	import PageTransition from '$components/ui/PageTransition.svelte';
	import Navbar from '$components/ui/Navbar/Navbar.svelte';
</script>

<Navbar />
<div class="flex flex-col items-center pt-5 pb-10">
	<PageTransition refresh={$page.url.pathname}>
		<slot />
	</PageTransition>
</div>
