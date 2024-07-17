const aspectRatioSelect = {
  title: "Aspect ratio",
  name: "aspect_ratio",
  values: ["1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"],
};
const outputFormatSelect = {
  title: "Format",
  name: "output_format",
  values: ["png", "jpeg", "webp"],
};
const stylePresetSelect = {
  title: "Style",
  name: "style_preset",
  values: [
    "cinematic",
    "3d-model",
    "analog-film",
    "anime",
    "comic-book",
    "digital-art",
    "enhance",
    "fantasy-art",
    "isometric",
    "line-art",
    "low-poly",
    "modeling-compound",
    "neon-punk",
    "origami",
    "photographic",
    "pixel-art",
    "tile-texture",
  ],
};
const dimensionSelect = {
  title: "Dimension",
  name: "dimensions",
  values: [
    "1024x1024",
    "1152x896",
    "896x1152",
    "1216x832",
    "1344x768",
    "768x1344",
    "1536x640",
    "640x1536",
  ],
};
const clipPresetSelect = {
  title: "Clip preset",
  name: "clip_guidance_preset",
  values: [
    "NONE",
    "FAST_BLUE",
    "FAST_GREEN",
    "SIMPLE",
    "SLOW",
    "SLOWER",
    "SLOWEST",
  ],
};
const samplerSelect = {
  title: "Sampler",
  name: "sampler",
  values: [
    "NONE",
    "DDIM",
    "DDPM",
    "K_DPMPP_2M",
    "K_DPMPP_2S_ANCESTRAL",
    "K_DPM_2",
    "K_DPM_2_ANCESTRAL",
    "K_EULER",
    "K_EULER_ANCESTRAL",
    "K_HEUN",
    "K_LMS",
  ],
};

export const stabilityAiModels = [
  {
    name: "stable-image-ultra",
    config: { negative_prompt: "", seed: 0 },
    configSelects: [aspectRatioSelect, outputFormatSelect],
    url: "https://api.stability.ai/v2beta/stable-image/generate/ultra",
  },
  {
    name: "stable-image-core",
    config: { negative_prompt: "", seed: 0 },
    configSelects: [aspectRatioSelect, outputFormatSelect, stylePresetSelect],
    url: "https://api.stability.ai/v2beta/stable-image/generate/core",
  },
  {
    name: "stable-diffusion-3-large",
    config: { negative_prompt: "", seed: 0 },
    configSelects: [
      { title: "Model", name: "model", values: ["sd3-large"] },
      { title: "Mode", name: "mode", values: ["text-to-image"] },
      aspectRatioSelect,
      outputFormatSelect,
    ],
    url: "https://api.stability.ai/v2beta/stable-image/generate/sd3",
  },
  {
    name: "stable-diffusion-3-large-turbo",
    config: { negative_prompt: "", seed: 0 },
    configSelects: [
      { title: "Model", name: "model", values: ["sd3-large-turbo"] },
      { title: "Mode", name: "mode", values: ["text-to-image"] },
      aspectRatioSelect,
      outputFormatSelect,
    ],
    url: "https://api.stability.ai/v2beta/stable-image/generate/sd3",
  },
  {
    name: "stable-diffusion-3-medium",
    config: { negative_prompt: "", seed: 0 },
    configSelects: [
      { title: "Model", name: "model", values: ["sd3-medium"] },
      { title: "Mode", name: "mode", values: ["text-to-image"] },
      aspectRatioSelect,
      outputFormatSelect,
    ],
    url: "https://api.stability.ai/v2beta/stable-image/generate/sd3",
  },
  {
    name: "stable-diffusion-v1-6",
    config: { cfg_scale: 7, seed: 0, steps: 30 },
    configSelects: [
      {
        title: "Model",
        name: "engine_id",
        values: ["stable-diffusion-v1-6"],
      },
      dimensionSelect,
      clipPresetSelect,
      samplerSelect,
      stylePresetSelect,
    ],
    url: "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
  },
  {
    name: "stable-diffusion-xl-1024-v1-0",
    config: { cfg_scale: 7, seed: 0, steps: 30 },
    configSelects: [
      {
        title: "Model",
        name: "engine_id",
        values: ["stable-diffusion-xl-1024-v1-0"],
      },
      dimensionSelect,
      clipPresetSelect,
      samplerSelect,
      stylePresetSelect,
    ],
    url: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
  },
];
