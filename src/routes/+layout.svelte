<script lang="ts">
	// import '@fontsource/inter';
	import '../app.less';

	import Navbar from '@components/ui/navbar/Navbar.svelte';
	import Transition from '@shared/Transition.svelte';
	import LazyF from '@shared/LazyFetched.svelte';
	import { fetchStatus } from '@shiba/store';
	import { currentPage } from '@shared/store';
	const Shiba = () => import('@shiba/Shiba.svelte');
</script>

<Navbar />
<div class="flex flex-col items-center">
	<div class="h-64">
		<LazyF component={Shiba} fetched={$fetchStatus} />
	</div>
	<div class="p-7 pt-0 ">
		<Transition>
			<div class="mt-3">
				<slot />
			</div>
		</Transition>
	</div>
</div>
