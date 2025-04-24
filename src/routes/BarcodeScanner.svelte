<script lang="ts">
  import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
  import {onMount, tick } from 'svelte';

  let {barcode_scanned_callback, is_running_callback }  = $props();
  
  const code_reader = new BrowserMultiFormatReader();


  let target_component = $state(null);
  //  let is_running = $state(false);
  let stream = $state(null);
  let track = null;
  let is_running = $derived(stream !== null)
  let all_devices= $state(null);
  let selected_device_id = $state(null);
  let video_element= $state(null);


  let event_cache = []
  let prev_diff = -1

  async function zoomTrackTo(track, value){
    try {
      const capabilities = track.getCapabilities();
      const max = capabilities["zoom"]["max"];
      const constraints = {advanced: [{"zoom": value}]};
      await track.applyConstraints(constraints);
    } catch (err) {
      console.error('applyConstraints() failed: ', err);
    }
  }

  async function zoomTrackBy(value){
    try {
      const capabilities = track.getCapabilities();
      const constraints = {advanced: [{"zoom": value}]};
      await track.applyConstraints(constraints);
    } catch (err) {
      console.error('applyConstraints() failed: ', err);
    }
  }


  function onPointerDown(ev){
    event_cache.push(ev);
  }

  function log(prefix, ev) {
    const o = document.getElementsByTagName("output")[0];
    console.log(`${prefix}:
  pointerID   = ${ev.pointerId}
  pointerType = ${ev.pointerType}
  isPrimary   = ${ev.isPrimary}
    `);
  }

  function onPointerMove(ev) {
    const index = event_cache.findIndex(
      (cache_ev) => cache_ev.pointerId === ev.pointerId,
    );
    event_cache[index] = ev;
    if (event_cache.length === 2) {
      const cur_diff = Math.abs(event_cache[0].clientX - event_cache[1].clientX);
      if (prev_diff > 0) {
        if (cur_diff > prev_diff) {
          log("Pinch moving OUT -> Zoom in", ev);
        }
        if (cur_diff < prev_diff) {
          log("Pinch moving IN -> Zoom out", ev);
        }
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
    log(ev.type, ev);
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
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const [track] = await stream.getVideoTracks();
    console.log(track)
    await zoomTrackTo(track, 3.0);
    return [stream, track];
  }


  async function startDecode() {
    await stop();
    [stream, track] = await makeVideoDevice(selected_device_id);
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
{#if !has_camera}
  <div class="notification is-danger is-centered">
    Could not find any usable cameras.
  </div>
{/if}
{#if is_running  }
  <div class="columns is-centered mb-1 pb-1">
    <div class="column is-centered is-narrow ">
      <video
        onpointerup={onPointerUp}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        muted bind:this={video_element} class="" id="video" style="border: 1px solid gray"></video>
    </div>
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
	          {/each}	                    </select>
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
