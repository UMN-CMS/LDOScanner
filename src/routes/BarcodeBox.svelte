<script lang="ts">
 import { createEventDispatcher } from 'svelte';
 export let regex = null;
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

 $: is_valid = (regex === null) ||  regex.test(barcode);
</script>

<div class="box">
    <div class="columns is-vcentered">
	    <div class="column is-one-third has-text-centered">
		    <span class="is-size-6 is-text-centered"> {component_type} </span>
	    </div>
	    <div class="column is-one-third has-text-centered">
		    <span class="is-size-6"> {barcode} </span>
	    </div>
	    <div class="is-centered is-narrow">
		    <button class="button" on:click={requestScan}>
			    {#if barcode === null}
				    Scan Barcode
			    {:else}
				    Rescan Barcode
			    {/if}
		    </button>
	    </div>
    </div>
</div>
