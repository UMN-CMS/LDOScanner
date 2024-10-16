<script lang="ts">
 import { createEventDispatcher } from 'svelte';
 export let component_type;
 export let barcode=null;
 let dispatcher = createEventDispatcher();

 function requestScan(){
     console.log("HERE")
     dispatcher("request_scan",
                {type : component_type}
     )
     }

 export function reset(){
     barcode = null
 }

</script>

<div>
    <span> {component_type} </span>
    <span>
        {barcode}
    </span>
    <button on:click="{requestScan}">
        {#if barcode === null}
            Scan Barcode
        {:else}
            Rescan Barcode
        {/if}
    </button>
</div>
