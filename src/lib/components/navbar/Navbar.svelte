<script lang="ts">
	import { currentPage, pageIndex } from '@/shared/store';

	$: console.log($currentPage);
</script>

<div class="flex justify-between p-16 w-[50%]">
	<div>
		<h1 class="text-6xl font-beckett capitalize"><span>{$currentPage} {$pageIndex}</span></h1>
	</div>
</div>
