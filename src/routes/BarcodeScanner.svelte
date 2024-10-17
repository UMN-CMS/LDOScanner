<script lang="ts">
	import { BrowserMultiFormatReader, BarcodeFormat, NotFoundException } from '@zxing/library';
	import { createEventDispatcher, onMount, tick } from 'svelte';

	async function makeVideoDevice(device_id) {
		const video_constraints = { deviceId: { exact: device_id } };
		const constraints = { video: video_constraints };
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		console.log(stream);
		const [track] = await stream.getVideoTracks();
		return [stream, track];
	}

	//
	// class VideoDevice{
	//   constructor(device_id, stream, track, constraints) {
	//     this.device_id = device_id;
	//     this.stream = stream;
	//     this.track = track;
	//     this.constraints = constraints;
	//   }
	//
	//   async zoomTrackTo(track, value){
	//     try {
	//       const constraints = {advanced: [{"zoom": value}]};
	//       console.log(constraints);
	//       await track.applyConstraints(constraints);
	//     } catch (err) {
	//       console.error('applyConstraints() failed: ', err);
	//     }
	//     return
	//   }
	//
	//   getTrackCapability(track, capability){
	//     const capabilities = track.getCapabilities();
	//     const settings = track.getSettings();
	//     if( !( capability  in settings)){
	//       return null;
	//     }
	//     return capabilities[capability];
	//   }
	//
	//   async start(){
	//     this.stream = await navigator.mediaDevices.getUserMedia(this.constraints).then()
	//     const [track] = await this.stream.getVideoTracks();
	//     this.track=track;
	//   }
	//
	//   async stop(){
	//     await this.track.stop();
	//   }
	// };

	let dispatcher = createEventDispatcher();
	let scan_type = '';
	const code_reader = new BrowserMultiFormatReader();

	let video_device = null;
	let stream = null;
	let track = null;

	let promise;
	let decode_promise = null;
	let running = false;
	let selected_device_id = null;

	async function onSelectDevice() {
		await reset();
	}

	async function getDevices() {
		let devices = await code_reader.listVideoInputDevices();
		return devices;
	}

	async function startDecode(device_id) {
		[stream, track] = await makeVideoDevice(selected_device_id);
		code_reader.decodeFromStream(stream, 'video', (result, err) => {
			running = false;
			if (result) {
				console.log(result);
				resolve(result);
				dispatch('barcode_scanned', { request: scan_type, value: result });
				stream.getTracks().forEach((track) => track.stop());
			}
			if (err && !(err instanceof NotFoundException)) {
				//console.log(err)
				//  reject(err)
			}
		});

		// console.log(video_device);
		//     decode_promise = new Promise( (resolve,reject) =>{
		// })
	}

	export function reset() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}
		code_reader.reset();
	}

	export function start(request) {
		console.log(`Starting scan with request ${request}`);
		if (running) reset();
		running = true;
		scan_type = request;
		tick().then(() => startDecode(selected_device_id).then(() => {}));
	}

	onMount(() => {
		promise = getDevices();
		promise.then((vals) => {
			console.log(vals);
			selected_device_id = vals[0].deviceId;
			onSelectDevice();
		});
	});
</script>

<main>
	{#if running || true}
		<div>
			<p>Decoding {scan_type}</p>
		</div>

		<div>
			<video id="video" width="300" height="200" style="border: 1px solid gray"></video>
		</div>
		<select bind:value={selected_device_id} on:change={onSelectDevice}>
			{#await promise}
				<option value={null}> Loading Available Video Devices... </option>
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

		{#if selected_device_id !== null}
			<button on:click={startDecode(selected_device_id)}> Start Decode</button>
		{/if}

		{#await decode_promise}
			Please Scan Barcode
		{:catch someError}
			System error: {someError.message}.
		{/await}
	{/if}
</main>
