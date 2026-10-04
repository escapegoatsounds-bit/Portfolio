/* Likes and comments for the phone's feed posts.

   Runs as a Vercel function. Storage is Upstash Redis through its REST API, so
   there's nothing to install: connect an Upstash Redis database to the Vercel
   project (Storage tab) and it sets KV_REST_API_URL and KV_REST_API_TOKEN.
   Without them every call answers 503 and the page keeps likes and comments in
   the visitor's own browser instead.

   GET    /api/feed?ids=a,b,c            -> { a: {likes, comments:[{n,t,at}], total}, ... }
   POST   /api/feed  {id, action:"like"|"unlike"}
   POST   /api/feed  {id, action:"comment", name, text}
   DELETE /api/feed  {id, at}  header x-admin-key: FEED_ADMIN_KEY   (remove one comment)
*/

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ID = /^[A-Za-z0-9_\-:.]{1,140}$/;
const KEEP = 200;          // comments kept per post
const SHOW = 50;           // comments sent per post
const PER_MINUTE = 30;     // actions per visitor per minute

async function redis(cmds) {
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error('storage ' + r.status);
  return (await r.json()).map(x => x.result);
}

const clean = (s, max) => String(s == null ? '' : s)
  .replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (_) { return {}; }
}

async function tooMany(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
  const key = 'feed:rate:' + ip + ':' + Math.floor(Date.now() / 60000);
  const [n] = await redis([['INCR', key], ['EXPIRE', key, 120]]);
  return n > PER_MINUTE;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'storage not set up' });
  try {
    if (req.method === 'GET') {
      const ids = String(req.query.ids || '').split(',').filter(i => ID.test(i)).slice(0, 60);
      if (!ids.length) return res.status(200).json({});
      const cmds = [];
      ids.forEach(id => {
        cmds.push(['GET', 'feed:likes:' + id], ['LRANGE', 'feed:comments:' + id, 0, SHOW - 1], ['LLEN', 'feed:comments:' + id]);
      });
      const out = await redis(cmds), data = {};
      ids.forEach((id, i) => {
        const comments = (out[i * 3 + 1] || []).map(s => { try { return JSON.parse(s); } catch (_) { return null; } }).filter(Boolean).reverse();
        data[id] = { likes: Math.max(0, parseInt(out[i * 3], 10) || 0), comments, total: out[i * 3 + 2] || 0 };
      });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = body(req);
      if (!ID.test(b.id || '')) return res.status(400).json({ error: 'bad id' });
      if (await tooMany(req)) return res.status(429).json({ error: 'slow down' });
      const likes = 'feed:likes:' + b.id;
      if (b.action === 'like') {
        const [n] = await redis([['INCR', likes]]);
        return res.status(200).json({ likes: n });
      }
      if (b.action === 'unlike') {
        let [n] = await redis([['DECR', likes]]);
        if (n < 0) { await redis([['SET', likes, 0]]); n = 0; }
        return res.status(200).json({ likes: n });
      }
      if (b.action === 'comment') {
        const t = clean(b.text, 300), n = clean(b.name, 40) || 'Guest';
        if (t.length < 1) return res.status(400).json({ error: 'empty comment' });
        const c = { n, t, at: Date.now() };
        const key = 'feed:comments:' + b.id;
        const [total] = await redis([['LPUSH', key, JSON.stringify(c)], ['LTRIM', key, 0, KEEP - 1]]);
        return res.status(200).json({ comment: c, total: Math.min(total, KEEP) });
      }
      return res.status(400).json({ error: 'bad action' });
    }

    if (req.method === 'DELETE') {
      const admin = process.env.FEED_ADMIN_KEY;
      if (!admin || req.headers['x-admin-key'] !== admin) return res.status(403).json({ error: 'not allowed' });
      const b = body(req);
      if (!ID.test(b.id || '')) return res.status(400).json({ error: 'bad id' });
      const key = 'feed:comments:' + b.id;
      const [all] = await redis([['LRANGE', key, 0, -1]]);
      const hit = (all || []).find(s => { try { return JSON.parse(s).at === Number(b.at); } catch (_) { return false; } });
      if (hit) await redis([['LREM', key, 1, hit]]);
      return res.status(200).json({ removed: !!hit });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(502).json({ error: 'storage error' });
  }
};
