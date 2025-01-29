import Redis from 'ioredis';

const sourceRedis = new Redis({
  host: 'localhost',
  port: 6379
});

const targetRedis = new Redis({
  host: 'localhost',
  port: 6310
});

async function cloneData() {
  console.log('Starting Redis data clone...');
  
  // Get all keys from source
  let cursor = '0';
  do {
    const [newCursor, keys] = await sourceRedis.scan(cursor, 'MATCH', '*');
    cursor = newCursor;
    
    for (const key of keys) {
      const type = await sourceRedis.type(key);
      const ttl = await sourceRedis.ttl(key);
      
      switch(type) {
        case 'string': {
          const value = await sourceRedis.get(key);
          await targetRedis.set(key, value);
          break;
        }
        case 'hash': {
          const value = await sourceRedis.hgetall(key);
          await targetRedis.hmset(key, value);
          break;
        }
        case 'set': {
          const members = await sourceRedis.smembers(key);
          if (members.length > 0) {
            await targetRedis.sadd(key, members);
          }
          break;
        }
        case 'zset': {
          const members = await sourceRedis.zrange(key, 0, -1, 'WITHSCORES');
          if (members.length > 0) {
            const args = [];
            for (let i = 0; i < members.length; i += 2) {
              args.push(members[i + 1], members[i]);
            }
            await targetRedis.zadd(key, ...args);
          }
          break;
        }
        case 'list': {
          const values = await sourceRedis.lrange(key, 0, -1);
          if (values.length > 0) {
            await targetRedis.rpush(key, values);
          }
          break;
        }
      }
      
      // Set TTL if it exists
      if (ttl > 0) {
        await targetRedis.expire(key, ttl);
      }
    }
  } while (cursor !== '0');

  console.log('Redis data clone completed');
  process.exit(0);
}

cloneData().catch(err => {
  console.error('Error cloning Redis data:', err);
  process.exit(1);
});
