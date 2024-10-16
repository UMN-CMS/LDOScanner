<script lang="ts">

 import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
 import { createEventDispatcher, onMount,tick } from 'svelte';

 let dispatcher = createEventDispatcher();
 let scan_type = "";
 const code_reader = new BrowserMultiFormatReader()

 let selected_device_id;
 async function getDevices(){
     let devices =  await code_reader.listVideoInputDevices()
     return devices
 }
 let promise;
 let decode_promise  = null;
 let running = false;
 onMount(()=>{
     let promise  = getDevices();
 }
 )

 function startDecode(device_id){
     console.log("STARTING DECODE")
     dispatcher("barcode_scanned",
              {request: scan_type,
              value: "HELLOWORLD123",
              });
     code_reader.reset();
     running=false;
     return;
     decode_promise = new Promise( (resolve,reject) =>{
         code_reader.decodeFromVideoDevice(device_id, 'video',
                                           (result, err) => {
                                               running = false;
                                               if (result) {
                                                   resolve(result)
                                                   dispatch("barcode_scanned",
                                                            {request: scan_type,
                                                            value: result,
                                                            }
                                                   );
                                               }
                                               if (err && !(err instanceof ZXing.NotFoundException)) {
                                                   reject(err)}
         })
     })
 }

 export function reset(){
     code_reader.reset()
 }

 export function start(request){
     console.log(`Starting scan with request ${request}`)
     if (running) reset();
     running = true;
     scan_type = request;
     tick().then(()=> startDecode(selected_device_id));
 }

</script>
<main>
    {#if running}
        <div>
            <p>Decoding {scan_type}</p>
        </div>

        <div>
            <video id="video" width="300" height="200" style="border: 1px solid gray"></video>
        </div>
        <select bind:value={selected_device_id}>
            {#await promise }
	            <option value={null}>
                    Loading Available Video Devices...
	            </option>
            {:then devices}
                {#if devices} 
	                {#each devices as device}
		                <option value={device.id}>
		                    {device.label}
		                </option>
	                {/each}
                {/if}
        {:catch someError}
	            System error: {someError.message}.
            {/await}
        </select>

        {#if selected_device_id !== null }
            <button on:click="{startDecode(selected_device_id)}"> Start Decode</button>
        {/if}

        {#await decode_promise }
            Please Scan Barcode
        {:catch someError}
	        System error: {someError.message}.
        {/await}
    {/if}
</main>

