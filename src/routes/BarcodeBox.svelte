<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let regex = null;
    export let component_type;
    export let barcode = null;
    export let is_valid = null;
    let dispatcher = createEventDispatcher();

    function requestScan() {
	    console.log('HERE');
	    dispatcher('request_scan', { type: component_type });
    }

    export function reset() {
	    barcode = null;
    }


    let box_color = "";
    $: {
        if (barcode === null){
            box_color = "has-background-grey-lighter";
        } else
            if (is_valid) {
                box_color = "has-background-success-light";
            } else {
                box_color = "has-background-danger-light";
            }
    }
</script>

<div class="box p-6 {box_color}">
    <div class="columns is-vcentered">
	    <div class="mt-1 mb-1 pt-1 pb-1 block column is-one-third has-text-centered">
		    <span class="is-size-5 is-text-centered"> {component_type} </span>
	    </div>
        {#if barcode !== null }
	        <div class="mt-1 mb-1 pt-1 pb-1 block column is-one-third has-text-centered">
		        <span class="is-size-6"> {barcode} </span>
	        </div>
        {/if}
	    <div class="is-narrow">
		    <button class="button is-fullwidth" on:click={requestScan}>
			    {#if barcode === null}
				    Scan Barcode
			    {:else}
				    Rescan Barcode
			    {/if}
		    </button>
	    </div>
    </div>
</div>
