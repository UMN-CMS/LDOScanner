<script lang="ts">
  let {component_type, barcode, is_valid, is_loading, request_scan_callback} = $props();
  async function requestScan() {
    request_scan_callback(component_type);
  }

  let box_color = $derived.by( ()=>{
    console.log(`${barcode}`)
    if (barcode === null){
      return "has-background-grey-lighter";
    } else
      if (is_valid) {
        return "has-background-success-light";
      } else {
        return "has-background-danger-light";
      }
  });
  
</script>

<div class="box p-6 {box_color}">
  <div class="block columns is-vcentered is-centered ">
    <div class="column is-text-centered ">
      <span class="is-size-5 is-text-centered"> {component_type} </span>
    </div>

    <div class="column is-narrow">
      <button class="button is-fullwidth" onclick={requestScan}>
	    {#if barcode === null}
	      Scan Barcode
	    {:else}
	      Rescan Barcode
	    {/if}
      </button>
    </div>
  </div>
  {#if barcode !== null || is_loading}
    <div class="columns">
      <div class="column">
        <div class="control" class:is-loading={is_loading}>
          <input class="input" type="text" bind:value={barcode} readonly disabled/>
        </div>
      </div>
    </div>
  {/if}
</div>
