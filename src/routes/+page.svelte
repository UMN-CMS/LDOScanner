<script lang="ts">
  import BarcodeBox from './BarcodeBox.svelte';
  import BarcodeScanner from './BarcodeScanner.svelte';
  import { SvelteToast,toast } from '@zerodevx/svelte-toast'
  import { config } from '$lib/config.ts';

  let scannables = config.scannables;
  const options = {duration: 4000};

  let current_state = $state({});
  for(let k in scannables){
    current_state[k] = {is_scanning: false, barcode: null, is_valid: null};
  }

  async function handleRequestScan() {
    await barcode_scanner.start(request.detail.type);
  }

  function handleScanned(component, value) {
    current_state[k].is_scanning = false;
    current_state[k].barcode = value;
    current_state[k].is_valid = scannables[component].test(value)
  }

  function handleSubmit(){
    if(!ok_to_submit) return;
    const ok = config.submission_function(Object.fromEntries(
      Object.entries(current_state).map(([k,v])=>[k,v.barcode])
    ));
  }

  let ok_to_submit = $derived(Object.values(current_state).map(
    (x)=>(x.barcode !== null && x.is_valid))
  );
</script>


<main>
  <!-- <div class="container"> -->
  <SvelteToast {options}/>
  <!-- </div> -->
  <section class="section">
    <div class="">
      <BarcodeScanner
        barcode_scanned_callback={handleScanned}
        is_running_callback={isRunningHandler}
        bind:this={barcode_scanner}
      />
    </div>
    <div class="columns is-multiline is-6">
      {# each scannables as scannable }
      <div class="column is-one-half">
	    <BarcodeBox
	      request_scan_callback={handleRequestScan}
	      barcode={current_state[scannables.name].barcode}
	      component_type={scannables.name}
          is_valid={current_state[scannables.name].is_valid}
          is_loading={current_state[scannables.name].is_scanning}
	    />
      </div>

     {/each}
     <div class="column is-full">
       <button disabled={!ok_to_submit} class="button is-success is-fullwidth" onclick={handleSubmit}>Submit</button>
     </div>
    </div>
  </section>
</main>
