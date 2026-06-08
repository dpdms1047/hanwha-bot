export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userText, faqList } = req.body;
  const prompt = `사내 챗봇 FAQ 목록:\n${faqList}\n\n사용자 질문: "${userText}"\n\n가장 관련 있는 FAQ 번호를 JSON으로만 반환하세요. 없으면 null.\n형식: {"index": 숫자} 또는 {"index": null}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 50,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    const raw = (data.content?.[0]?.text || '{"index":null}').replace(/```json|```/g,'').trim();
    res.status(200).json(JSON.parse(raw));
  } catch(e) {
    res.status(500).json({ index: null });
  }
}
