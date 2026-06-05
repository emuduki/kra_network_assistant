const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const KRA_SYSTEM_CONTEXT = `You are an expert network and VPN security engineer for the Kenya Revenue Authority (KRA).
KRA operates critical systems including iTax (tax filing), iCMS (customs), staff email, and payroll — all accessed via IPSec/IKEv2 VPN tunnels.

Common issues you diagnose:
- VPN tunnel failures (DPD timeouts, IKE negotiation failures)
- DNS SERVFAIL errors blocking access to KRA portals
- SSL/TLS certificate expiry warnings
- Firewall rules blocking IKE (UDP/500) or ESP traffic
- MTU mismatches causing fragmentation on IPSec tunnels
- Dead Peer Detection (DPD) failures

When responding:
- Be concise and technical
- Give numbered step-by-step commands when suggesting fixes
- Reference specific config files (/etc/ipsec.conf, /etc/strongswan.conf)
- Reference diagnostic tools: ipsec statusall, ipsec restart, dig, tcpdump, ping, traceroute`;

// Log Analyzer
// Send raw log text to Claude and ask for a diagnosis and recommended commands to fix the issue.
async function analyzeLog(logText, traceroute = '') {
    const prompt = [
      'Analyze this KRA network log and traceroute.',
      '',
      'Log:',
      logText,
      traceroute ? `Traceroute:\n${traceroute}` : '',
    ].join('\n');

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `${KRA_SYSTEM_CONTEXT}

Return ONLY valid JSON in exactly this shape (no markdown, no extra text):
{
  "severity": "critical|warning|info",
  "summary": "one sentence overall status",
  "issues": [
    {
      "type": "VPN_TUNNEL_DOWN|CERT_EXPIRY|DNS_FAILURE|MTU_MISMATCH|FIREWALL_BLOCK|DPD_FAILURE|PACKET_LOSS|ROUTING_ISSUE",
      "description": "what is happening",
      "rootCause": "why it is happening",
      "impact": "what services are affected",
      "fix": "step-by-step fix commands",
      "confidence": 90
    }
  ]
}`,
        messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.context[0].text;
    // Strip any accidental markdown code blocks
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

// Chat Assistant
// Conversational assistant that knows the current incident context and can answer follow-up questions about the issue and recommended fixes.
async function chatWithAssistant(messages, activIncidentContext = '') {
    const systemPrompt = activIncidentContext
        ? `${KRA_SYSTEM_CONTEXT}\n\nCurrent Incident Context:\n${activIncidentContext}`
        : KRA_SYSTEM_CONTEXT;

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    return response.context[0].text;
}

module.exports = { analyzeLog, chatWithAssistant };