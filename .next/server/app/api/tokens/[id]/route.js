"use strict";(()=>{var t={};t.id=636,t.ids=[636],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4629:t=>{t.exports=import("@libsql/client")},7392:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.r(e),a.d(e,{originalPathname:()=>N,patchFetch:()=>l,requestAsyncStorage:()=>d,routeModule:()=>c,serverHooks:()=>u,staticGenerationAsyncStorage:()=>E});var r=a(3278),o=a(5002),i=a(4877),s=a(1090),T=t([s]);s=(T.then?(await T)():T)[0];let c=new r.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/tokens/[id]/route",pathname:"/api/tokens/[id]",filename:"route",bundlePath:"app/api/tokens/[id]/route"},resolvedPagePath:"/root/frani-coin/src/app/api/tokens/[id]/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:E,serverHooks:u}=c,N="/api/tokens/[id]/route";function l(){return(0,i.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:E})}n()}catch(t){n(t)}})},1090:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.r(e),a.d(e,{GET:()=>s,POST:()=>T});var r=a(1309),o=a(3006),i=t([o]);async function s(t,{params:e}){try{await (0,o.xD)();let t=await (0,o.LP)(e.id);if(!t)return r.NextResponse.json({error:"Token not found"},{status:404});let[a,n]=await Promise.all([(0,o.ld)(e.id),(0,o.f1)(e.id)]);return r.NextResponse.json({token:t,balances:a,transactions:n})}catch(t){return r.NextResponse.json({error:t instanceof Error?t.message:"Could not load token"},{status:500})}}async function T(t,{params:e}){let a;try{a=await t.json()}catch{return r.NextResponse.json({error:"Invalid JSON"},{status:400})}try{if(await (0,o.xD)(),"mint"===a.action){if(!a.to||!a.amount||!a.by)return r.NextResponse.json({error:"to, amount, by required"},{status:400});return await (0,o.tM)(e.id,a.to,a.amount,a.by),r.NextResponse.json({ok:!0})}if("transfer"===a.action){if(!a.from||!a.to||!a.amount)return r.NextResponse.json({error:"from, to, amount required"},{status:400});return await (0,o.Yr)(e.id,a.from,a.to,a.amount),r.NextResponse.json({ok:!0})}return r.NextResponse.json({error:"Unknown action"},{status:400})}catch(t){return r.NextResponse.json({error:t instanceof Error?t.message:"Could not perform action"},{status:400})}}o=(i.then?(await i)():i)[0],n()}catch(t){n(t)}})},3006:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.d(e,{BP:()=>p,D4:()=>d,LP:()=>E,V3:()=>c,Yr:()=>L,f1:()=>N,ld:()=>u,s2:()=>w,t5:()=>_,tM:()=>S,xD:()=>s});var r=a(4629),o=t([r]);function i(){let t=process.env.TURSO_DATABASE_URL,e=process.env.TURSO_AUTH_TOKEN;if(!t||!e)throw Error("Turso is not configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN)");return(0,r.createClient)({url:t,authToken:e})}async function s(){let t=i();await t.execute(`
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
  `),await t.close()}function T(t){return{id:String(t.id),name:String(t.name),symbol:String(t.symbol),decimals:Number(t.decimals),owner:String(t.owner),totalSupply:String(t.total_supply),description:String(t.description??""),website:String(t.website??""),twitter:String(t.twitter??""),telegram:String(t.telegram??""),taxBuy:Number(t.tax_buy??0),taxSell:Number(t.tax_sell??0),mintable:1===Number(t.mintable??1),burnable:1===Number(t.burnable??1),createdAt:String(t.created_at)}}function l(t){return{id:String(t.id),tokenId:String(t.token_id),creator:String(t.creator),price:String(t.price),totalAllocation:String(t.total_allocation),sold:String(t.sold),minBuy:String(t.min_buy),maxBuy:String(t.max_buy),startAt:String(t.start_at),endAt:String(t.end_at),status:String(t.status),createdAt:String(t.created_at)}}async function c(t){let e=i();await e.execute({sql:`INSERT INTO coin_tokens
      (id, name, symbol, decimals, owner, total_supply, description, website, twitter, telegram, tax_buy, tax_sell, mintable, burnable, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,args:[t.id,t.name,t.symbol,t.decimals,t.owner,t.totalSupply,t.description,t.website,t.twitter,t.telegram,t.taxBuy,t.taxSell,t.mintable?1:0,t.burnable?1:0,new Date().toISOString()]}),await e.execute({sql:"INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)",args:[t.id,t.owner,t.totalSupply]}),await e.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t.id,null,t.owner,t.totalSupply,new Date().toISOString()]}),await e.close()}async function d(){let t=i(),e=await t.execute("SELECT * FROM coin_tokens ORDER BY created_at DESC");return await t.close(),e.rows.map(t=>T(t))}async function E(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_tokens WHERE id = ?",args:[t]});await e.close();let n=a.rows[0];return n?T(n):null}async function u(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_balances WHERE token_id = ? AND CAST(balance AS INTEGER) > 0 ORDER BY CAST(balance AS INTEGER) DESC",args:[t]});return await e.close(),a.rows.map(t=>({tokenId:String(t.token_id),address:String(t.address),balance:String(t.balance)}))}async function N(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_transactions WHERE token_id = ? ORDER BY at DESC LIMIT 100",args:[t]});return await e.close(),a.rows.map(t=>({id:String(t.id),tokenId:String(t.token_id),type:String(t.type),from:t.from_addr?String(t.from_addr):null,to:t.to_addr?String(t.to_addr):null,amount:String(t.amount),at:String(t.at)}))}async function S(t,e,a,n){let r=i(),o=await E(t);if(!o)throw Error("Token not found");if(o.owner!==n)throw Error("Only the owner can mint");if(!o.mintable)throw Error("Minting is disabled for this token");await r.execute({sql:"UPDATE coin_tokens SET total_supply = CAST(total_supply AS INTEGER) + ? WHERE id = ?",args:[a,t]}),await r.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[t,e,a,a]}),await r.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,null,e,a,new Date().toISOString()]}),await r.close()}async function L(t,e,a,n){let r=i();if(!await E(t))throw Error("Token not found");let o=await r.execute({sql:"SELECT balance FROM coin_balances WHERE token_id = ? AND address = ?",args:[t,e]});if(BigInt(String(o.rows[0]?.balance??"0"))<BigInt(n))throw Error("Insufficient balance");await r.execute({sql:"UPDATE coin_balances SET balance = CAST(balance AS INTEGER) - ? WHERE token_id = ? AND address = ?",args:[n,t,e]}),await r.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[t,a,n,n]}),await r.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'transfer', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,e,a,n,new Date().toISOString()]}),await r.close()}async function _(t){let e=i(),a=await E(t.tokenId);if(!a)throw Error("Token not found");if(a.owner!==t.creator)throw Error("Only the owner can create a presale");await e.execute({sql:`INSERT INTO coin_presales (id, token_id, creator, price, total_allocation, sold, min_buy, max_buy, start_at, end_at, status, created_at)
      VALUES (?, ?, ?, ?, ?, '0', ?, ?, ?, ?, 'upcoming', ?)`,args:[t.id,t.tokenId,t.creator,t.price,t.totalAllocation,t.minBuy,t.maxBuy,t.startAt,t.endAt,new Date().toISOString()]}),await e.close()}async function w(){let t=i(),e=await t.execute("SELECT * FROM coin_presales ORDER BY created_at DESC");return await t.close(),e.rows.map(t=>l(t))}async function m(t){let e=i(),a=await e.execute({sql:"SELECT * FROM coin_presales WHERE id = ?",args:[t]});await e.close();let n=a.rows[0];return n?l(n):null}async function p(t,e,a){let n=i(),r=await m(t);if(!r)throw Error("Presale not found");let o=Date.now();if(o<new Date(r.startAt).getTime())throw Error("Presale hasn't started");if(o>new Date(r.endAt).getTime())throw Error("Presale has ended");if("upcoming"!==r.status&&"live"!==r.status)throw Error("Presale is not live");let s=BigInt(r.sold),T=BigInt(r.totalAllocation),l=BigInt(a);if(s+l>T)throw Error("Allocation exceeded");let c=l*BigInt(r.price)/10n**18n;await n.execute({sql:"UPDATE coin_presales SET sold = CAST(sold AS INTEGER) + ? WHERE id = ?",args:[a,t]}),await n.execute({sql:`INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,args:[r.tokenId,e,a,a]}),await n.execute({sql:"INSERT INTO coin_presale_purchases (id, presale_id, buyer, amount, cost, at) VALUES (?, ?, ?, ?, ?, ?)",args:[`buy_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,t,e,a,c.toString(),new Date().toISOString()]}),await n.execute({sql:"INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'presale', ?, ?, ?, ?)",args:[`tx_${Date.now().toString(36)}_${Math.floor(1e9*Math.random()).toString(36)}`,r.tokenId,null,e,a,new Date().toISOString()]}),await n.close()}r=(o.then?(await o)():o)[0],n()}catch(t){n(t)}})}};var e=require("../../../../webpack-runtime.js");e.C(t);var a=t=>e(e.s=t),n=e.X(0,[787,833],()=>a(7392));module.exports=n})();