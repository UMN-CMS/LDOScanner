export let config = {};
const mode="ldo_scanner";

if (mode === "ldo_scanner"){
  config = {
    start_with: null,
    auto_submit: false,
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
      const ldo_barcode = values.get("LDO");
      const engine_barcode = values.get("Engine");
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
}

if (mode === "simple_finder"){
  config = {
    start_with: "Board",
    auto_submit: true,
    scannables : [
      { name: "Board",
        valid_regex: /320/,
      },
    ],
    submission_function : async (values, toaster) => {
      const data = new FormData();
      const full_id = values.get("Board");
      const engine_re =/^320E[LH]/;
      const wagon_re =/^320W[EWH]/;
      const engine_url = "http://cmslab1.spa.umn.edu/Factory/EngineDB/module.py?full_id="
      const wagon_url = "http://cmslab1.spa.umn.edu/Factory/WagonDB/module.py?full_id="
      if(engine_re.test(full_id)){
        window.location = engine_url + full_id;
      }
      if(wagon_re.test(full_id)){
        window.location = wagon_url + full_id;
      }
    },
  };

}
