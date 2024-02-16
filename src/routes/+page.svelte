<script lang="ts">
	import { incrementCounter, getCount } from '$lib/like';
	import Card from '@components/card.svelte';

	$: runLikes = getCount();

	const like = async () => {
		runLikes = incrementCounter();
	};
</script>

<div class="flex flex-col items-center justify-center w-full">
	<Card>
		<h1 class="text-3xl font-bold">Awesome Post!</h1>
		<p class="py-5">You really like this so you should heart it!</p>
		<hr />
		<div class="mt-3 flex items-center gap-3">
			<button type="button" on:click={like}>
				<div class="group hover:cursor-pointer">
					<div class="hidden group-hover:block">🤍</div>
					<div class="block group-hover:hidden">❤️</div>
				</div>
			</button>
			{#await runLikes}
				<span>Loading...</span>
			{:then likes}
				<div>{likes} Likes</div>
			{/await}
		</div>
	</Card>
</div>
