<script lang="ts">


  import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
  import {onMount, tick } from 'svelte';

  let {barcode_scanned_callback, is_running_callback }  = $props();
  
  const code_reader = new BrowserMultiFormatReader();

  function getMethods(obj) {
    var result = [];
    for (var id in obj) {
      try {
        if (typeof(obj[id]) == "function") {
          result.push(id + ": " + obj[id].toString());
        }
      } catch (err) {
        result.push(id + ": inaccessible");
      }
    }
    return result;
  }


  let target_component = $state(null);
  let stream = $state(null);
  let track = null;
  let is_running = $derived(stream !== null)
  let all_devices= $state(null);
  let selected_device_id = $state(null);
  let video_element= $state(null)
  let min_zoom = $state(0.5)
  let max_zoom = $state(10)
  let current_zoom=$state(3.0)


  let event_cache = [];
  let prev_diff = -1;
  let to_print = $state(null);
  let to_print_2 = $state(null);


  function clampZoom(value){
    return Math.min(Math.max(value, min_zoom), max_zoom);
  }

  async function zoomTrack(value){
    try {
      const constraints = {advanced: [{"zoom": current_zoom}]};
      await track.applyConstraints(constraints);
    } catch (err) {
      console.error('applyConstraints() failed: ', err);
      to_print_2 = `${JSON.stringify(track, null, 2)} -- ${track} -- ${track.applyConstraints} -- ${err}`
    }
  }

  $effect(
    () => {
      if(is_running){zoomTrack(current_zoom);}
    } 
  )

  async function zoomTrackBy(value){
    current_zoom = clampZoom(current_zoom + value);
  }

  function onPointerDown(ev){
    event_cache.push(ev);
    // ev.target.style["border-color"] = "red";
  }

  function onPointerMove(ev) {
    const index = event_cache.findIndex(
      (cache_ev) => cache_ev.pointerId === ev.pointerId,
    );
    event_cache[index] = ev;
    if (event_cache.length === 2) {
      let cur_diff = Math.abs(event_cache[0].clientX - event_cache[1].clientX);
      if (prev_diff > 0) {
        if (cur_diff > prev_diff) {zoomTrackBy(0.1);}
        if (cur_diff < prev_diff) {zoomTrackBy(-0.1);}
      }
      prev_diff = cur_diff;
    }
  }

  function removeEvent(ev) {
    const index = event_cache.findIndex(
      (cach_ev) => cach_ev.pointerId === ev.pointerId,
    );
    event_cache.splice(index, 1);
  }

  function onPointerUp(ev) {
    removeEvent(ev);
    if (event_cache.length < 2) {
      prev_diff = -1;
    }
  }



  $effect( ()=>{
    if(is_running){
      is_running_callback(target_component)
    } else {
      is_running_callback(null)
    }
  });

  let has_camera = $derived(all_devices === null || all_devices.length > 0)

  async function getAllDevices() {
    if (all_devices !== null){
      return all_devices;
    }
    let devices = null
    try{
      await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      devices = await code_reader.listVideoInputDevices();
      devices.sort((a,b) => b.label.includes("Back"));
    } catch (err){
      devices = [];
    }
    all_devices=devices;
    return all_devices;
  }



  async function makeVideoDevice(device_id) {
    const video_constraints = { deviceId: { exact: selected_device_id } };
    const constraints = { video: video_constraints };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    [track] = await stream.getVideoTracks();
    max_zoom = track.getCapabilities()["zoom"]["max"];
    min_zoom = track.getCapabilities()["zoom"]["min"];
    zoomTrack(current_zoom);
    return [stream, track];
  }

  async function startDecode() {
    await stop();

    // [stream, track] = await makeVideoDevice(selected_device_id);
    await makeVideoDevice(selected_device_id);

    await tick();
    const p = new Promise((resolve,reject) => code_reader.decodeFromStream(stream, 'video', (result, err) => {
      if (result) {resolve(result);}
      if (err && !(err instanceof NotFoundException)) {resolve(null)}
    }));
    const code = await p;
    await stop();
    barcode_scanned_callback(target_component, code);
  }

  export async function stop() {
    if (stream !== null) {
      stream.getTracks().forEach(async (track) => await track.stop());
      await track.stop();
      stream = null;
      track = null;
    }
    code_reader.reset();
  }
  

  export async function start(request) {
    if(all_devices === null){
      all_devices = await getAllDevices();
    }
    if(!has_camera) return;
    if (is_running) await stop();
    if (selected_device_id === null){selected_device_id = all_devices[0].deviceId;}
    target_component = request;
    startDecode();
  }

  export async function toggle(){
    if (is_running) { await stop(); }
    else{ await start(scan_type); }
  }




</script>

<style>

  /* The slider itself */
  .slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 100%; /* Full-width */
    height: 10px; /* Specified height */
    background: #d3d3d3; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
    border-radius: 2px;
  }

  /* Mouse-over effects */
  .slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
  }

  /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 10px; /* Set a specific slider handle width */
    height: 10px; /* Slider handle height */
    background: #04AA6D; /* Green background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 2px;
    border-width: 0;
  }

  .slider::-moz-range-thumb {
    width: 10px; /* Set a specific slider handle width */
    height: 10px; /* Slider handle height */
    background: #04AA6D; /* Green background */
    cursor: pointer; /* Cursor on hover */
    border-radius: 2px;
    border-width: 0;
  }
</style>



{#if !has_camera}
  <div class="notification is-danger is-centered">
    Could not find any usable cameras.
  </div>
{/if}
<span> {to_print_2} </span>
{#if is_running  || true}
  <div class="columns is-centered mb-1 pb-1">
    <span> {to_print} </span>
    <div class="column is-centered is-narrow ">
      <video
        onpointerup={onPointerUp}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        muted bind:this={video_element} class="" id="video" style="touch-action: none">

      </video>
    </div>
    {#if min_zoom !== null }
      <div class="column is-centered is-narrow">
        <div class="block is-fullwidth is-flex">
          <input class ="slider is-flex-grow-1" type="range" step="0.1" min="{min_zoom}" max="{max_zoom}" bind:value={current_zoom} />
        </div>
      </div>
    {/if}
  </div>
  <div class="block pb-3 pt-1 mt-1">
    <div class="is-full-width is-flex is-flex-direction-row is-align-content-space-around is-align-items-stretch is-justify-content-space-around">
      <div class="is-flex-grow-4"></div>
      {#if all_devices !== null}
        <div class="">
          <div class="select">
            <select bind:value={selected_device_id} onchange={startDecode}>
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
        <div class="is-flex-grow-1"></div>
        <div class="is-narrow">
	      <button class="button" onclick={toggle}> {is_running? "Stop" : "Start"} Decode</button>
        </div>
      {/if}
      <div class="is-flex-grow-4"></div>
    </div>
  </div>
{/if}
