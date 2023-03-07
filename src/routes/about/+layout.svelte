<script lang="ts">
	import { fetchStatus } from '@/3D/store';

	import LazyF from '@/shared/LazyFetched.svelte';
	const Model = () => import('@/3D/Model.svelte');
</script>

<div>
	<div class="flex">
		<div class="w-64 h-64">
			<LazyF component={Model} fetched={$fetchStatus} />
		</div>
		<slot />
	</div>
</div>
