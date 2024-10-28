<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let is_loading = false;
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
  <div class="block columns is-vcentered is-centered ">
	<div class="column is-text-centered ">
	  <span class="is-size-5 is-text-centered"> {component_type} </span>
	</div>

	<div class="column is-narrow">
	  <button class="button is-fullwidth" on:click={requestScan}>
		{#if barcode === null}
		  Scan Barcode
		{:else}
		  Rescan Barcode
		{/if}
	  </button>
    </div>
  </div>
  {#if barcode !== null || is_loading || true}
    <div class="columns">
      <div class="column">
        <div class="control" class:is-loading={is_loading}>
          <!-- <input class="input" type="text" value="{barcode}" readonly disabled/> -->
          <input class="input" type="text" bind:value={barcode}/>
        </div>
        <!-- <span class="is-size-6"> {barcode} </span> -->
	  </div>
    </div>
  {/if}
</div>
