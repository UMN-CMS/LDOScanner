<script lang="ts">
  import { BrowserMultiFormatReader, BarcodeFormat, NotFoundException } from '@zxing/library';
  import { createEventDispatcher, onMount, tick } from 'svelte';

  let dispatcher = createEventDispatcher();
  let scan_type = '';

  export let is_running_handler= null;
  
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


  async function zoomTrackTo(track, value){
    try {
      const capabilities = track.getCapabilities();
      const max = capabilities["zoom"]["max"];
      const constraints = {advanced: [{"zoom": max}]};
      await track.applyConstraints(constraints);
    } catch (err) {
      console.error('applyConstraints() failed: ', err);
    }
  }


  async function makeVideoDevice(device_id) {
	const video_constraints = { deviceId: { exact: selected_device_id } };
	const constraints = { video: video_constraints };
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	const [track] = await stream.getVideoTracks();
    await zoomTrackTo(track, 3.0);
	return [stream, track];
  }


  async function startDecode() {
	await stop();

	[stream, track] = await makeVideoDevice(selected_device_id);

    await tick();

	const p = new Promise((resolve,reject) => code_reader.decodeFromStream(stream, 'video', (result, err) => {
	  if (result) {
		resolve(result);
	  }
	  if (err && !(err instanceof NotFoundException)) {
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
    if(all_devices === null){
	  all_devices = await getAllDevices();
    }
    if(!hasCamera()) return;
	if (isRunning()) await stop();
    if (selected_device_id === null){
      selected_device_id = all_devices[0].deviceId;
    }
	scan_type = request;
	startDecode();
  }



  let is_running = false;

  export function isRunning() {
    const r =  (stream !== null);
    if(is_running_handler !== null){
      if (r){
        is_running_handler(scan_type);
      } else {
        is_running_handler('');
      }
    }
    return r

  }

  $: {
    is_running = isRunning();
    stream = stream;
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
{#if !hasCamera()}
  <div class="notification is-danger is-centered">
    Could not find any usable cameras.
  </div>
{/if}
{#if is_running  }
  <div class="columns is-centered mb-1 pb-1">
	<div class="column is-centered is-narrow ">
	  <video bind:this={video_element} class="" id="video" style="border: 1px solid gray"></video>
	</div>
  </div>
  <div class="block pb-3 pt-1 mt-1">
    <div class="is-full-width is-flex is-flex-direction-row is-align-content-space-around is-align-items-stretch is-justify-content-space-around">
      <div class="is-flex-grow-4"></div>
      {#if all_devices !== null}
        <div class="">
          <div class="select">
            <select bind:value={selected_device_id} on:change={startDecode}>
		      {#each all_devices as device}
			    <option value={device.deviceId}>
			      {device.label}
			    </option>
		      {/each}	                    </select>
          </div>
        </div>
	  {/if}
	  {#if selected_device_id !== null}
        <div class="is-flex-grow-1"></div>
        <div class="is-narrow">
	      <button class="button" on:click={toggle}> {is_running? "Stop" : "Start"} Decode</button>
        </div>
      {/if}
      <div class="is-flex-grow-4"></div>
    </div>
  </div>
{/if}
<!-- <div>  Is Running {isRunning()}
     </div> -->
<!-- </main> -->
