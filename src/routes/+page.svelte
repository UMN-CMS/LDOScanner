<script lang="ts">
  import {onMount} from 'svelte';
  import BarcodeBox from './BarcodeBox.svelte';
  import BarcodeScanner from './BarcodeScanner.svelte';
  import { SvelteToast,toast } from '@zerodevx/svelte-toast'
  import { config } from '$lib/config.ts';
  import { SvelteMap } from 'svelte/reactivity';

  let scannables = new SvelteMap(config.scannables.map(x=>[x.name,x]));
  const options = {duration: 4000};
  let barcode_scanner= null;
  const auto_submit = config.auto_submit;
  const start_with = config.start_with;

  class CurrentComponentState{
    is_scanning = $state(false)
    barcode = $state(null)
    is_valid = $state(null)

    constructor(name) {
      this.name = name
    }
  };

  let current_state = new SvelteMap(Array.from(scannables.entries()).map(([k,v])=>[k,new CurrentComponentState(k)]));

  async function handleRequestScan(component) {
    await barcode_scanner.start(component);
  }

  function handleScanned(component, value) {
    const vals =  current_state.get(component);
    const barcode = value.text
    vals.is_scanning = false;
    vals.barcode = barcode;
    vals.is_valid = scannables.get(component).valid_regex.test(barcode);
    if (auto_submit  && ok_to_submit){
      handleSubmit();
    }
  }

  function handleSubmit(){
    if(!ok_to_submit) return;
    const ok = config.submission_function(
      new Map(Array.from(current_state.entries()).map(([k,v])=>[k,v.barcode])),
      toast
    );
  }

  function isRunningHandler(target){
    for(let [k,v] of current_state.entries()){
      if(k === target) v.is_scanning=true;
      else v.is_scanning=false;
    }
  }

  let ok_to_submit = $derived.by(()=>{
    return Array.from(current_state.values()).every((x)=>(x.barcode !== null && x.is_valid))
  });

  onMount( ()=>{
    if (start_with !== null){
      handleRequestScan(start_with)
    }
  })

</script>


<main>
  <SvelteToast {options}/>
  <section class="section">
    <div class="">
      <BarcodeScanner
        barcode_scanned_callback={handleScanned}
        is_running_callback={isRunningHandler}
        bind:this={barcode_scanner}
      />
    </div>
    <div class="columns is-multiline is-6">
      {#each current_state.values() as k }
        <div class="column is-one-half">
	      <BarcodeBox
	        request_scan_callback={handleRequestScan}
	        barcode={k.barcode}
	        component_type={k.name}
            is_valid={k.is_valid}
            is_loading={k.is_scanning}
	      />
        </div>

      {/each}
      <div class="column is-full">
        <button disabled={!ok_to_submit} class="button is-success is-fullwidth" onclick={handleSubmit}>Submit</button>
      </div>
    </div>
  </section>
</main>
