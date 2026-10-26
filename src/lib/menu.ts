import wrap from "@/assets/wrap.jpg.asset.json";
import platter from "@/assets/platter.jpg.asset.json";
import grill from "@/assets/grill.jpg.asset.json";
import chicken from "@/assets/chicken.jpg";
import grabs from "@/assets/grabs.jpg";

export const IMAGES = { wrap: wrap.url, platter: platter.url, grill: grill.url, chicken, grabs };
export const IMAGE_KEYS = Object.keys(IMAGES);
/** Products store an image key (wrap, grill…) or a full URL. */
export const imageFor = (key: string) => (IMAGES as Record<string, string>)[key] ?? key;

export type Category = "burgers" | "chicken" | "shawarma" | "grabs";
export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "chicken", label: "Chicken", emoji: "🍗" },
  { id: "shawarma", label: "Shawarma & Tacos", emoji: "🌯" },
  { id: "grabs", label: "Hot Smash Grabs", emoji: "🍟" },
];

export type MenuItem = {
  id: string; name: string; price: number; category: string; image: string;
  imageKey: string; tag?: string | null; inStock: boolean; stock: number | null;
};

type Raw = [id: string, name: string, price: number, category: Category, image: string, tag?: string];
const RAW: Raw[] = [
  ["chicken-smash-burger", "Chicken Smash Burger", 35, "burgers", "grill"],
  ["chicken-burger-chips", "Chicken Burger + Chips", 60, "burgers", "platter"],
  ["burger-chips-drink", "Burger + Chips & Drink", 75, "burgers", "platter"],
  ["beef-smash-burger", "Beef Smash Burger", 45, "burgers", "grill", "Bestseller"],
  ["beef-smash-burger-chips", "Beef Smash Burger + Chips", 75, "burgers", "platter"],
  ["sm-burger-chips-drink", "SM Burger + Chips & Drink", 85, "burgers", "platter", "Combo"],
  ["quarter-chicken-chips", "1/2 Chicken + Chips", 60, "chicken", "chicken"],
  ["half-chicken-chips", "Half Chicken + Chips", 90, "chicken", "chicken", "Bestseller"],
  ["full-chicken-large-chips", "Full Chicken + Large Chips", 160, "chicken", "chicken", "Family"],
  ["full-chicken-chips-rolls", "F Chicken & L Chips + 4 Rolls", 185, "chicken", "chicken", "Family"],
  ["shawarma-chicken-chips", "Chicken Shawarma + Chips", 60, "shawarma", "wrap", "Bestseller"],
  ["shawarma-chicken-chips-drink", "Chicken Shawarma + Chips & Drink", 75, "shawarma", "wrap"],
  ["shawarma-beef-chips", "Beef Shawarma + Chips", 75, "shawarma", "wrap"],
  ["shawarma-beef-chips-drink", "Beef Shawarma + Chips & Drink", 85, "shawarma", "wrap"],
  ["hot-dog-chicken", "Hot Dog Chicken", 25, "grabs", "grabs"],
  ["hot-bun-beef", "Hot Bun Beef", 30, "grabs", "grabs"],
  ["small-chips", "Small Chips", 20, "grabs", "grabs"],
  ["large-chips", "Large Chips", 30, "grabs", "grabs"],
  ["meat-fries-small", "Meat Fries Small", 30, "grabs", "grabs"],
  ["meat-fries-large", "Meat Fries Large", 50, "grabs", "grabs", "Must try"],
  ["cold-drink-small", "Cold Drink Small", 15, "grabs", "grabs"],
  ["cold-drink-large", "Cold Drink Large", 20, "grabs", "grabs"],
];

/** Fallback shown before live products load (the live list comes from the database). */
export const MENU: MenuItem[] = RAW.map(([id, name, price, category, img, tag]) => ({
  id, name, price, category, imageKey: img, image: imageFor(img), tag: tag ?? null, inStock: true, stock: null,
}));
