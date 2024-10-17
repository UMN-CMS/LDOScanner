<script lang="ts">
 import { BrowserMultiFormatReader, BarcodeFormat, NotFoundException } from '@zxing/library';
 import { createEventDispatcher, onMount, tick } from 'svelte';

 async function makeVideoDevice(device_id) {
	 const video_constraints = { deviceId: { exact: device_id } };
	 const constraints = { video: video_constraints };
	 const stream = await navigator.mediaDevices.getUserMedia(constraints);
	 const [track] = await stream.getVideoTracks();
	 return [stream, track];
 }


 let dispatcher = createEventDispatcher();
 let scan_type = '';
 const code_reader = new BrowserMultiFormatReader();

 let video_device = null;
 let stream = null;
 let track = null;

 let promise;
 let decode_promise = null;
 let selected_device_id = null;
 let device_id=null;

 let no_cameras=false;

 async function onSelectDevice() {
     device_id = selected_device_id;
	 await stop();
	 await startDecode();
 }

 async function getDevices() {
     await navigator.mediaDevices.getUserMedia({video: true, audio: false});
	 let devices = await code_reader.listVideoInputDevices();
     no_cameras = devices.length === 0;
	 return devices;
 }

 let video_element= null;
 async function startDecode() {
     console.log(video_element);
	 [stream, track] = await makeVideoDevice(device_id);
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
     stop();
     console.log(code);
	 dispatcher('barcode_scanned', { request: scan_type, value: code });
 }

 export function stop() {
     console.log("Stopping")
	 if (stream !== null) {
	     stream.getTracks().forEach((track) => track.stop());
         track.stop();
         stream = null;
         track = null;
	 }
	 code_reader.reset();
 }

 export function start(request) {
	 console.log(`Starting scan with request ${request}`);
	 if (isRunning()) stop();
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

 onMount(() => {
	 promise = getDevices();
	 promise.then((vals) => {
	     console.log(vals);
         if(vals.length>0){
	         selected_device_id = vals[0].deviceId;
         }
	     onSelectDevice();
	 });
 });

</script>

{#if no_cameras }
    <div class="notification is-danger is-centered">
        Could not find any usable cameras.
    </div>
{/if}
{#if isRunning() }

	<div>
	    <video bind:this={video_element} id="video" width="300" height="200" style="border: 1px solid gray"></video>
	</div>

    <div class="select">
        <select bind:value={selected_device_id} on:change={onSelectDevice}>
	        {#await promise}
		        <option value={null}> Loading Available Video Devices... </option>
	        {:then devices}
		        {#if devices.length > 0}
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
    </div>
	{#if device_id !== null}
	    <button on:click={toggle}> {(isRunning())? "Stop" : "Start"} Decode</button>
	{/if}

	{#await decode_promise}
	    Please Scan Barcode
	{:catch someError}
	    System error: {someError.message}.
	{/await}
{/if}
<!-- <div>  Is Running {isRunning()}
     </div> -->
<!-- </main> -->
