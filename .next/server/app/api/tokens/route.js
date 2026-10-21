"use strict";(()=>{var t={};t.id=277,t.ids=[277],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4629:t=>{t.exports=import("@libsql/client")},9728:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.r(e),a.d(e,{originalPathname:()=>S,patchFetch:()=>T,requestAsyncStorage:()=>E,routeModule:()=>c,serverHooks:()=>u,staticGenerationAsyncStorage:()=>d});var r=a(3278),o=a(5002),i=a(4877),s=a(9169),l=t([s]);s=(l.then?(await l)():l)[0];let c=new r.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/tokens/route",pathname:"/api/tokens",filename:"route",bundlePath:"app/api/tokens/route"},resolvedPagePath:"/root/frani-coin/src/app/api/tokens/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:E,staticGenerationAsyncStorage:d,serverHooks:u}=c,S="/api/tokens/route";function T(){return(0,i.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:d})}n()}catch(t){n(t)}})},9169:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.r(e),a.d(e,{GET:()=>s,POST:()=>l});var r=a(1309),o=a(3006),i=t([o]);async function s(){try{await (0,o.xD)();let t=await (0,o.D4)();return r.NextResponse.json({tokens:t})}catch(t){return r.NextResponse.json({error:t instanceof Error?t.message:"Could not load tokens"},{status:500})}}async function l(t){let e;try{e=await t.json()}catch{return r.NextResponse.json({error:"Invalid JSON"},{status:400})}if(!e.id||!e.name||!e.symbol||!e.owner)return r.NextResponse.json({error:"Missing required fields"},{status:400});let a=Number(e.decimals??18);if(!Number.isInteger(a)||a<0||a>36)return r.NextResponse.json({error:"Decimals must be 0–36"},{status:400});try{return await (0,o.xD)(),await (0,o.V3)({id:e.id,name:e.name,symbol:e.symbol.toUpperCase(),decimals:a,owner:e.owner,totalSupply:e.totalSupply??"0",description:e.description??"",website:e.website??"",twitter:e.twitter??"",telegram:e.telegram??"",taxBuy:Number(e.taxBuy??0),taxSell:Number(e.taxSell??0),mintable:!1!==e.mintable,burnable:!1!==e.burnable}),r.NextResponse.json({ok:!0},{status:201})}catch(t){return r.NextResponse.json({error:t instanceof Error?t.message:"Could not create token"},{status:400})}}o=(i.then?(await i)():i)[0],n()}catch(t){n(t)}})},3006:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.d(e,{BP:()=>p,D4:()=>E,LP:()=>d,V3:()=>c,Yr:()=>_,f1:()=>S,ld:()=>u,s2:()=>w,t5:()=>L,tM:()=>N,xD:()=>s});var r=a(4629),o=t([r]);function i(){let t=process.env.TURSO_DATABASE_URL,e=process.env.TURSO_AUTH_TOKEN;if(!t||!e)throw Error("Turso is not configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN)");return(0,r.createClient)({url:t,authToken:e})}async function s(){let t=i();await t.execute(`
    CREATE TABLE IF NOT EXISTS coin_tokens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      decimals INTEGER NOT NULL DEFAULT 18,
      owner TEXT NOT NULL,
      total_supply TEXT NOT NULL DEFAULT '0',
      description TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      twitter TEXT NOT NULL DEFAULT '',
      telegram TEXT NOT NULL DEFAULT '',
      tax_buy INTEGER NOT NULL DEFAULT 0,
      tax_sell INTEGER NOT NULL DEFAULT 0,
      mintable INTEGER NOT NULL DEFAULT 1,
      burnable INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `),await t.execute(`
    CREATE TABLE IF NOT EXISTS coin_balances (
      token_id TEXT NOT NULL,
      address TEXT NOT NULL,
      balance TEXT NOT NULL DEFAULT '0',
      PRIMARY KEY (token_id, address)
    )
  `),await t.execute(`
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      type TEXT NOT NULL,
      from_addr TEXT,
      to_addr TEXT,
      amount TEXT NOT NULL,
      at TEXT NOT NULL
    )
  `),await t.execute(`
    CREATE TABLE IF NOT EXISTS coin_presales (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      creator TEXT NOT NULL,
      price TEXT NOT NULL,
      total_allocation TEXT NOT NULL,
      sold TEXT NOT NULL DEFAULT '0',
      min_buy TEXT NOT NULL DEFAULT '0',
      max_buy TEXT NOT NULL DEFAULT '0',
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TEXT NOT NULL
    )
  `),await t.execute(`
    CREATE TABLE IF NOT EXISTS coin_presale_purchases (
      id TEXT PRIMARY KEY,
      presale_id TEXT NOT NULL,
      buyer TEXT NOT NULL,
      amount TEXT NOT NULL,
      cost TEXT NOT NULL,
      at TEXT NOT NULL
    )
  `),await t.close()}function l(t){return{id:String(t.id),name:String(t.name),symbol:String(t.symbol),decimals:Number(t.decimals),owner:String(t.owner),totalSupply:String(t.total_supply),description:String(t.description??""),website:String(t.website??""),twitter:String(t.twitter??""),telegram:String(t.telegram??""),taxBuy:Number(t.tax_buy??0),taxSell:Number(t.tax_sell??0),mintable:1===Number(t.mintable??1),burnable:1===Number(t.burnable??1),createdAt:String(t.created_at)}}function T(t){return{id:String(t.id),tokenId:String(t.token_id),creator:String(t.creator),price:String(t.price),totalAllocation:String(t.total_allocation),sold:String(t.sold),minBuy:String(t.min_buy),maxBuy:String(t.max_buy),startAt:String(t.start_at),endAt:String(t.end_at),status:String(t.status),createdAt:String(t.created_at)}}async function c(t){let e=i();await e.execute({sql:`INSERT INTO coin_tokens
      (id, name, symbol, decimals, owner, total_supply, description, website, twitter, telegram, tax_buy, tax_sell, mintable, burnable, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,args:[t.id,t.name,t.symbol,t.decimals,t.owner,t.totalSupply,t.description,t.website,t.twitter,t.telegram,t.taxBuy,t.taxSell,t.mintable?1:0,t.burnable?1:0,new Date().toISOString()]}),await e.execute({sql:"INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)",args:[t.id,t.owner,t.totalSupply]}),await e.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t.id,null,t.owner,t.totalSupply,new Date().toISOString()]}),await e.close()}async function E(){let t=i(),e=await t.execute("SELECT * FROM coin_tokens ORDER BY created_at DESC");return await t.close(),e.rows.map(t=>l(t))}async function d(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_tokens WHERE id = ?",args:[t]});await e.close();let n=a.rows[0];return n?l(n):null}async function u(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_balances WHERE token_id = ? AND CAST(balance AS INTEGER) > 0 ORDER BY CAST(balance AS INTEGER) DESC",args:[t]});return await e.close(),a.rows.map(t=>({tokenId:String(t.token_id),address:String(t.address),balance:String(t.balance)}))}async function S(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_transactions WHERE token_id = ? ORDER BY at DESC LIMIT 100",args:[t]});return await e.close(),a.rows.map(t=>({id:String(t.id),tokenId:String(t.token_id),type:String(t.type),from:t.from_addr?String(t.from_addr):null,to:t.to_addr?String(t.to_addr):null,amount:String(t.amount),at:String(t.at)}))}async function N(t,e,a,n){let r=i(),o=await d(t);if(!o)throw Error("Token not found");if(o.owner!==n)throw Error("Only the owner can mint");if(!o.mintable)throw Error("Minting is disabled for this token");await r.execute({sql:"UPDATE coin_tokens SET total_supply = CAST(total_supply AS INTEGER) + ? WHERE id = ?",args:[a,t]}),await r.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[t,e,a,a]}),await r.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,null,e,a,new Date().toISOString()]}),await r.close()}async function _(t,e,a,n){let r=i();if(!await d(t))throw Error("Token not found");let o=await r.execute({sql:"SELECT balance FROM coin_balances WHERE token_id = ? AND address = ?",args:[t,e]});if(BigInt(String(o.rows[0]?.balance??"0"))<BigInt(n))throw Error("Insufficient balance");await r.execute({sql:"UPDATE coin_balances SET balance = CAST(balance AS INTEGER) - ? WHERE token_id = ? AND address = ?",args:[n,t,e]}),await r.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[t,a,n,n]}),await r.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'transfer', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,e,a,n,new Date().toISOString()]}),await r.close()}async function L(t){let e=i(),a=await d(t.tokenId);if(!a)throw Error("Token not found");if(a.owner!==t.creator)throw Error("Only the owner can create a presale");await e.execute({sql:`INSERT INTO coin_presales (id, token_id, creator, price, total_allocation, sold, min_buy, max_buy, start_at, end_at, status, created_at)
      VALUES (?, ?, ?, ?, ?, '0', ?, ?, ?, ?, 'upcoming', ?)`,args:[t.id,t.tokenId,t.creator,t.price,t.totalAllocation,t.minBuy,t.maxBuy,t.startAt,t.endAt,new Date().toISOString()]}),await e.close()}async function w(){let t=i(),e=await t.execute("SELECT * FROM coin_presales ORDER BY created_at DESC");return await t.close(),e.rows.map(t=>T(t))}async function m(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_presales WHERE id = ?",args:[t]});await e.close();let n=a.rows[0];return n?T(n):null}async function p(t,e,a){let n=i(),r=await m(t);if(!r)throw Error("Presale not found");let o=Date.now();if(o<new Date(r.startAt).getTime())throw Error("Presale hasn't started");if(o>new Date(r.endAt).getTime())throw Error("Presale has ended");if("upcoming"!==r.status&&"live"!==r.status)throw Error("Presale is not live");let s=BigInt(r.sold),l=BigInt(r.totalAllocation),T=BigInt(a);if(s+T>l)throw Error("Allocation exceeded");let c=T*BigInt(r.price)/10n**18n;await n.execute({sql:"UPDATE coin_presales SET sold = CAST(sold AS INTEGER) + ? WHERE id = ?",args:[a,t]}),await n.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[r.tokenId,e,a,a]}),await n.execute({sql:"INSERT INTO coin_presale_purchases (id, presale_id, buyer, amount, cost, at) VALUES (?, ?, ?, ?, ?, ?)",args:[`buy_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,e,a,c.toString(),new Date().toISOString()]}),await n.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'presale', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,r.tokenId,null,e,a,new Date().toISOString()]}),await n.close()}r=(o.then?(await o)():o)[0],n()}catch(t){n(t)}})}};var e=require("../../../webpack-runtime.js");e.C(t);var a=t=>e(e.s=t),n=e.X(0,[787,833],()=>a(9728));module.exports=n})();