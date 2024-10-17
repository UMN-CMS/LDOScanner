<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let component_type;
	export let barcode = null;
	let dispatcher = createEventDispatcher();

	function requestScan() {
		console.log('HERE');
		dispatcher('request_scan', { type: component_type });
	}

	export function reset() {
		barcode = null;
	}
</script>

<div class="box columns">
	<div class="column is-four-fifths">
		<span class="is-size-5"> {component_type} </span>
	</div>
	<div class="column">
		<span class="is-size-5"> {barcode} </span>
	</div>
	<div>
		<button class="button" on:click={requestScan}>
			{#if barcode === null}
				Scan Barcode
			{:else}
				Rescan Barcode
			{/if}
		</button>
	</div>
</div>
