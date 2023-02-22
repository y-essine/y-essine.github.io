<script lang="ts">
	import { fetchStatus } from '@/shiba/store';

	import LazyF from '@/shared/LazyFetched.svelte';
	const Shiba = () => import('@/shiba/Shiba.svelte');
</script>

<div>
	<div class="flex">
		<div class="w-64 h-64">
			<LazyF component={Shiba} fetched={$fetchStatus} />
		</div>
		<slot />
	</div>
</div>
