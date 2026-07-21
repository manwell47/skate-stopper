export const playSkidSound = () => {
  const audio = new Audio('/skid.wav');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};
