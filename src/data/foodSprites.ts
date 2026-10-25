import { SlimeFoodType } from '@/types/slime';

// 16x16 pixel sprites in public/. The emoji icons on SLIME_FOODS are still used by the farm.
export const FOOD_SPRITES: Record<SlimeFoodType, string> = {
  basic: 'food_basic.png',
  elemental: 'food_elemental.png',
  royal: 'food_royal.png',
};

export const foodSpriteUrl = (food: SlimeFoodType) => `${import.meta.env.BASE_URL}${FOOD_SPRITES[food]}`;
