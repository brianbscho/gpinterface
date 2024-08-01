export const modelsLabAiModels = [
  {
    name: "ModelsLab",
    config: {
      model_id: "midjourney",
      negative_prompt: "",
      width: "1024",
      height: "1024",
      seed: null,
      guidance_scale: 7.5,
      lora_strength: null,
      lora_model: null,
      clip_skip: "2",
      embeddings_model: null,
    },
    configSelects: [
      {
        title: "Samples",
        name: "samples",
        values: ["1"],
      },
      {
        title: "Inference Steps",
        name: "num_inference_steps",
        values: ["21", "31", "41"],
      },
      {
        title: "Safety checker",
        name: "safety_checker",
        values: ["yes", "no"],
      },
      {
        title: "Safety checker type",
        name: "safety_checker_type",
        values: ["blur", "sensitive_content_text", "pixelate", "black"],
      },
      {
        title: "Enable tomesd",
        name: "tomesd",
        values: ["yes", "no"],
      },
      {
        title: "Use keras sigmas",
        name: "use_karras_sigmas",
        values: ["yes", "no"],
      },
      {
        title: "Panorama",
        name: "panorama",
        values: ["no", "yes"],
      },
      {
        title: "Self attention",
        name: "self_attention",
        values: ["no", "yes"],
      },
      {
        title: "Upscale",
        name: "upscale",
        values: ["1", "2", "3"],
      },
    ],
    url: "https://modelslab.com/api/v6/images/text2img",
  },
];
