export let config = {
  scannables : [
    { name: "Engine",
      valid_regex: /320E[LH]/,
    },
    { name: "LDO",
      valid_regex: /LDO/,
    }
  ],
  submission_function : async (values, toaster) => {
    console.log(values);
    const data = new FormData();
    const ldo_barcode = values.LDO;
    const engine_barcode = values.Engine;
    data.append('barcode', ldo_barcode);
    data.append('full_id', engine_barcode);

    const url=  "https://cmslab1.spa.umn.edu/Factory/EngineDB/add_component.py";
    try{
      const response = await fetch(url, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const text = await response.text();
      const resp = text.split("Begin")[1].split("End")[0].trim()
      let opts = null;


      const nok_opts = {theme: {
        "--toastBackground" : "var(--bulma-danger)",
        "--toastColor" : "var(--bulma-text)",
      }};
      const ok_opts = {theme: {
        "--toastBackground" : "var(--bulma-success)",
        "--toastColor" : "var(--bulma-text)",
      }};

      if (resp.includes("Error")){
        opts = nok_opts;
      } else {
        opts = ok_opts;
      }
      toaster.push(resp, opts)
    } catch (err){
      toaster.push(err.toString(), nok_opts)
    }
  },
};
