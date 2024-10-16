<script lang="ts">
 import { BrowserMultiFormatReader, BarcodeFormat, NotFoundException } from '@zxing/library';
 import { createEventDispatcher, onMount, tick } from 'svelte';

 let dispatcher = createEventDispatcher();
 let scan_type = '';
 const code_reader = new BrowserMultiFormatReader();

 let stream = null;
 let track = null;

 let selected_device_id = null;

 let all_devices= null;
 let video_element= null;

 $:  hasCamera = ()=> {
     return all_devices === null || all_devices.length > 0 ;
 }


 async function getAllDevices() {
     if (all_devices !== null){
         return all_devices;
     }
     try{
         await navigator.mediaDevices.getUserMedia({video: true, audio: false});
	     var devices = await code_reader.listVideoInputDevices();
         devices.sort((a,b) => b.label.includes("Back"));
     } catch (err){
         var devices = [];
     }
     all_devices=devices;
	 return all_devices;
 }

 async function makeVideoDevice(device_id) {
     console.log(device_id);
	 const video_constraints = { deviceId: { exact: selected_device_id } };
	 const constraints = { video: video_constraints };
	 const stream = await navigator.mediaDevices.getUserMedia(constraints);
	 const [track] = await stream.getVideoTracks();
	 return [stream, track];
 }


 async function startDecode() {
	 await stop();

	 [stream, track] = await makeVideoDevice(selected_device_id);

     await tick();

	 const p = new Promise((resolve,reject) => code_reader.decodeFromStream(stream, 'video', (result, err) => {
	     if (result) {
		     console.log(result);
		     resolve(result);
	     }
	     if (err && !(err instanceof NotFoundException)) {
		     console.log(err)
		     resolve(null)
	 }}));

     const code = await p;
     await stop();

	 dispatcher('barcode_scanned', { request: scan_type, value: code });
 }

 export function stop() {
	 if (stream !== null) {
	     stream.getTracks().forEach((track) => track.stop());
         track.stop();
         stream = null;
         track = null;
	 }
	 code_reader.reset();
 }

 export async function start(request) {
     console.log("HERE");
     if(all_devices === null){
	     all_devices = await getAllDevices();
     }
     console.log(all_devices);
	 console.log(`Starting scan with request ${request}`);
     if(!hasCamera()) return;
	 if (isRunning()) await stop();
     if (selected_device_id === null){
         selected_device_id = all_devices[0].deviceId;
     }
	 scan_type = request;
	 startDecode();
 }


 $: isRunning = () =>{
     return (stream !== null);
 }

 export async function toggle(){
     if (isRunning()){
         await stop();
     }
     else{
         await start(scan_type);
     }
     
 }

</script>

{#if !hasCamera() }
    <div class="notification is-danger is-centered">
        Could not find any usable cameras.
    </div>
{/if}
{#if isRunning()  }
    <div class="columns is-centered">
	    <div class="column is-two-thirds">
	        <video bind:this={video_element} class="" id="video" style="border: 1px solid gray"></video>
	    </div>

	    <div class="column columns is-full-width">
            {#if all_devices !== null}
                <div class="column">
                    <div class="select">
                        <select bind:value={selected_device_id} on:change={startDecode}>
		                    {#each all_devices as device}
			                    <option value={device.deviceId}>
			                        {device.label}
			                    </option>
		                    {/each}
	                    </select>
                    </div>
                </div>
	        {/if}
	        {#if selected_device_id !== null}
                <div class="is-narrow">
	                <button class="button" on:click={toggle}> {(isRunning())? "Stop" : "Start"} Decode</button>
                </div>
            {/if}
	    </div>

    </div>
{/if}
<!-- <div>  Is Running {isRunning()}
     </div> -->
<!-- </main> -->
