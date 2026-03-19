import { DEMO_CROPS } from "./demo-data";

export let MOCK_CROPS = [...DEMO_CROPS];
export let nextCropId = MOCK_CROPS.length > 0 ? Math.max(...MOCK_CROPS.map(c => c.id)) + 1 : 1;

const fakeDelay = () => new Promise(resolve => setTimeout(resolve, 400));

export const apiFetchCrops = async () => {
  await fakeDelay();
  return [...MOCK_CROPS];
};

export const apiCreateCrop = async (data: any) => {
  await fakeDelay();
  const newCrop = { ...data, id: nextCropId++ };
  MOCK_CROPS.push(newCrop);
  return newCrop;
};

export const apiUpdateCrop = async ({ id, data }: { id: number; data: any }) => {
  await fakeDelay();
  const index = MOCK_CROPS.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Cultura não encontrada");
  MOCK_CROPS[index] = { ...MOCK_CROPS[index], ...data };
  return MOCK_CROPS[index];
};

export const apiDeleteCrop = async (id: number) => {
  await fakeDelay();
  MOCK_CROPS = MOCK_CROPS.filter(c => c.id !== id);
  return true;
};
