<script lang="ts">
	import { currentPage, updateCurrentPage } from '@/shared/store';
	import { page } from '$app/stores';
	$: {
		let routeName = $page.url.pathname.split('/')[1];
		updateCurrentPage(routeName || 'home');
	}
</script>

<div class="flex justify-between pt-16 pl-[10%]">
	<div>
		<h1 class="text-6xl font-beckett capitalize"><span>{$currentPage}</span></h1>
	</div>
</div>
