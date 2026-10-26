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

- Cart and last order live in browser localStorage (src/lib/cart.tsx); orders go out via a wa.me link, no backend — keeps the store zero-setup.
- Menu data and prices live only in src/lib/menu.ts; order formatting in src/lib/order.ts (tested).
