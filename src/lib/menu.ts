import wrap from "@/assets/wrap.jpg.asset.json";
import platter from "@/assets/platter.jpg.asset.json";
import grill from "@/assets/grill.jpg.asset.json";
import chicken from "@/assets/chicken.jpg";
import grabs from "@/assets/grabs.jpg";

export const IMAGES = { wrap: wrap.url, platter: platter.url, grill: grill.url, chicken, grabs };

export type Category = "burgers" | "chicken" | "shawarma" | "grabs";
export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "chicken", label: "Chicken", emoji: "🍗" },
  { id: "shawarma", label: "Shawarma & Tacos", emoji: "🌯" },
  { id: "grabs", label: "Hot Smash Grabs", emoji: "🍟" },
];

export type MenuItem = { id: string; name: string; price: number; category: Category; image: string; tag?: string };

const I = IMAGES;
export const MENU: MenuItem[] = [
  { id: "chicken-smash-burger", name: "Chicken Smash Burger", price: 35, category: "burgers", image: I.grill },
  { id: "chicken-burger-chips", name: "Chicken Burger + Chips", price: 60, category: "burgers", image: I.platter },
  { id: "burger-chips-drink", name: "Burger + Chips & Drink", price: 75, category: "burgers", image: I.platter },
  { id: "beef-smash-burger", name: "Beef Smash Burger", price: 45, category: "burgers", image: I.grill, tag: "Bestseller" },
  { id: "beef-smash-burger-chips", name: "Beef Smash Burger + Chips", price: 75, category: "burgers", image: I.platter },
  { id: "sm-burger-chips-drink", name: "SM Burger + Chips & Drink", price: 85, category: "burgers", image: I.platter, tag: "Combo" },
  { id: "quarter-chicken-chips", name: "1/2 Chicken + Chips", price: 60, category: "chicken", image: I.chicken },
  { id: "half-chicken-chips", name: "Half Chicken + Chips", price: 90, category: "chicken", image: I.chicken, tag: "Bestseller" },
  { id: "full-chicken-large-chips", name: "Full Chicken + Large Chips", price: 160, category: "chicken", image: I.chicken, tag: "Family" },
  { id: "full-chicken-chips-rolls", name: "F Chicken & L Chips + 4 Rolls", price: 185, category: "chicken", image: I.chicken, tag: "Family" },
  { id: "shawarma-chicken-chips", name: "Chicken Shawarma + Chips", price: 60, category: "shawarma", image: I.wrap, tag: "Bestseller" },
  { id: "shawarma-chicken-chips-drink", name: "Chicken Shawarma + Chips & Drink", price: 75, category: "shawarma", image: I.wrap },
  { id: "shawarma-beef-chips", name: "Beef Shawarma + Chips", price: 75, category: "shawarma", image: I.wrap },
  { id: "shawarma-beef-chips-drink", name: "Beef Shawarma + Chips & Drink", price: 85, category: "shawarma", image: I.wrap },
  { id: "hot-dog-chicken", name: "Hot Dog Chicken", price: 25, category: "grabs", image: I.grabs },
  { id: "hot-bun-beef", name: "Hot Bun Beef", price: 30, category: "grabs", image: I.grabs },
  { id: "small-chips", name: "Small Chips", price: 20, category: "grabs", image: I.grabs },
  { id: "large-chips", name: "Large Chips", price: 30, category: "grabs", image: I.grabs },
  { id: "meat-fries-small", name: "Meat Fries Small", price: 30, category: "grabs", image: I.grabs },
  { id: "meat-fries-large", name: "Meat Fries Large", price: 50, category: "grabs", image: I.grabs, tag: "Must try" },
  { id: "cold-drink-small", name: "Cold Drink Small", price: 15, category: "grabs", image: I.grabs },
  { id: "cold-drink-large", name: "Cold Drink Large", price: 20, category: "grabs", image: I.grabs },
];

export const byId = (id: string) => MENU.find((m) => m.id === id);
