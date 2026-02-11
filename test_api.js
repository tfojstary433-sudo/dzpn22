
async function test() {
  const r = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/stats');
  const d = await r.json();
  const list = Array.isArray(d) ? d : (d.players || []);
  console.log(JSON.stringify(list.slice(0, 1), null, 2));
}
test();
