<script lang="ts">
  import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
  const codeReader = new BrowserMultiFormatReader()

  let selected_device_id;
  console.log('ZXing code reader initialized')
  
  async function getDevices(){
    let devices = await codeReader.listVideoInputDevices()
    return devices
  }

  let promise  = getDevices()


  let decode_promise  = null;

  async function decode(device_id){
    decode_promise = new Promise();
    let value = await codeReader.decodeFromVideoDevice(device_id, 'video',
                                                       (result, err) => {
                                                         if (result) {
                                                           console.log(result)
                                                           document.getElementById('result').textContent = result.text
                                                         }
                                                         if (err && !(err instanceof ZXing.NotFoundException)) {
                                                           console.error(err)
                                                           document.getElementById('result').textContent = err
                                                         }
    })
  )
    return value
  }

</script>
<main>

  <div>
    <video id="video" width="300" height="200" style="border: 1px solid gray"></video>
  </div>

  <select bind:value={selected_device_id}>
    {#await promise }
	  <option value={null}>
        Loading Available Video Devices...
	  </option>
    {:then devices}
	  {#each devices as device}
		<option value={device.id}>
		  {device.label}
		</option>
	  {/each}
    {:catch someError}
	  System error: {someError.message}.
    {/await}
  </select>

  <button on:click="{decode(selected_device_id)}"> Start Decode</button>

  {#await decode_promise }
    Decoding
  {:then value}
    {value}
  {:catch someError}
	System error: {someError.message}.
  {/await}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
