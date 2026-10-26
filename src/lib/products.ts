import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MENU, imageFor, type MenuItem } from "./menu";

export const productsKey = ["products"];

export async function fetchProducts(): Promise<MenuItem[]> {
  const { data, error } = await supabase.from("products").select("*").order("sort");
  if (error) throw error;
  return data.map((p) => ({
    id: p.id, name: p.name, price: Number(p.price), category: p.category, imageKey: p.image,
    image: imageFor(p.image), tag: p.tag, inStock: p.in_stock, stock: p.stock,
  }));
}

export function useProducts() {
  const q = useQuery({ queryKey: productsKey, queryFn: fetchProducts, placeholderData: MENU });
  const list = q.data ?? MENU;
  return { products: list, byId: (id: string) => list.find((p) => p.id === id), query: q };
}
