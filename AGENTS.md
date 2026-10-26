<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cart and last receipt live in browser localStorage (src/lib/cart.tsx); placed orders are saved to the orders table (a DB trigger re-prices items and decrements stock) then sent via a wa.me link — prices can't be tampered with client-side.
- Products live in the products table; src/lib/menu.ts MENU is only the placeholder shown before they load. Images are keys mapped by imageFor().
- Owner = admin role in user_roles; the first signed-in user to call claim_owner() becomes owner, after that nobody can claim.
- Order formatting and recommendations in src/lib/order.ts (tested).
- Prototype credentials open public /demo/* sample-only views; never grant backend admin privileges from demo credentials or browser storage. Existing protected routes and database authorization stay unchanged.
- Demo sessions use sessionStorage and sample orders/products stay in browser memory; all demo queries and mutations must avoid real private data and WhatsApp order sending.
