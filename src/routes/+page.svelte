<script lang="ts">
  import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
  const codeReader = new BrowserMultiFormatReader()

  let selected_device;
  console.log('ZXing code reader initialized')

  async function getDevices(){
    let devices = await codeReader.listVideoInputDevices()
    console.log(devices)
    return devices
  }

  
</script>
<main>

  <select bind:value={selected_device}>
    {#await getDevices() }
		<option value={null}>
          Loading Available Video Devices...
		</option>
    {:then devices}
	  {#each devices as device}
		<option value={device}>
		  {device.label}
		</option>
	  {/each}
    {:catch someError}
	  System error: {someError.message}.
    {/await}
  </select>
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
