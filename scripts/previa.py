import asyncio
from playwright.async_api import async_playwright
OUT="previas/full_"
B="http://localhost:4329"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        for tk in ["vale3","petr4","bbas3","bbdc4","prio3","axia3","itub4"]:
            pg=await b.new_page(viewport={"width":1280,"height":900})
            pg.on("pageerror", lambda e: errs.append(str(e)))
            r=await pg.goto(f"{B}/analises/{tk}-2026-10-26/", wait_until="networkidle")
            await pg.screenshot(path=OUT+tk+".png", full_page=True)
            secs=await pg.eval_on_selector_all(".eyebrow","els=>els.map(e=>e.textContent.trim())")
            print(tk, r.status, len(secs), secs[-1] if secs else '', "| w", await pg.evaluate("document.documentElement.scrollWidth"))
            m=await b.new_page(viewport={"width":390,"height":900})
            await m.goto(f"{B}/analises/{tk}-2026-10-26/", wait_until="networkidle")
            print("  mobile w", await m.evaluate("document.documentElement.scrollWidth"))
        print("ERRS",errs); await b.close()
asyncio.run(main())
