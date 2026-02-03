const fetch = global.fetch;

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const REVIEW_COUNT = 25;

const headers = {
  "Authorization": `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json"
};

async function run() {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: {
          property: "Status",
          select: { equals: "Done" }
        }
      })
    }
  );

  const data = await res.json();

// DEBUG: log response nếu có vấn đề
if (!data.results) {
  console.error("❌ Notion API response error:");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const items = data.results;

if (items.length === 0) {
  console.log("⚠️ No DONE items found");
  return;
}


  const shuffled = items.sort(() => 0.5 - Math.random());
  const picked = shuffled.slice(0, REVIEW_COUNT);

  for (const item of picked) {
    await fetch(`https://api.notion.com/v1/pages/${item.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        properties: {
          Review: { checkbox: true }
        }
      })
    });
  }

  console.log(`✅ Picked ${picked.length} random items`);
}

run();
